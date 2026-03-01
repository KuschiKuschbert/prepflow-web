import { logAdminApiAction } from '@/lib/admin-audit';
import { standardAdminChecks } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteUser } from './helpers/deleteUser';
import { fetchUser } from './helpers/fetchUser';
import { handleUserApiError } from './helpers/handleError';
import { updateUser } from './helpers/updateUser';

const updateUserSchema = z.object({
  first_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  business_name: z.string().max(255).optional().nullable(),
  subscription_status: z.enum(['trial', 'active', 'cancelled', 'past_due']).optional(),
  subscription_expires: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/admin/users/[id]
 * Get user details
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await standardAdminChecks(request);
    if (error) return error;

    const { id } = await context.params;

    const result = await fetchUser(id);
    if (result instanceof NextResponse) return result;

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    logger.error('[route.ts] Error in catch block:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return handleUserApiError(error, 'GET');
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { adminUser, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!adminUser) throw new Error('Unexpected authentication state');

    const { id } = await context.params;

    const body = await safeParseBody(request);
    if (!body) {
      return NextResponse.json(
        ApiErrorHandler.createError('Invalid request body', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    const validationResult = updateUserSchema.safeParse(body);
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

    const result = await updateUser(id, validationResult.data);
    if (result instanceof NextResponse) return result;

    // Log admin action
    await logAdminApiAction(adminUser, 'update_user', request, {
      target_type: 'user',
      target_id: id,
      details: { changes: result.validated },
    });

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    logger.error('[route.ts] Error in catch block:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return handleUserApiError(error, 'PUT');
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user
 */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { adminUser, error } = await standardAdminChecks(request, true); // Critical op
    if (error) return error;
    if (!adminUser) throw new Error('Unexpected authentication state');

    const { id } = await context.params;

    const result = await deleteUser(id);
    if (result instanceof NextResponse) return result;

    // Log admin action
    await logAdminApiAction(adminUser, 'delete_user', request, {
      target_type: 'user',
      target_id: id,
      details: {},
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('[route.ts] Error in catch block:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return handleUserApiError(error, 'DELETE');
  }
}
