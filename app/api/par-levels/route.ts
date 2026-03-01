import { standardAdminChecks } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { checkTableExists } from './helpers/checkTableExists';
import { createParLevel } from './helpers/createParLevel';
import { deleteParLevel } from './helpers/deleteParLevel';
import { fetchParLevels } from './helpers/fetchParLevels';
import { handleParLevelError } from './helpers/handleParLevelError';
import { createParLevelSchema, updateParLevelSchema } from './helpers/schemas';
import { updateParLevel } from './helpers/updateParLevel';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and setup Supabase
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) throw new Error('Unexpected database state');

    // Check if table exists
    const { exists: _exists, error: tableError } = await checkTableExists(supabase);
    if (tableError) {
      return tableError;
    }

    // Fetch par levels
    const { data, error: fetchError } = await fetchParLevels(supabase);
    if (fetchError) {
      return fetchError;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Par Levels API] Unexpected error in GET:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      errorType: err?.constructor?.name,
      errorDetails: err,
    });

    // If it's already a NextResponse, return it
    if (err && typeof err === 'object' && 'status' in err && 'json' in err) {
      return err as NextResponse;
    }

    return handleParLevelError(err, 'GET');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const parsed = await parseAndValidate(request, createParLevelSchema, '[ParLevels]');
    if (!parsed.ok) return parsed.response;
    const data = await createParLevel(supabase, parsed.data);

    return NextResponse.json({
      success: true,
      message: 'Par level created successfully',
      data,
    });
  } catch (err: unknown) {
    if (err instanceof NextResponse) return err;

    logger.error('[Par Levels API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/par-levels', method: 'POST' },
    });
    if (
      err &&
      typeof err === 'object' &&
      'status' in err &&
      typeof (err as { status: unknown }).status === 'number'
    ) {
      return NextResponse.json(err, { status: (err as { status: number }).status });
    }
    return handleParLevelError(err, 'POST');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const parsed = await parseAndValidate(request, updateParLevelSchema, '[ParLevels]');
    if (!parsed.ok) return parsed.response;
    const { id, ...updates } = parsed.data;
    const data = await updateParLevel(supabase, id, updates);

    return NextResponse.json({
      success: true,
      message: 'Par level updated successfully',
      data,
    });
  } catch (err: unknown) {
    if (err instanceof NextResponse) return err;

    logger.error('[Par Levels API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/par-levels', method: 'PUT' },
    });
    if (
      err &&
      typeof err === 'object' &&
      'status' in err &&
      typeof (err as { status: unknown }).status === 'number'
    ) {
      return NextResponse.json(err, { status: (err as { status: number }).status });
    }
    return handleParLevelError(err, 'PUT');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        ApiErrorHandler.createError('Par level ID is required', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    await deleteParLevel(supabase, id);

    return NextResponse.json({
      success: true,
      message: 'Par level deleted successfully',
    });
  } catch (err: unknown) {
    logger.error('[Par Levels API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/par-levels', method: 'DELETE' },
    });
    if (err && typeof err === 'object' && 'status' in err && typeof err.status === 'number') {
      return NextResponse.json(err, { status: err.status });
    }
    return handleParLevelError(err, 'DELETE');
  }
}
