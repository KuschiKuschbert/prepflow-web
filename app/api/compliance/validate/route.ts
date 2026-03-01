/**
 * Compliance Validation API Route
 * Validates shifts against Australian hospitality compliance rules.
 *
 * @module api/compliance/validate
 */

import { standardAdminChecks } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateComplianceSchema } from './helpers/schemas';
import { performComplianceValidation } from './helpers/validateCompliance';

/**
 * POST /api/compliance/validate
 * Validate a shift against compliance rules.
 */
export async function POST(request: NextRequest) {
  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await safeParseBody(request);
    const validationResult = validateComplianceSchema.safeParse(body || {});

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

    const result = await performComplianceValidation(supabase, validationResult.data);
    if ('error' in result) {
      return NextResponse.json(result.error, { status: result.status });
    }

    return NextResponse.json(result);
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

    logger.error('[Compliance API] Validation error:', err);
    return NextResponse.json(
      ApiErrorHandler.createError(
        'Internal server error',
        'SERVER_ERROR',
        500,
        err instanceof Error ? err.message : String(err),
      ),
      { status: 500 },
    );
  }
}
