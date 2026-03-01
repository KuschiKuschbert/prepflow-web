import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createNewMenu, fetchMenuCounts } from './helpers/helpers';
import { Menu, createMenuSchema } from './helpers/schemas';

import { getAuthenticatedUser } from '@/lib/server/get-authenticated-user';

export async function GET(request: NextRequest) {
  try {
    const { userId, supabase: supabaseAdmin } = await getAuthenticatedUser(request);

    const {
      data: menus,
      error,
      count,
    } = await supabaseAdmin
      .from('menus')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('[Menus API] Database error fetching menus:', {
        error: error.message,
        code: error.code,
        context: { endpoint: '/api/menus', operation: 'GET', table: 'menus' },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(error, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    // Fetch menu items count for each menu
    const menusWithCounts = await fetchMenuCounts(supabaseAdmin, menus || []);

    return NextResponse.json({
      success: true,
      menus: menusWithCounts,
      count: count || 0,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (ApiErrorHandler.isApiError(err)) {
      return NextResponse.json(ApiErrorHandler.toResponseData(err), {
        status: ApiErrorHandler.getStatus(err),
      });
    }

    logger.error('[Menus API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/menus', method: 'GET' },
    });

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

export async function POST(request: NextRequest) {
  try {
    // Authenticate first
    const { userId, supabase: supabaseAdmin } = await getAuthenticatedUser(request);

    const body = await safeParseBody(request);

    const validationResult = createMenuSchema.safeParse(body);
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

    const { menu_name, description, menu_type, food_per_person_kg, expected_guests } =
      validationResult.data;

    const newMenu = await createNewMenu(
      supabaseAdmin,
      menu_name,
      userId,
      description ?? undefined,
      menu_type,
      food_per_person_kg,
      expected_guests ?? undefined,
    );

    return NextResponse.json({
      success: true,
      menu: newMenu as Menu,
      message: 'Menu created successfully',
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          err.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }
    if (ApiErrorHandler.isApiError(err)) {
      return NextResponse.json(ApiErrorHandler.toResponseData(err), {
        status: ApiErrorHandler.getStatus(err),
      });
    }

    logger.error('[Menus API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/menus', method: 'POST' },
    });

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
