/**
 * Recipe API Routes (by ID)
 *
 * 📚 Square Integration: This route automatically triggers Square sync hooks after recipe
 * update operations. See `docs/SQUARE_API_REFERENCE.md` (Automatic Sync section) for details.
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { triggerRecipeSync } from '@/lib/square/sync/hooks';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleDeleteRecipe } from './helpers/deleteRecipeHandler';
import { enrichRecipeWithAllergens } from './helpers/enrichRecipeWithAllergens';
import { handleRecipeUpdate } from './helpers/handleRecipeUpdate';
import { updateRecipeSchema } from './helpers/schemas';
import { validateRecipeUpdate } from './helpers/validateRecipeUpdate';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const recipeId = id;

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const { data: recipe, error: fetchError } = await supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (fetchError || !recipe) {
      return NextResponse.json(ApiErrorHandler.createError('Recipe not found', 'NOT_FOUND', 404), {
        status: 404,
      });
    }

    const enrichedRecipe = await enrichRecipeWithAllergens(recipeId, recipe);

    return NextResponse.json({
      success: true,
      recipe: enrichedRecipe,
    });
  } catch (err) {
    logger.error('[Recipes API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/recipes/[id]', method: 'GET' },
    });
    return NextResponse.json(
      ApiErrorHandler.createError(
        process.env.NODE_ENV === 'development'
          ? err instanceof Error
            ? err.message
            : 'Unknown error'
          : 'Internal server error',
        'SERVER_ERROR',
        500,
      ),
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const recipeId = id;

    const body = await safeParseBody(request);

    const validationResult = updateRecipeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          validationResult.error.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }

    const { name } = validationResult.data;

    const validationError = await validateRecipeUpdate(recipeId, name);
    if (validationError) return validationError;

    const updatedRecipe = await handleRecipeUpdate(recipeId, validationResult.data, request);

    // Trigger Square sync hook (non-blocking)
    (async () => {
      try {
        await triggerRecipeSync(request, recipeId, 'update');
      } catch (err) {
        logger.error('[Recipes API] Error triggering Square sync:', {
          error: err instanceof Error ? err.message : String(err),
          recipeId,
        });
      }
    })();

    return NextResponse.json({
      success: true,
      recipe: updatedRecipe,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          err.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }
    logger.error('[Recipes API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/recipes/[id]', method: 'PUT' },
    });

    const apiError = ApiErrorHandler.fromSupabaseError(err, 500);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return handleDeleteRecipe(id);
}
