import { ApiErrorHandler } from '@/lib/api-error-handler';
import { getAuthenticatedUserByEmail } from '@/lib/api-helpers/getAuthenticatedUserByEmail';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createQualificationWithUser } from './helpers/createQualification';
import { createQualificationSchema, QUALIFICATION_SELECT } from './helpers/schemas';

/**
 * GET /api/employees/[id]/qualifications
 * Get all qualifications for an employee
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const { userId, supabaseAdmin: supabase } = await getAuthenticatedUserByEmail(request);

    // Filter by user_id and employee_id to ensure ownership
    const { data, error: fetchError } = await supabase
      .from('employee_qualifications')
      .select(QUALIFICATION_SELECT)
      .eq('employee_id', id)
      .eq('user_id', userId)
      .order('expiry_date', { ascending: true, nullsFirst: false });

    if (fetchError) {
      logger.error('[Employee Qualifications API] Database error fetching qualifications:', {
        error: fetchError.message,
        code: fetchError.code,
        context: {
          endpoint: '/api/employees/[id]/qualifications',
          operation: 'GET',
          table: 'employee_qualifications',
          employee_id: id,
        },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(fetchError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Employee Qualifications API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/employees/[id]/qualifications', method: 'GET' },
    });

    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }

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

/**
 * POST /api/employees/[id]/qualifications
 * Add a qualification to an employee
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { userId, supabaseAdmin: supabase } = await getAuthenticatedUserByEmail(request);

    const parsed = await parseAndValidate(
      request,
      createQualificationSchema,
      '[Employee Qualifications API]',
    );
    if (!parsed.ok) return parsed.response;

    const result = await createQualificationWithUser(supabase, id, parsed.data, userId);
    if ('error' in result) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Employee Qualifications API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/employees/[id]/qualifications', method: 'POST' },
    });

    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }

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
