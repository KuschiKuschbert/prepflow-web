/**
 * Availability API Route
 * Handles GET (list availability) and POST (create/update availability) operations.
 *
 * @module api/staff/availability
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { getAuthenticatedUser } from '@/lib/server/get-authenticated-user';
import { NextRequest, NextResponse } from 'next/server';
import { createAvailabilitySchema } from './helpers/schemas';

/**
 * GET /api/staff/availability
 * List availability records with optional filters.
 *
 * Query parameters:
 * - employee_id: Filter by employee ID
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');

    let query = supabase.from('availability').select('*').order('day_of_week', { ascending: true });

    // Filter by user_id
    // Note: Availability table might not have user_id derived directly if it relies on employee_id relation,
    // but based on our migration plan, we added user_id to ALL tables.
    // If availability is joined with employees, we could filter via employees, but user_id column is safer/faster.
    query = query.eq('user_id', userId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data: availability, error: dbError } = await query;

    if (dbError) {
      logger.error('[Availability API] Database error fetching availability:', {
        error: dbError.message,
        code: dbError.code,
        context: { endpoint: '/api/staff/availability', operation: 'GET', table: 'availability' },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(dbError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    return NextResponse.json({
      success: true,
      availability: availability || [],
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Availability API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/staff/availability', method: 'GET' },
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
 * POST /api/staff/availability
 * Create or update availability record (upsert).
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);

    const parsed = await parseAndValidate(request, createAvailabilitySchema, '[StaffAvailability]');
    if (!parsed.ok) return parsed.response;
    const { employee_id, day_of_week, start_time, end_time, is_available } = parsed.data;

    // Check if employee exists and belongs to user
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', employee_id)
      .eq('user_id', userId)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        ApiErrorHandler.createError('Employee not found', 'NOT_FOUND', 404),
        { status: 404 },
      );
    }

    const availabilityData = {
      employee_id,
      day_of_week,
      start_time: start_time || null,
      end_time: end_time || null,
      is_available: is_available !== undefined ? is_available : true,
      user_id: userId,
    };

    // Upsert (insert or update) availability record
    const { data: availability, error: upsertError } = await supabase
      .from('availability')
      .upsert(availabilityData, { onConflict: 'employee_id,day_of_week' })
      .select()
      .single();

    if (upsertError) {
      logger.error('[Availability API] Database error upserting availability:', {
        error: upsertError.message,
        code: upsertError.code,
        context: {
          endpoint: '/api/staff/availability',
          operation: 'POST',
          employeeId: employee_id,
        },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(upsertError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    return NextResponse.json({
      success: true,
      availability,
      message: 'Availability saved successfully',
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Availability API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/staff/availability', method: 'POST' },
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
