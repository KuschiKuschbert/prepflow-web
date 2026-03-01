import { createShareRecord } from '@/app/api/recipe-share/helpers/createShareRecord';
import { fetchRecipeWithIngredients } from '@/app/api/recipe-share/helpers/fetchRecipeWithIngredients';
import { generateRecipePDF } from '@/app/api/recipe-share/helpers/generateRecipePDF';
import { normalizeRecipeForShare } from '@/app/api/recipe-share/helpers/normalizeRecipeForShare';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bulkShareSchema = z.object({
  recipeIds: z
    .array(z.string().uuid('Recipe ID must be a valid UUID'))
    .min(1, 'Recipe IDs array is required and must contain at least one recipe ID'),
  shareType: z.enum(['email', 'link', 'pdf']),
  recipientEmail: z.string().email('Invalid email address').optional(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await safeParseBody(request);

    const zodValidation = bulkShareSchema.safeParse(body);
    if (!zodValidation.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          zodValidation.error.issues[0]?.message || 'Invalid request data',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }

    const { recipeIds, shareType, recipientEmail, notes } = zodValidation.data;

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const results: Array<{
      recipeId: string;
      success: boolean;
      shareRecord?: Record<string, unknown>; // Better than any
      pdfContent?: string;
      error?: string;
    }> = [];

    // Process each recipe
    for (const recipeId of recipeIds) {
      try {
        // Fetch recipe with ingredients
        const recipe = await fetchRecipeWithIngredients(recipeId);

        // Create share record (convert null to undefined)
        const shareRecord = await createShareRecord({
          recipe_id: recipeId,
          share_type: shareType,
          recipient_email: recipientEmail,
          notes: notes ?? undefined,
        });

        // Normalize and generate PDF
        const normalized = normalizeRecipeForShare(recipe);
        const pdfContent = generateRecipePDF(normalized);

        results.push({
          recipeId,
          success: true,
          shareRecord: shareRecord as Record<string, unknown>,
          pdfContent,
        });
      } catch (error) {
        const errObj = error instanceof Error ? error : new Error(String(error));
        logger.error(`[Bulk Share API] Error sharing recipe ${recipeId}:`, {
          error: errObj.message,
          recipeId,
        });

        results.push({
          recipeId,
          success: false,
          error: errObj.message || 'Failed to share recipe',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Shared ${successCount} recipe${
        successCount > 1 ? 's' : ''
      } successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results,
      summary: {
        total: recipeIds.length,
        successful: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    const errObj = error instanceof Error ? error : new Error(String(error));

    logger.error('[Bulk Share API] Unexpected error:', {
      error: errObj.message,
      stack: errObj.stack,
      context: { endpoint: '/api/recipes/bulk-share', method: 'POST' },
    });

    // Handle generic errors that might have a status property (like from an upstream service)
    const errWithStatus = error as { status?: number; message?: string };
    if (errWithStatus.status) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          errWithStatus.message || 'Request failed',
          'CLIENT_ERROR',
          errWithStatus.status,
        ),
        { status: errWithStatus.status },
      );
    }

    return NextResponse.json(
      ApiErrorHandler.createError(
        process.env.NODE_ENV === 'development'
          ? errObj.message || 'Unknown error'
          : 'Internal server error',
        'SERVER_ERROR',
        500,
      ),
      { status: 500 },
    );
  }
}
