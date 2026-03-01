/**
 * GET /api/backup/settings - Get backup settings
 * PUT /api/backup/settings - Update backup settings
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { requireAuth } from '@/lib/auth0-api-helpers';
import type { BackupSettings } from '@/lib/backup/types';
import { logger } from '@/lib/logger';
import { createSupabaseAdmin } from '@/lib/supabase';
import { getAppError } from '@/lib/utils/error';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateBackupSettingsSchema = z.object({
  defaultFormat: z.enum(['json', 'sql', 'encrypted']).optional(),
  defaultEncryptionMode: z.enum(['prepflow-only', 'user-password', 'system-key']).optional(),
  scheduledBackupEnabled: z.boolean().optional(),
  scheduledBackupInterval: z.number().int().min(1).max(8760).optional(),
  autoUploadToDrive: z.boolean().optional(),
});

const DEFAULT_SCHEDULE_INTERVAL = 24;

/**
 * Gets backup settings for the current user.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user?.email) {
      return NextResponse.json(ApiErrorHandler.createError('Unauthorized', 'UNAUTHORIZED', 401), {
        status: 401,
      });
    }

    const userId = user.email;
    const supabase = createSupabaseAdmin();

    const { data: schedule } = await supabase
      .from('backup_schedules')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Check if user has Google Drive connected
    const { count: googleTokenCount } = await supabase
      .from('user_google_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const settings: BackupSettings = {
      userId,
      defaultFormat: 'encrypted',
      defaultEncryptionMode: 'prepflow-only',
      scheduledBackupEnabled: schedule?.enabled || false,
      scheduledBackupInterval: schedule?.interval_hours || DEFAULT_SCHEDULE_INTERVAL,
      autoUploadToDrive: schedule?.auto_upload_to_drive || false,
      googleDriveConnected: (googleTokenCount || 0) > 0,
    };

    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    const appError = getAppError(error);
    logger.error('[Backup Settings] Error:', { error: appError.message });
    return NextResponse.json(ApiErrorHandler.createError(appError.message, 'INTERNAL_ERROR', 500), {
      status: 500,
    });
  }
}

/**
 * Updates backup settings for the current user.
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user?.email) {
      return NextResponse.json(ApiErrorHandler.createError('Unauthorized', 'UNAUTHORIZED', 401), {
        status: 401,
      });
    }

    const userId = user.email;
    const body = await safeParseBody(request);

    const validationResult = updateBackupSettingsSchema.safeParse(body || {});
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

    const { scheduledBackupEnabled, scheduledBackupInterval, autoUploadToDrive } =
      validationResult.data;

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from('backup_schedules').upsert(
      {
        user_id: userId,
        enabled: scheduledBackupEnabled !== undefined ? scheduledBackupEnabled : true,
        interval_hours: scheduledBackupInterval || DEFAULT_SCHEDULE_INTERVAL,
        auto_upload_to_drive: autoUploadToDrive !== undefined ? autoUploadToDrive : false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      logger.error('[Backup Settings] Database error:', error.message);
      throw ApiErrorHandler.fromSupabaseError(error, 500);
    }

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error: unknown) {
    const appError = getAppError(error);
    logger.error('[Backup Settings] Error:', { error: appError.message });
    return NextResponse.json(ApiErrorHandler.createError(appError.message, 'INTERNAL_ERROR', 500), {
      status: 500,
    });
  }
}
