import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const reorderMenuItemsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, 'Item ID is required'),
        category: z.string().min(1, 'Category is required'),
        position: z.number().int().nonnegative('Position must be a non-negative integer'),
      }),
    )
    .min(1, 'Items array must contain at least one item'),
});
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const menuId = id;

    if (!menuId) {
      return NextResponse.json(
        ApiErrorHandler.createError('Menu ID is required', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    const body = await safeParseBody(request);

    const validationResult = reorderMenuItemsSchema.safeParse(body);
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

    const { items } = validationResult.data;

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'Database connection could not be established',
          'DATABASE_ERROR',
          500,
        ),
        { status: 500 },
      );
    }

    // Update all items in a transaction-like manner
    const updates = items.map((item: { id: string; category: string; position: number }) =>
      supabaseAdmin!
        .from('menu_items')
        .update({
          category: item.category,
          position: item.position,
        })
        .eq('id', item.id)
        .eq('menu_id', menuId),
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      logger.error('Error reordering menu items:', errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to reorder some items',
          message: 'Some menu items could not be reordered',
          details: errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Menu items reordered successfully',
    });
  } catch (err) {
    logger.error('Unexpected error:', err);
    return NextResponse.json(
      ApiErrorHandler.createError(
        err instanceof Error ? err.message : 'Unknown error',
        'SERVER_ERROR',
        500,
      ),
      { status: 500 },
    );
  }
}
