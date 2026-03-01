import { ApiErrorHandler } from '@/lib/api-error-handler';
import { groupBy } from '@/lib/api/batch-utils';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { handleMissingNestedIngredients } from './helpers/missing-ingredients';
import { batchRecipeIdsSchema } from './helpers/schemas';
import { BatchIngredientData, BatchRecipeIngredientRow } from './helpers/types';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const body = await safeParseBody(request);
    const parseResult = batchRecipeIdsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          parseResult.error.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }

    const normalizedIds = parseResult.data.recipeIds.map(id => id.trim()).filter(Boolean);

    if (normalizedIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch all recipe ingredients in a single query
    const { data, error } = await supabaseAdmin
      .from('recipe_ingredients')
      .select(
        `
        id,
        recipe_id,
        ingredient_id,
        quantity,
        unit,
        ingredients (
          id,
          ingredient_name,
          unit,
          cost_per_unit,
          trim_peel_waste_percentage,
          yield_percentage
        )
      `,
      )
      .in('recipe_id', normalizedIds);

    if (error) {
      logger.error('[Recipes API] Database error fetching batch recipe ingredients:', {
        error: error.message,
        code: error.code,
        context: {
          endpoint: '/api/recipes/ingredients/batch',
          operation: 'POST',
          recipeCount: normalizedIds.length,
        },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(error, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    // If no data, return empty grouped results
    if (!data || data.length === 0) {
      const grouped: Record<string, unknown[]> = {};
      normalizedIds.forEach(id => {
        grouped[id] = [];
      });
      return NextResponse.json({ items: grouped });
    }

    // Server-side fallback: if nested ingredients join is missing/null for some rows,
    // do a bulk lookup from ingredients and merge to ensure uniform shape
    let rows: BatchRecipeIngredientRow[] = data as unknown as BatchRecipeIngredientRow[];
    rows = await handleMissingNestedIngredients(supabaseAdmin, rows);

    // Normalize and format items
    const items = rows.map((row: BatchRecipeIngredientRow) => {
      const ing: BatchIngredientData = row.ingredients || ({} as BatchIngredientData);
      return {
        id: row.id,
        recipe_id: row.recipe_id,
        ingredient_id: row.ingredient_id,
        quantity: row.quantity,
        unit: row.unit,
        ingredients: {
          id: ing.id,
          // Use ingredient_name as the canonical field
          ingredient_name: ing.ingredient_name || 'Unknown',
          cost_per_unit: ing.cost_per_unit,
          unit: ing.unit || row.unit || null,
          trim_peel_waste_percentage: ing.trim_peel_waste_percentage,
          yield_percentage: ing.yield_percentage,
        },
      };
    });

    // Group by recipe_id
    const grouped = groupBy(items, item => item.recipe_id);

    // Ensure all requested recipe IDs are in the response (even if empty)
    normalizedIds.forEach(id => {
      if (!grouped[id]) {
        grouped[id] = [];
      }
    });

    return NextResponse.json({ items: grouped });
  } catch (err) {
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
      context: { endpoint: '/api/recipes/ingredients/batch', method: 'POST' },
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
