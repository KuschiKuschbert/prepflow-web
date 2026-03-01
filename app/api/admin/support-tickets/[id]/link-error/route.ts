import { standardAdminChecks } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const linkErrorSchema = z.object({
  error_id: z.string().uuid(),
});

/**
 * POST /api/admin/support-tickets/[id]/link-error
 * Link ticket to an error log
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) throw new Error('Unexpected database state');

    const { id } = await context.params;
    const body = await safeParseBody(request);

    if (!body) {
      return NextResponse.json(
        ApiErrorHandler.createError('Invalid request body', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    // Validate request body
    const validationResult = linkErrorSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'Invalid request data',
          'VALIDATION_ERROR',
          400,
          validationResult.error.issues,
        ),
        { status: 400 },
      );
    }

    const { error_id } = validationResult.data;

    return await verifyErrorAndLinkTicket(id, error_id, supabase);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    logger.error('[Admin Support Tickets API] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      context: { endpoint: `/api/admin/support-tickets/[id]/link-error`, method: 'POST' },
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

async function verifyErrorAndLinkTicket(
  id: string,
  error_id: string,
  supabase: SupabaseClient,
): Promise<NextResponse> {
  // Verify error exists
  const { data: errorLog, error: errorCheck } = await supabase
    .from('admin_error_logs')
    .select('id')
    .eq('id', error_id)
    .single();

  if (errorCheck || !errorLog) {
    if (errorCheck && errorCheck.code !== 'PGRST116') {
      logger.warn('[Admin Support Tickets API] Error checking error log:', {
        error: errorCheck.message,
        code: errorCheck.code,
        error_id,
      });
    }
    return NextResponse.json(ApiErrorHandler.createError('Error log not found', 'NOT_FOUND', 404), {
      status: 404,
    });
  }

  // Update ticket with related_error_id
  const { data: ticket, error: updateDbError } = await supabase
    .from('support_tickets')
    .update({ related_error_id: error_id })
    .eq('id', id)
    .select()
    .single();

  if (updateDbError) {
    if (updateDbError.code === 'PGRST116') {
      return NextResponse.json(ApiErrorHandler.createError('Ticket not found', 'NOT_FOUND', 404), {
        status: 404,
      });
    }

    logger.error('[Admin Support Tickets API] Database error:', {
      error: updateDbError.message,
      context: { endpoint: `/api/admin/support-tickets/${id}/link-error`, method: 'POST' },
    });

    return NextResponse.json(ApiErrorHandler.fromSupabaseError(updateDbError, 500), {
      status: 500,
    });
  }

  return NextResponse.json({
    success: true,
    ticket,
    message: 'Ticket linked to error log successfully',
  });
}
