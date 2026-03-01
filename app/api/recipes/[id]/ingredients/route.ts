import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { backfillMissingIngredients } from './helpers/backfillMissingIngredients';
import { fetchIngredientsWithCategoryFallback } from './helpers/fetchIngredients';
import { handleRecipeIngredientsError } from './helpers/handleRecipeIngredientsError';
import { mapRecipeIngredients } from './helpers/mapRecipeIngredients';
import { saveRecipeIngredients } from './helpers/saveRecipeIngredients';
import type { RecipeIngredientRow, SaveRecipeIngredientInput } from './helpers/types';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  let normalizedId: string | undefined;
  try {
    const { id } = await context.params;
    const recipeId = id;
    if (!recipeId) {
      return NextResponse.json(
        ApiErrorHandler.createError('Recipe ID is required', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    normalizedId = String(recipeId).trim();

    // First try with category, fallback without if column doesn't exist
    const { data: fetchedData, error: fetchError } = await fetchIngredientsWithCategoryFallback(
      supabaseAdmin,
      normalizedId,
    );

    const data = fetchedData;
    const error = fetchError;

    if (error) {
      logger.error('[Recipes API] Database error fetching recipe ingredients:', {
        error: error.message,
        code: error.code,
        context: {
          endpoint: '/api/recipes/[id]/ingredients',
          operation: 'GET',
          recipeId: normalizedId,
        },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(error, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    if (!data || data.length === 0) {
      logger.debug('[Recipes API] No recipe_ingredients found', {
        context: { endpoint: '/api/recipes/[id]/ingredients', recipeId: normalizedId },
      });
      return NextResponse.json({ items: [] });
    }

    // Backfill missing nested ingredients and map to normalized format
    const rows = await backfillMissingIngredients(
      (data as unknown as RecipeIngredientRow[]) || [],
      normalizedId,
    );
    const items = mapRecipeIngredients(rows);

    return NextResponse.json({ items });
  } catch (err) {
    logger.error('[Recipes API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: {
        endpoint: '/api/recipes/[id]/ingredients',
        method: 'GET',
        recipeId: normalizedId || 'unknown',
      },
    });
    return handleRecipeIngredientsError(err, 'GET');
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  let recipeId: string | undefined;
  try {
    const { id } = await context.params;
    recipeId = id;
    const body = await safeParseBody(request);
    const { ingredients, isUpdate } = (body || {}) as {
      ingredients: SaveRecipeIngredientInput[];
      isUpdate?: boolean;
    };

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        ApiErrorHandler.createError('Ingredients array is required', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const { fetchRecipeMetadata } = await import('./helpers/fetchRecipeMetadata');
    const { userEmail, recipeName } = await fetchRecipeMetadata(request, recipeId);

    const data = await saveRecipeIngredients(
      recipeId,
      ingredients,
      !!isUpdate,
      recipeName,
      userEmail,
    );

    return NextResponse.json({
      success: true,
      message: 'Recipe ingredients saved successfully',
      data,
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
      context: {
        endpoint: '/api/recipes/[id]/ingredients',
        method: 'POST',
        recipeId: recipeId || 'unknown',
      },
    });
    return handleRecipeIngredientsError(err, 'POST');
  }
}
