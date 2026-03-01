import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateDishSchema } from '../helpers/schemas';
import { enrichDishWithAllergens } from './helpers/enrichDishWithAllergens';
import { fetchDishWithRelations } from './helpers/fetchDishWithRelations';
import { handleDishError } from './helpers/handleDishError';
import { handlePutRequest } from './helpers/handlePutRequest';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(ApiErrorHandler.createError('Missing dish id', 'BAD_REQUEST', 400), {
        status: 400,
      });
    }

    const dish = await fetchDishWithRelations(id);
    const enrichedDish = await enrichDishWithAllergens(dish, id);

    return NextResponse.json({
      success: true,
      dish: enrichedDish,
    });
  } catch (err) {
    logger.error('[route.ts] Error in catch block:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    return handleDishError(err, 'GET');
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: dishId } = await context.params;
  try {
    if (!dishId) {
      return NextResponse.json(
        ApiErrorHandler.createError('Dish ID is required', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    const body = await safeParseBody(request);

    const validationResult = updateDishSchema.safeParse(body);
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

    return handlePutRequest(request, dishId);
  } catch (err) {
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
    logger.error('[route.ts] Error in catch block:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    return handleDishError(err, 'PUT', dishId);
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: dishId } = await context.params;

    if (!dishId) {
      return NextResponse.json(
        ApiErrorHandler.createError('Dish ID is required', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'DATABASE_ERROR', 500),
        { status: 500 },
      );
    }

    // Delete dish (cascade will handle related records)
    const { error } = await supabaseAdmin.from('dishes').delete().eq('id', dishId);

    if (error) {
      logger.error('[Dishes API] Database error deleting dish:', {
        error: error.message,
        code: error.code,
        context: { endpoint: '/api/dishes/[id]', operation: 'DELETE', dishId },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(error, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Dish deleted successfully',
    });
  } catch (err) {
    logger.error('[route.ts] Error in catch block:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    return handleDishError(err, 'DELETE');
  }
}
