import { logAdminApiAction } from '@/lib/admin-audit';
import { requireAdmin } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { safeParseBody } from '@/lib/api/parse-request-body';
import {
  deleteFeatureFlag,
  handleRouteError,
  updateFeatureFlag,
  updateFlagSchema,
} from './controller';

export async function PUT(request: NextRequest, context: { params: Promise<{ flag: string }> }) {
  try {
    const adminUser = await requireAdmin(request);
    const { flag } = await context.params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    const body = await request.json();
    const validated = updateFlagSchema.parse(body);

    const result = await updateFeatureFlag(flag, validated);
    if (result instanceof NextResponse) return result;

    const { flagData } = result;

    await logAdminApiAction(adminUser, 'update_feature_flag', request, {
      target_type: 'feature_flag',
      target_id: flagData.id,
      details: { flag_key: flag, enabled: validated.enabled },
    });

    return NextResponse.json({
      success: true,
      flag: flagData,
    });
  } catch (error) {
    logger.error('[Admin Features] PUT error:', { error });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        ApiErrorHandler.createError('Invalid request data', 'VALIDATION_ERROR', 400, error.issues),
        { status: 400 },
      );
    }
    return handleRouteError(error, { endpoint: '/api/admin/features/[flag]', method: 'PUT' });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ flag: string }> }) {
  try {
    const adminUser = await requireAdmin(request);
    const { flag } = await context.params;

    const body = await safeParseBody(request);
    const userId = (body as { user_id?: string | null }).user_id || null;

    const error = await deleteFeatureFlag(flag, userId);
    if (error) return error;

    await logAdminApiAction(adminUser, 'delete_feature_flag', request, {
      target_type: 'feature_flag',
      target_id: flag,
      details: { flag_key: flag },
    });

    return NextResponse.json({
      success: true,
      message: 'Feature flag deleted successfully',
    });
  } catch (error) {
    logger.error('[Admin Features] DELETE error:', { error });
    return handleRouteError(error, { endpoint: '/api/admin/features/[flag]', method: 'DELETE' });
  }
}
