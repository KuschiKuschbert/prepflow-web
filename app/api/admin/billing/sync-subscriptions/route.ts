import { logAdminApiAction } from '@/lib/admin-audit';
import { standardAdminChecks } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { syncAllSubscriptions } from '@/lib/billing-sync';
import { logger } from '@/lib/logger';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const syncSubscriptionsSchema = z.object({
  limit: z.number().int().positive().optional().default(100),
});

/**
 * POST /api/admin/billing/sync-subscriptions
 * Admin endpoint to sync all subscriptions from Stripe.
 * Useful for recovery after webhook failures.
 *
 * @param {NextRequest} req - Request object
 * @param {Object} req.body - Request body (optional)
 * @param {number} [req.body.limit] - Maximum number of subscriptions to sync (default: 100)
 * @returns {Promise<NextResponse>} Sync report
 */
export async function POST(req: NextRequest) {
  try {
    const { adminUser, error } = await standardAdminChecks(req, true); // Sync can be resource intensive, marking as critical
    if (error) return error;
    if (!adminUser) throw new Error('Unexpected authentication state');

    const body = await safeParseBody(req);
    const validationResult = syncSubscriptionsSchema.safeParse(body);
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

    const { limit } = validationResult.data;

    logger.info('[Admin Billing Sync] Starting subscription sync:', {
      adminEmail: adminUser.email,
      limit,
    });

    const result = await syncAllSubscriptions(limit);

    await logAdminApiAction(adminUser, 'sync_subscriptions', req, {
      target_type: 'system',
      details: {
        limit,
        synced: result.synced,
        errors: result.errors,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${result.synced} subscriptions with ${result.errors} errors`,
      synced: result.synced,
      errors: result.errors,
      report: result.report,
    });
  } catch (error) {
    logger.error('[route.ts] Error in catch block:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const apiError = ApiErrorHandler.fromException(
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}
