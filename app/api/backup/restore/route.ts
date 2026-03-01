/**
 * POST /api/backup/restore
 * Restore from backup (full, selective, or merge).
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { requireAuth } from '@/lib/auth0-api-helpers';
import { restoreFull, restoreMerge, restoreSelective } from '@/lib/backup/restore';
import type { BackupData, MergeOptions } from '@/lib/backup/types';
import { logger } from '@/lib/logger';
import { getAppError } from '@/lib/utils/error';
import { safeParseBody } from '@/lib/api/parse-request-body';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processRestoreRequest } from './helpers/processRestore';

const restoreBackupSchema = z.object({
  backupId: z.string().optional(),
  backupFile: z.string().optional(),
  mode: z.enum(['full', 'selective', 'merge']),
  tables: z.array(z.string()).optional(),
  options: z
    .object({
      skipExisting: z.boolean().optional(),
      mergeStrategy: z.enum(['replace', 'skip', 'merge']).optional(),
    })
    .optional(),
  password: z.string().optional(),
});

/**
 * Restores from backup (full, selective, or merge).
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

    const validationResult = restoreBackupSchema.safeParse(body || {});
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

    const { backupId, backupFile, mode, tables, options, password } = validationResult.data;

    if (mode === 'selective' && (!tables || tables.length === 0)) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'tables array is required for selective restore',
          'BAD_REQUEST',
          400,
        ),
        { status: 400 },
      );
    }

    let backupData;

    if (backupFile) {
      const result = await processRestoreRequest(request, backupFile, password);
      if (!result.success) {
        return result.response;
      }
      backupData = result.data as BackupData;
    } else if (backupId) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'Loading backup by ID not yet implemented',
          'NOT_IMPLEMENTED',
          501,
        ),
        { status: 501 },
      );
    } else {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'Either backupId or backupFile is required',
          'BAD_REQUEST',
          400,
        ),
        { status: 400 },
      );
    }

    if (backupData.userId !== userId) {
      return NextResponse.json(
        ApiErrorHandler.createError('Backup ownership mismatch', 'FORBIDDEN', 403),
        { status: 403 },
      );
    }

    logger.info(`[Backup Restore] Starting ${mode} restore for user ${userId}`);

    let restoreResult;
    if (mode === 'full') {
      restoreResult = await restoreFull(userId, backupData);
    } else if (mode === 'selective') {
      restoreResult = await restoreSelective(userId, backupData, tables || []);
    } else {
      restoreResult = await restoreMerge(userId, backupData, options as MergeOptions);
    }

    return NextResponse.json({
      success: restoreResult.success,
      message: restoreResult.success ? 'Restore successful' : 'Restore failed',
      result: restoreResult,
    });
  } catch (error: unknown) {
    const appError = getAppError(error);
    logger.error('[Backup Restore] Error:', { error: appError.message });
    return NextResponse.json(ApiErrorHandler.createError(appError.message, 'INTERNAL_ERROR', 500), {
      status: 500,
    });
  }
}
