import { standardAdminChecks } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleBreachReportError } from './helpers/handleError';
import { logBreachToDatabase } from './helpers/logBreach';
import { sendBreachNotifications } from './helpers/sendNotifications';

const breachReportSchema = z.object({
  breachType: z.enum([
    'unauthorized_access',
    'data_leak',
    'system_compromise',
    'credential_compromise',
    'suspicious_activity',
    'other',
  ]),
  description: z.string().min(10).max(2000),
  affectedUsers: z.array(z.string().email()).min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/admin/security/breach-report
 * Report a security breach (admin only)
 * Automatically triggers 72-hour notification compliance
 *
 * @param {NextRequest} req - Request object
 * @param {Object} req.body - Breach report data
 * @param {string} req.body.breachType - Type of breach
 * @param {string} req.body.description - Description of breach
 * @param {string[]} req.body.affectedUsers - Array of affected user emails
 * @param {Object} [req.body.metadata] - Additional metadata
 * @returns {Promise<NextResponse>} Breach report response
 */
export async function POST(req: NextRequest) {
  try {
    // Critical security operation - strict checks
    const { error } = await standardAdminChecks(req, true);
    if (error) return error;

    const body = await safeParseBody(req);
    const validationResult = breachReportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          validationResult.error.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
          validationResult.error.issues,
        ),
        { status: 400 },
      );
    }

    const { breachType, description, affectedUsers, metadata } = validationResult.data;

    // Log breach to database
    const breachResult = await logBreachToDatabase({
      breachType,
      description,
      affectedUsers,
      metadata,
    });

    if (breachResult instanceof NextResponse) {
      return breachResult;
    }

    const breachData = breachResult;

    logger.warn('[Breach Report API] Breach reported:', {
      breachId: breachData.id,
      breachType,
      affectedUsersCount: affectedUsers.length,
      detectedAt: breachData.detected_at,
    });

    // Immediately notify affected users (within 72-hour window)
    const notificationResults = await sendBreachNotifications({
      breachId: breachData.id,
      breachType,
      description,
      affectedUsers,
      detectedAt: breachData.detected_at,
    });

    return NextResponse.json(
      {
        success: true,
        breachId: breachData.id,
        detectedAt: breachData.detected_at,
        notificationResults: {
          notified: notificationResults.notified,
          failed: notificationResults.failed,
          total: affectedUsers.length,
        },
        message: 'Breach reported and notifications sent',
      },
      { status: 201 },
    );
  } catch (error) {
    return handleBreachReportError(error, 'POST');
  }
}

/**
 * GET /api/admin/security/breach-report
 * Get list of security breaches (admin only)
 *
 * @param {NextRequest} req - Request object
 * @param {URLSearchParams} req.nextUrl.searchParams - Query parameters
 * @param {string} [req.nextUrl.searchParams.status] - Filter by status
 * @param {number} [req.nextUrl.searchParams.limit] - Limit results (default: 50)
 * @returns {Promise<NextResponse>} List of breaches
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, error } = await standardAdminChecks(req);
    if (error) return error;
    if (!supabase) throw new Error('Unexpected database state');

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('security_breaches')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(Math.min(limit, 100)); // Max 100

    if (status) {
      query = query.eq('status', status);
    }

    const { data: breaches, error: fetchError } = await query;

    if (fetchError) {
      logger.error('[Breach Report API] Failed to get breaches:', {
        error: fetchError.message,
        status,
        limit,
      });

      return NextResponse.json(
        ApiErrorHandler.createError('Failed to retrieve breaches', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      breaches: breaches || [],
      count: breaches?.length || 0,
    });
  } catch (error) {
    return handleBreachReportError(error, 'GET');
  }
}
