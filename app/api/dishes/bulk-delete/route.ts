import { ApiErrorHandler } from '@/lib/api-error-handler';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bulkDeleteDishesSchema = z.object({
  dishIds: z
    .array(z.string())
    .min(1, 'dishIds array is required and must contain at least one dish ID'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await safeParseBody(request);

    const validationResult = bulkDeleteDishesSchema.safeParse(body);
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

    const { dishIds } = validationResult.data;

    if (!supabaseAdmin) {
      return NextResponse.json(
        ApiErrorHandler.createError('Database connection not available', 'SERVER_ERROR', 500),
        { status: 500 },
      );
    }

    // Check if any dishes are used in menu_items before attempting deletion
    const { data: menuItemsData, error: menuItemsError } = await supabaseAdmin
      .from('menu_items')
      .select('dish_id')
      .in('dish_id', dishIds)
      .limit(1);

    if (menuItemsError) {
      logger.error('Error checking menu items usage:', menuItemsError);
      return NextResponse.json(
        ApiErrorHandler.createError('Failed to check dish usage', 'DATABASE_ERROR', 500, {
          details: menuItemsError.message,
        }),
        { status: 500 },
      );
    }

    const usedInMenuItems = menuItemsData && menuItemsData.length > 0;

    if (usedInMenuItems) {
      return NextResponse.json(
        ApiErrorHandler.createError(
          'One or more dishes are used in menus. Please remove them from all menus first.',
          'VALIDATION_ERROR',
          400,
        ),
        { status: 400 },
      );
    }

    // Delete dish ingredients first (child records)
    const { error: dishIngredientsError } = await supabaseAdmin
      .from('dish_ingredients')
      .delete()
      .in('dish_id', dishIds);

    if (dishIngredientsError) {
      logger.error('Error deleting dish ingredients:', dishIngredientsError);
      return NextResponse.json(
        ApiErrorHandler.createError('Failed to delete dish ingredients', 'DATABASE_ERROR', 500, {
          details: dishIngredientsError.message,
        }),
        { status: 500 },
      );
    }

    // Delete dish recipes (child records)
    const { error: dishRecipesError } = await supabaseAdmin
      .from('dish_recipes')
      .delete()
      .in('dish_id', dishIds);

    if (dishRecipesError) {
      logger.error('Error deleting dish recipes:', dishRecipesError);
      // Don't fail if dish_recipes table doesn't exist or has no records
      if (!dishRecipesError.message.includes('does not exist')) {
        return NextResponse.json(
          ApiErrorHandler.createError('Failed to delete dish recipes', 'DATABASE_ERROR', 500, {
            details: dishRecipesError.message,
          }),
          { status: 500 },
        );
      }
    }

    // Delete dishes
    const { error: dishesError } = await supabaseAdmin.from('dishes').delete().in('id', dishIds);

    if (dishesError) {
      logger.error('Error deleting dishes:', dishesError);
      // Check if it's a foreign key constraint error
      if (
        dishesError.message.includes('foreign key constraint') ||
        dishesError.message.includes('menu_items')
      ) {
        return NextResponse.json(
          ApiErrorHandler.createError(
            'One or more dishes are used in menus. Please remove them from all menus first.',
            'VALIDATION_ERROR',
            400,
          ),
          { status: 400 },
        );
      }
      return NextResponse.json(
        ApiErrorHandler.createError('Failed to delete dishes', 'DATABASE_ERROR', 500, {
          details: dishesError.message,
        }),
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `${dishIds.length} dish${dishIds.length > 1 ? 'es' : ''} deleted successfully`,
    });
  } catch (err) {
    logger.error('Unexpected error:', err);
    return NextResponse.json(
      ApiErrorHandler.createError('Internal server error', 'SERVER_ERROR', 500, {
        details: err instanceof Error ? err.message : 'Unknown error',
      }),
      { status: 500 },
    );
  }
}
