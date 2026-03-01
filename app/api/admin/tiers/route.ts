import { requireAdmin } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createTier, tierConfigSchema } from './helpers/createTier';
import { deleteTier } from './helpers/deleteTier';
import { fetchTiers } from './helpers/fetchTiers';
import { updateTier } from './helpers/updateTier';

/**
 * GET /api/admin/tiers
 * List all tier configurations
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser;

    const result = await fetchTiers();
    if (result instanceof NextResponse) return result;

    return NextResponse.json({ tiers: result.tiers });
  } catch (error) {
    logger.error('[Admin Tiers] Unexpected error:', error);
    return NextResponse.json(
      ApiErrorHandler.createError('Internal server error', 'SERVER_ERROR', 500),
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/tiers
 * Create new tier (future expansion)
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser;

    const body = await safeParseBody(request);
    if (!body) {
      return NextResponse.json(
        ApiErrorHandler.createError('Invalid request body', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    const validationResult = tierConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          validationResult.error.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
          validationResult.error.issues,
        ),
        { status: 400 },
      );
    }

    const result = await createTier(validationResult.data, adminUser, request);
    if (result instanceof NextResponse) return result;

    return NextResponse.json({ tier: result.tier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          error.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }
    logger.error('[Admin Tiers] Unexpected error:', error);
    return NextResponse.json(
      ApiErrorHandler.createError('Internal server error', 'SERVER_ERROR', 500),
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/tiers
 * Update tier configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser;

    const body = await safeParseBody(request);
    if (!body) {
      return NextResponse.json(
        ApiErrorHandler.createError('Invalid request body', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    const validationResult = tierConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          validationResult.error.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
          validationResult.error.issues,
        ),
        { status: 400 },
      );
    }

    const { tier_slug, ...updates } = validationResult.data;

    const result = await updateTier(tier_slug, updates, adminUser, request);
    if (result instanceof NextResponse) return result;

    return NextResponse.json({ tier: result.tier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          error.issues[0]?.message || 'Invalid request body',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }
    logger.error('[Admin Tiers] Unexpected error:', error);
    return NextResponse.json(
      ApiErrorHandler.createError('Internal server error', 'SERVER_ERROR', 500),
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/tiers
 * Disable tier (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser;

    const { searchParams } = new URL(request.url);
    const tierSlug = searchParams.get('tier_slug');

    if (!tierSlug) {
      return NextResponse.json(
        ApiErrorHandler.createError('tier_slug is required', 'BAD_REQUEST', 400),
        { status: 400 },
      );
    }

    const result = await deleteTier(tierSlug, adminUser, request);
    if (result instanceof NextResponse) return result;

    return NextResponse.json({ tier: result.tier });
  } catch (error) {
    logger.error('[Admin Tiers] Unexpected error:', error);
    return NextResponse.json(
      ApiErrorHandler.createError('Internal server error', 'SERVER_ERROR', 500),
      { status: 500 },
    );
  }
}
