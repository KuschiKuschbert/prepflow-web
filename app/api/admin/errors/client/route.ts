import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildErrorContext } from './helpers/buildErrorContext';
import { getUserIdFromRequest } from './helpers/getUserId';
import { handleAutoReport } from './helpers/handleAutoReport';

const clientErrorSchema = z.object({
  message: z.string(),
  source: z.string().optional(),
  lineno: z.number().optional(),
  colno: z.number().optional(),
  stack: z.string().optional(),
  filename: z.string().optional(),
  error: z
    .object({
      message: z.string(),
      stack: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string(),
});

/**
 * POST /api/admin/errors/client
 * Receive client-side errors and store in admin_error_logs table
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const body = await safeParseBody(request);

    // Validate request body
    const validationResult = clientErrorSchema.safeParse(body || {});
    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'Invalid error data',
          'VALIDATION_ERROR',
          400,
          validationResult.error.issues,
        ),
        { status: 400 },
      );
    }

    const errorData = validationResult.data;

    // Get user session to associate error with user
    const userId = await getUserIdFromRequest(request);

    // Build error context with severity and category
    const errorContext = buildErrorContext(errorData);

    // Store error in database
    const { data: insertedError, error: dbError } = await supabaseAdmin
      .from('admin_error_logs')
      .insert({
        user_id: userId, // Associate error with user if authenticated
        endpoint: errorData.url || null,
        error_message: errorContext.message,
        stack_trace: errorContext.stackTrace,
        context: errorContext.context,
        severity: errorContext.severity,
        category: errorContext.category,
        status: 'new',
      })
      .select('id')
      .single();

    if (dbError) {
      logger.error('[Client Error API] Database error:', {
        error: dbError.message,
        context: { endpoint: '/api/admin/errors/client', method: 'POST' },
      });

      return NextResponse.json(
        ApiErrorHandler.createError('Failed to store error log', 'DATABASE_ERROR', 500, {
          supabaseError: dbError.message,
        }),
        { status: 500 },
      );
    }

    // Handle auto-reporting for critical/safety errors
    if (userId && insertedError) {
      await handleAutoReport(userId, insertedError.id, errorContext.severity);
    }

    return NextResponse.json({
      success: true,
      message: 'Error logged successfully',
      error_id: insertedError?.id,
    });
  } catch (error) {
    logger.error('[Client Error API] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      context: { endpoint: '/api/admin/errors/client', method: 'POST' },
    });

    return NextResponse.json(
      ApiErrorHandler.createError(
        process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : 'Internal server error',
        'SERVER_ERROR',
        500,
      ),
      { status: 500 },
    );
  }
}
