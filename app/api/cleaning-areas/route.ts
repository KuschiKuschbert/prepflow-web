import { ApiErrorHandler } from '@/lib/api-error-handler';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { createSupabaseAdmin } from '@/lib/supabase';
import { getAppError } from '@/lib/utils/error';
import { NextRequest, NextResponse } from 'next/server';
import { handleCreateCleaningArea } from './helpers/createCleaningAreaHandler';
import { handleDeleteCleaningArea } from './helpers/deleteCleaningAreaHandler';
import { handleCleaningAreaError } from './helpers/handleCleaningAreaError';
import { updateCleaningAreaSchema } from './helpers/schemas';
import { updateCleaningArea } from './helpers/updateCleaningArea';

async function getAuthenticatedUser(request: NextRequest) {
  const supabaseAdmin = createSupabaseAdmin();

  // Use Auth0 helper (handles AUTH0_BYPASS_DEV and real sessions)
  const { requireAuth } = await import('@/lib/auth0-api-helpers');
  const authUser = await requireAuth(request);

  // Get user_id from email
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', authUser.email)
    .single();

  if (userError || !userData) {
    throw ApiErrorHandler.createError('User not found', 'NOT_FOUND', 404);
  }
  return { userId: userData.id, supabase: supabaseAdmin };
}

/**
 * GET /api/cleaning-areas
 * Get all cleaning areas
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 50));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data,
      error: dbError,
      count,
    } = await supabase
      .from('cleaning_areas')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('area_name')
      .range(from, to);

    if (dbError) {
      logger.error('[Cleaning Areas API] Database error fetching areas:', {
        error: dbError.message,
        code: dbError.code,
        context: { endpoint: '/api/cleaning-areas', operation: 'GET', table: 'cleaning_areas' },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(dbError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (ApiErrorHandler.isApiError(err)) {
      return NextResponse.json(ApiErrorHandler.toResponseData(err), {
        status: ApiErrorHandler.getStatus(err),
      });
    }

    logger.error('[Cleaning Areas API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/cleaning-areas', method: 'GET' },
    });

    return handleCleaningAreaError(err, 'GET');
  }
}

/**
 * POST /api/cleaning-areas
 * Create a new cleaning area
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);
    return handleCreateCleaningArea(supabase, request, userId);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (ApiErrorHandler.isApiError(err)) {
      return NextResponse.json(ApiErrorHandler.toResponseData(err), {
        status: ApiErrorHandler.getStatus(err),
      });
    }
    return handleCleaningAreaError(err, 'POST');
  }
}

/**
 * PUT /api/cleaning-areas
 * Update an existing cleaning area
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);

    const parsed = await parseAndValidate(request, updateCleaningAreaSchema, '[CleaningAreas]');
    if (!parsed.ok) return parsed.response;
    const { id, area_name, description, cleaning_frequency, is_active } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (area_name !== undefined) updateData.area_name = area_name;
    if (description !== undefined) updateData.description = description;
    if (cleaning_frequency !== undefined) updateData.cleaning_frequency = cleaning_frequency;
    if (is_active !== undefined) updateData.is_active = is_active;

    const data = await updateCleaningArea(supabase, id, updateData, userId);

    return NextResponse.json({
      success: true,
      message: 'Cleaning area updated successfully',
      data,
    });
  } catch (err: unknown) {
    if (err instanceof NextResponse) return err;

    const appError = getAppError(err);
    if (appError.status && appError.status !== 500) {
      logger.error('[Cleaning Areas API] Error with status:', {
        error: appError.message,
        status: appError.status,
        context: { endpoint: '/api/cleaning-areas', method: 'PUT' },
      });
      return NextResponse.json(
        { error: appError.message, code: appError.code },
        { status: appError.status },
      );
    }
    return handleCleaningAreaError(err, 'PUT');
  }
}

/**
 * DELETE /api/cleaning-areas
 * Delete a cleaning area
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);
    return handleDeleteCleaningArea(supabase, request, userId);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (ApiErrorHandler.isApiError(err)) {
      return NextResponse.json(ApiErrorHandler.toResponseData(err), {
        status: ApiErrorHandler.getStatus(err),
      });
    }
    return handleCleaningAreaError(err, 'DELETE');
  }
}
