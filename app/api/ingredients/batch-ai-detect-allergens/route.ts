/**
 * Batch AI Allergen Detection API Endpoint
 * POST /api/ingredients/batch-ai-detect-allergens
 * Admin-only endpoint for batch processing ingredients without allergens
 */

import { enrichIngredientWithAllergens } from '@/lib/allergens/ai-allergen-detection';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { requireAuth } from '@/lib/auth0-api-helpers';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const batchDetectAllergensSchema = z.object({
  ingredient_ids: z.array(z.string()).min(1, 'ingredient_ids must be a non-empty array'),
});
// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 batch requests per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (userLimit.count >= RATE_LIMIT_MAX) return false;
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user?.email) {
      return NextResponse.json(ApiErrorHandler.createError('Unauthorized', 'AUTH_ERROR', 401), {
        status: 401,
      });
    }
    const userId = user.email;
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'Rate limit exceeded. Give it another go in a moment, chef.',
          'RATE_LIMIT_ERROR',
          429,
        ),
        { status: 429 },
      );
    }

    const body = await safeParseBody(request);

    const validationResult = batchDetectAllergensSchema.safeParse(body);
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

    const { ingredient_ids } = validationResult.data;
    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const { data: ingredients, error: fetchError } = await supabaseAdmin
      .from('ingredients')
      .select('id, ingredient_name, brand, allergens, allergen_source')
      .in('id', ingredient_ids)
      .or('allergens.is.null,allergens.eq.[]');
    if (fetchError) {
      logger.error('[Batch AI Detection] Failed to fetch ingredients:', {
        error: fetchError.message,
      });
      return NextResponse.json(
        ApiErrorHandler.createError('Failed to fetch ingredients', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }
    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          successful: 0,
          failed: 0,
          skipped: ingredient_ids.length,
          results: [],
        },
      });
    }

    const results: Array<{
      ingredient_id: string;
      status: 'success' | 'failed' | 'skipped';
      allergens?: string[];
      error?: string;
    }> = [];

    let successful = 0;
    let failed = 0;
    let skipped = 0;
    for (const ingredient of ingredients) {
      try {
        const hasManualAllergens =
          ingredient.allergens &&
          Array.isArray(ingredient.allergens) &&
          ingredient.allergens.length > 0 &&
          ingredient.allergen_source &&
          typeof ingredient.allergen_source === 'object' &&
          (ingredient.allergen_source as { manual?: boolean }).manual;
        if (hasManualAllergens) {
          skipped++;
          results.push({ ingredient_id: ingredient.id, status: 'skipped' });
          continue;
        }
        const enriched = await enrichIngredientWithAllergens({
          ingredient_name: ingredient.ingredient_name,
          brand: ingredient.brand || undefined,
          allergens: (ingredient.allergens as string[]) || [],
          allergen_source: (ingredient.allergen_source as { manual?: boolean; ai?: boolean }) || {},
        });
        const { error: updateError } = await supabaseAdmin
          .from('ingredients')
          .update({
            allergens: enriched.allergens,
            allergen_source: enriched.allergen_source,
          })
          .eq('id', ingredient.id);
        if (updateError) throw updateError;
        successful++;
        results.push({
          ingredient_id: ingredient.id,
          status: 'success',
          allergens: enriched.allergens,
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        failed++;
        logger.error('[Batch AI Detection] Failed to process ingredient:', {
          ingredient_id: ingredient.id,
          error: err instanceof Error ? err.message : String(err),
        });
        results.push({
          ingredient_id: ingredient.id,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        successful,
        failed,
        skipped,
        results,
      },
    });
  } catch (err) {
    logger.error('[Batch AI Detection] Error:', err);
    return NextResponse.json(
      ApiErrorHandler.createError(
        'Failed to batch detect allergens',
        'SERVER_ERROR',
        500,
        err instanceof Error ? err.message : String(err),
      ),
      { status: 500 },
    );
  }
}
