import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const updateFlagSchema = z.object({
  enabled: z.boolean(),
  user_id: z.string().uuid().optional().nullable(),
});

/** Query builder with eq/is filter methods - generic to preserve Supabase chain types */
function applyUserFilter<
  T extends { eq(column: string, value: unknown): T; is(column: string, value: unknown): T },
>(query: T, userId: string | null | undefined): T {
  if (userId !== undefined && userId !== null) {
    return query.eq('user_id', userId);
  }
  return query.is('user_id', null);
}

export function handleRouteError(error: unknown, context: { endpoint: string; method: string }) {
  if (error instanceof NextResponse) {
    return error;
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      ApiErrorHandler.createError('Invalid request data', 'VALIDATION_ERROR', 400, error.issues),
      { status: 400 },
    );
  }

  logger.error('[Admin Features API] Unexpected error:', {
    error: error instanceof Error ? error.message : String(error),
    context,
  });

  return NextResponse.json(
    ApiErrorHandler.createError(
      process.env.NODE_ENV === 'development'
        ? error instanceof Error
          ? error.message
          : 'Unknown error'
        : 'Internal server error',
      'SERVER_ERROR',
      500,
    ),
    { status: 500 },
  );
}

export async function updateFeatureFlag(
  flag: string,
  validated: z.infer<typeof updateFlagSchema>,
): Promise<{ flagData: { id: string; [key: string]: unknown } } | NextResponse> {
  if (!supabaseAdmin) {
    return NextResponse.json(
      ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
      { status: 500 },
    );
  }

  let query = supabaseAdmin
    .from('feature_flags')
    .update({
      enabled: validated.enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('flag_key', flag);

  query = applyUserFilter(query, validated.user_id);

  const { data: flagData, error } = await query.select().single();

  if (error) {
    logger.error('[Admin Features API] Database error updating flag:', {
      error: error.message,
      context: { endpoint: `/api/admin/features/${flag}`, method: 'PUT' },
    });

    return NextResponse.json(
      ApiErrorHandler.createError('Failed to update feature flag', 'DATABASE_ERROR', 500, {
        supabaseError: error.message,
      }),
      { status: 500 },
    );
  }

  return { flagData };
}

export async function deleteFeatureFlag(
  flag: string,
  userId: string | null,
): Promise<NextResponse | null> {
  if (!supabaseAdmin) {
    return NextResponse.json(
      ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
      { status: 500 },
    );
  }

  let query = supabaseAdmin.from('feature_flags').delete().eq('flag_key', flag);
  query = applyUserFilter(query, userId);

  const { error } = await query;

  if (error) {
    logger.error('[Admin Features API] Database error deleting flag:', {
      error: error.message,
      context: { endpoint: `/api/admin/features/${flag}`, method: 'DELETE' },
    });

    return NextResponse.json(
      ApiErrorHandler.createError('Failed to update feature flag', 'DATABASE_ERROR', 500, {
        supabaseError: error.message,
      }),
      { status: 500 },
    );
  }
  return null;
}
