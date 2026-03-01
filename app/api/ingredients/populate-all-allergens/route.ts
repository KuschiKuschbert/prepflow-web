/**
 * Populate All Allergens API Endpoint
 * POST /api/ingredients/populate-all-allergens
 * Admin-only endpoint to automatically detect and populate allergens for all ingredients
 * that don't have manual allergens set
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { requireAuth } from '@/lib/auth0-api-helpers';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processAllBatches } from './helpers/batchRunner';
import { fetchAndFilterIngredients } from './helpers/ingredientFetcher';
import { checkRateLimit } from './helpers/rateLimit';

const populateAllAllergensSchema = z.object({
  dry_run: z.boolean().optional().default(false),
  batch_size: z.number().int().positive().optional().default(50),
  force_ai: z.boolean().optional().default(false),
});

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
          'Rate limit exceeded. This operation can only be run once per hour.',
          'RATE_LIMIT_ERROR',
          429,
        ),
        { status: 429 },
      );
    }

    const body = await safeParseBody(request);
    const validationResult = populateAllAllergensSchema.safeParse(body || {});

    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError('Invalid request body', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    const { dry_run = false, batch_size = 50, force_ai = false } = validationResult.data;

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const { allIngredients, ingredientsToProcess } = await fetchAndFilterIngredients(supabaseAdmin);

    if (allIngredients.length === 0) {
      return NextResponse.json({
        success: true,
        data: { total: 0, processed: 0, successful: 0, failed: 0, skipped: 0, results: [] },
      });
    }

    if (dry_run) {
      return NextResponse.json({
        success: true,
        dry_run: true,
        data: {
          total: allIngredients.length,
          to_process: ingredientsToProcess.length,
          skipped: allIngredients.length - ingredientsToProcess.length,
          preview: ingredientsToProcess.slice(0, 10).map(ing => ({
            id: ing.id,
            ingredient_name: ing.ingredient_name,
            brand: ing.brand,
            current_allergens: ing.allergens || [],
          })),
        },
      });
    }

    const { successful, failed, results } = await processAllBatches(
      ingredientsToProcess,
      batch_size,
      force_ai,
    );

    const skipped = allIngredients.length - ingredientsToProcess.length;
    return NextResponse.json({
      success: true,
      data: {
        total: allIngredients.length,
        processed: ingredientsToProcess.length,
        successful,
        failed,
        skipped,
        results: results.slice(0, 100),
      },
    });
  } catch (err) {
    logger.error('[Populate All Allergens] Error:', err);
    return NextResponse.json(
      ApiErrorHandler.createError(
        'Failed to populate allergens',
        'SERVER_ERROR',
        500,
        err instanceof Error ? err.message : String(err),
      ),
      { status: 500 },
    );
  }
}
