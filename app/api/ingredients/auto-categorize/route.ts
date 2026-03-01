import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { autoDetectCategory } from '@/lib/ingredients/category-detection';
import { logger } from '@/lib/logger';
import { createSupabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const autoCategorizeSchema = z
  .object({
    ingredientIds: z.array(z.string()).optional(),
    useAI: z.boolean().optional().default(true),
    categorizeAll: z.boolean().optional().default(false),
  })
  .refine(
    data => {
      // If categorizeAll is false, ingredientIds must be provided and non-empty
      if (!data.categorizeAll) {
        return data.ingredientIds && data.ingredientIds.length > 0;
      }
      return true;
    },
    {
      message: 'ingredientIds array is required when categorizeAll is false',
      path: ['ingredientIds'],
    },
  );

/**
 * Bulk auto-categorize ingredients.
 * POST /api/ingredients/auto-categorize
 *
 * Body: {
 *   ingredientIds: string[],
 *   useAI?: boolean (default: true)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const body = await safeParseBody(request);

    const validationResult = autoCategorizeSchema.safeParse(body);
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

    const { ingredientIds, useAI = true, categorizeAll = false } = validationResult.data;

    // Build query for uncategorized ingredients
    let query = supabaseAdmin
      .from('ingredients')
      .select('id, ingredient_name, brand, storage_location, category')
      .or('category.is.null,category.eq.');

    // If specific IDs provided, filter by them
    if (!categorizeAll && ingredientIds && ingredientIds.length > 0) {
      query = query.in('id', ingredientIds);
    }

    const { data: ingredients, error: fetchError } = await query;

    // Filter out ingredients that already have categories (client-side filter as backup)
    const uncategorizedIngredients = (ingredients || []).filter(
      ing => !ing.category || ing.category.trim() === '',
    );

    if (fetchError) {
      logger.error('[Auto-Categorize API] Error fetching ingredients:', {
        error: fetchError.message,
        context: { endpoint: '/api/ingredients/auto-categorize', operation: 'POST' },
      });
      return NextResponse.json(ApiErrorHandler.fromSupabaseError(fetchError, 500), { status: 500 });
    }

    if (!uncategorizedIngredients || uncategorizedIngredients.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No ingredients found or all already have categories',
        updated: 0,
      });
    }

    // Detect categories for each ingredient
    const updates: Array<{ id: string; category: string }> = [];

    for (const ingredient of uncategorizedIngredients) {
      // Skip if already has category
      if (ingredient.category) continue;

      try {
        const { category } = await autoDetectCategory(
          ingredient.ingredient_name,
          ingredient.brand || undefined,
          ingredient.storage_location || undefined,
          useAI,
        );

        if (category) {
          updates.push({ id: ingredient.id, category });
        }
      } catch (error) {
        logger.warn('[Auto-Categorize API] Error detecting category for ingredient:', {
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.ingredient_name,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue with other ingredients
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No categories detected',
        updated: 0,
      });
    }

    // Bulk update ingredients
    let updatedCount = 0;
    for (const update of updates) {
      const { error: updateError } = await supabaseAdmin
        .from('ingredients')
        .update({ category: update.category })
        .eq('id', update.id);

      if (updateError) {
        logger.error('[Auto-Categorize API] Error updating ingredient:', {
          ingredient_id: update.id,
          error: updateError.message,
        });
        // Continue with other updates
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully categorized ${updatedCount} ingredient${updatedCount !== 1 ? 's' : ''}`,
      updated: updatedCount,
      total: uncategorizedIngredients.length,
    });
  } catch (err) {
    logger.error('[Auto-Categorize API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/ingredients/auto-categorize', operation: 'POST' },
    });
    return NextResponse.json(
      ApiErrorHandler.createError('Failed to auto-categorize ingredients', 'INTERNAL_ERROR', 500),
      { status: 500 },
    );
  }
}
