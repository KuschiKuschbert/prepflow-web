import { standardAdminChecks } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildTemperatureLogQuery } from './helpers/buildTemperatureLogQuery';
import { createTemperatureLog } from './helpers/createTemperatureLog';
import { handleTemperatureLogError } from './helpers/handleTemperatureLogError';

const createTemperatureLogSchema = z
  .object({
    temperature_celsius: z.number(),
    equipment_id: z.string().optional(),
    temperature_type: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    logged_at: z.string().optional(),
  })
  .refine(data => data.equipment_id || data.temperature_type, {
    message: 'Either equipment_id or temperature_type must be provided',
    path: ['equipment_id'],
  });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const dateFrom = searchParams.get('date_from') || searchParams.get('dateFrom');
  const dateTo = searchParams.get('date_to') || searchParams.get('dateTo');
  const type = searchParams.get('type');
  const location = searchParams.get('location');
  const equipmentId = searchParams.get('equipment_id');
  const limit = searchParams.get('limit');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = limit ? parseInt(limit, 10) : parseInt(searchParams.get('pageSize') || '20', 10);

  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) throw new Error('Unexpected database state');

    const {
      data,
      error: dbError,
      count,
    } = await buildTemperatureLogQuery(
      supabase,
      { date, dateFrom, dateTo, type, location, equipmentId },
      page,
      pageSize,
    );

    if (dbError) {
      logger.error('[Temperature Logs API] Database error fetching logs:', {
        error: dbError.message,
        code: dbError.code,
        context: { endpoint: '/api/temperature-logs', operation: 'GET', table: 'temperature_logs' },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(dbError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      success: true,
      data: {
        items: data || [],
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (err: unknown) {
    logger.error('[Temperature Logs API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/temperature-logs', method: 'GET' },
    });
    // Type guard for ApiError-like objects
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status });
    }
    return handleTemperatureLogError(err, 'GET');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const parsed = await parseAndValidate(request, createTemperatureLogSchema, '[TemperatureLogs]');
    if (!parsed.ok) return parsed.response;
    const validatedBody = parsed.data;

    // Validate temperature range (reasonable values)
    if (validatedBody.temperature_celsius < -50 || validatedBody.temperature_celsius > 200) {
      return NextResponse.json(
        ApiErrorHandler.createError('Temperature out of reasonable range', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    const data = await createTemperatureLog(supabase, validatedBody);

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    if (err instanceof NextResponse) return err;

    logger.error('[Temperature Logs API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/temperature-logs', method: 'POST' },
    });
    // Type guard for ApiError-like objects
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status });
    }
    return handleTemperatureLogError(err, 'POST');
  }
}
