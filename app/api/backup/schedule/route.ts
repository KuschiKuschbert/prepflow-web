/**
 * POST /api/backup/schedule - Configure scheduled backups
 * DELETE /api/backup/schedule - Cancel scheduled backups
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { requireAuth } from '@/lib/auth0-api-helpers';
import { logger } from '@/lib/logger';
import { createSupabaseAdmin } from '@/lib/supabase';
import { getAppError } from '@/lib/utils/error';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const scheduleBackupSchema = z.object({
  intervalHours: z.number().int().min(1).max(8760).optional(),
  enabled: z.boolean().optional(),
  autoUploadToDrive: z.boolean().optional(),
});

const DEFAULT_INTERVAL_HOURS = 24;
const MS_IN_HOUR = 60 * 60 * 1000;

/**
 * Configures scheduled backups.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user?.email) {
      return NextResponse.json(ApiErrorHandler.createError('Unauthorized', 'UNAUTHORIZED', 401), {
        status: 401,
      });
    }

    const userId = user.email;
    const body = await safeParseBody(request);

    const validationResult = scheduleBackupSchema.safeParse(body || {});
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

    const { intervalHours, enabled, autoUploadToDrive } = validationResult.data;
    const supabase = createSupabaseAdmin();

    const interval = intervalHours || DEFAULT_INTERVAL_HOURS;
    const nextBackupAt = new Date(Date.now() + interval * MS_IN_HOUR);

    const { error } = await supabase.from('backup_schedules').upsert(
      {
        user_id: userId,
        interval_hours: interval,
        enabled: enabled !== undefined ? enabled : true,
        auto_upload_to_drive: autoUploadToDrive !== undefined ? autoUploadToDrive : false,
        next_backup_at: enabled ? nextBackupAt.toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      logger.error('[Backup Schedule] Database error:', error.message);
      throw ApiErrorHandler.fromSupabaseError(error, 500);
    }

    return NextResponse.json({
      success: true,
      message: 'Backup schedule updated',
      nextBackupAt: enabled ? nextBackupAt.toISOString() : null,
    });
  } catch (error: unknown) {
    const appError = getAppError(error);
    logger.error('[Backup Schedule] Error:', { error: appError.message });
    return NextResponse.json(ApiErrorHandler.createError(appError.message, 'INTERNAL_ERROR', 500), {
      status: 500,
    });
  }
}

/**
 * Cancels scheduled backups.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user?.email) {
      return NextResponse.json(ApiErrorHandler.createError('Unauthorized', 'UNAUTHORIZED', 401), {
        status: 401,
      });
    }

    const userId = user.email;
    const supabase = createSupabaseAdmin();

    const { error } = await supabase.from('backup_schedules').delete().eq('user_id', userId);
    if (error) throw ApiErrorHandler.fromSupabaseError(error, 500);

    return NextResponse.json({ success: true, message: 'Backup schedule cancelled' });
  } catch (error: unknown) {
    const appError = getAppError(error);
    logger.error('[Backup Schedule] Error:', { error: appError.message });
    return NextResponse.json(ApiErrorHandler.createError(appError.message, 'INTERNAL_ERROR', 500), {
      status: 500,
    });
  }
}
