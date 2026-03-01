import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateMenuSchema } from '../helpers/schemas';
import { buildMenuUpdateData } from './helpers/buildMenuUpdateData';
import { deleteMenu } from './helpers/deleteMenu';
import { fetchMenuWithItems } from './helpers/fetchMenuWithItems';
import { handleMenuError } from './helpers/handleMenuError';
import { updateMenu } from './helpers/updateMenu';
import { validateMenuId } from './helpers/validateMenuId';

import { getAuthenticatedUser } from '@/lib/server/get-authenticated-user';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: menuId } = await context.params;
  try {
    const { userId } = await getAuthenticatedUser(_req);

    const validationError = validateMenuId(menuId);
    if (validationError) return validationError;

    const locked = _req.nextUrl.searchParams.get('locked') === '1';
    const menu = await fetchMenuWithItems(menuId, userId, { locked });

    return NextResponse.json({
      success: true,
      menu,
    });
  } catch (err: unknown) {
    if (err instanceof NextResponse) return err;
    if (ApiErrorHandler.isApiError(err)) {
      return NextResponse.json(ApiErrorHandler.toResponseData(err), {
        status: ApiErrorHandler.getStatus(err),
      });
    }

    logger.error('[Menus API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/menus/[id]', method: 'GET', menuId },
    });
    return handleMenuError(err, 'GET');
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: menuId } = await context.params;
  try {
    const { userId } = await getAuthenticatedUser(request);

    const validationError = validateMenuId(menuId);
    if (validationError) return validationError;

    const body = await safeParseBody(request);

    const validationResult = updateMenuSchema.safeParse(body);
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

    const updateData = buildMenuUpdateData(validationResult.data);
    const updatedMenu = await updateMenu(menuId, updateData, userId);

    return NextResponse.json({
      success: true,
      menu: updatedMenu,
      message: 'Menu updated successfully',
    });
  } catch (err: unknown) {
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
      context: { endpoint: '/api/menus/[id]', method: 'PUT', menuId },
    });
    return handleMenuError(err, 'PUT');
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: menuId } = await context.params;
  try {
    const { userId } = await getAuthenticatedUser(_req);

    const validationError = validateMenuId(menuId);
    if (validationError) return validationError;

    await deleteMenu(menuId, userId);

    return NextResponse.json({
      success: true,
      message: 'Menu deleted successfully',
    });
  } catch (err: unknown) {
    if (err instanceof NextResponse) return err;
    if (ApiErrorHandler.isApiError(err)) {
      return NextResponse.json(ApiErrorHandler.toResponseData(err), {
        status: ApiErrorHandler.getStatus(err),
      });
    }

    logger.error('[Menus API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/menus/[id]', method: 'DELETE', menuId },
    });
    return handleMenuError(err, 'DELETE');
  }
}
