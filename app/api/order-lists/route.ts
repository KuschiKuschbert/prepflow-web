import { standardAdminChecks } from '@/lib/admin-auth';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrderListWithItems } from './helpers/createOrderListWithItems';
import { handleOrderListError } from './helpers/handleOrderListError';
import { normalizeOrderListData } from './helpers/normalizeOrderListData';
import { OrderListRecord } from './helpers/types';

const createOrderListSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  name: z.string().min(1, 'Order list name is required'),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        ingredient_id: z.string().optional(),
        quantity: z.number().optional(),
        unit: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) throw new Error('Unexpected database state');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 100);
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    if (!userId) {
      return NextResponse.json(
        ApiErrorHandler.createError('User ID is required', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    const {
      data,
      error: dbError,
      count,
    } = await supabase
      .from('order_lists')
      .select(
        `
        *,
        suppliers (
          id,
          supplier_name,
          contact_person,
          phone,
          email
        ),
        order_list_items (
          id,
          ingredient_id,
          quantity,
          unit,
          notes,
          ingredients (
            id,
            ingredient_name,
            name,
            unit,
            category
          )
        )
      `,
        { count: 'exact' },
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (dbError) {
      logger.error('[Order Lists API] Database error fetching lists:', {
        error: dbError.message,
        code: dbError.code,
        context: { endpoint: '/api/order-lists', operation: 'GET', table: 'order_lists' },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(dbError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    // Normalize nested ingredient_name
    const items = normalizeOrderListData((data || []) as unknown as OrderListRecord[]);

    return NextResponse.json({
      success: true,
      data: items,
      page,
      pageSize,
      total: count || 0,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Order Lists API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/order-lists', method: 'GET' },
    });
    return handleOrderListError(err, 'GET');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, error } = await standardAdminChecks(request);
    if (error) return error;
    if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 }); // Handle missing supabase

    const parsed = await parseAndValidate(request, createOrderListSchema, '[OrderLists]');
    if (!parsed.ok) return parsed.response;
    const { userId, supplierId, name, notes, items } = parsed.data;

    // Convert supplierId from string to number
    const supplierIdNum = parseInt(supplierId, 10);
    if (isNaN(supplierIdNum)) {
      return NextResponse.json(
        ApiErrorHandler.createError('Invalid supplier ID', 'VALIDATION_ERROR', 400),
        { status: 400 },
      );
    }

    // Transform items array from schema format (snake_case) to function format (camelCase)
    const transformedItems =
      items
        ?.map(item => ({
          ingredientId: item.ingredient_id || '',
          quantity: item.quantity || 0,
          unit: item.unit || '',
          notes: item.notes,
        }))
        .filter(item => item.ingredientId) || undefined;

    const orderList = await createOrderListWithItems(
      supabase,
      {
        user_id: userId,
        supplier_id: supplierIdNum,
        name,
        notes,
      },
      transformedItems,
    );

    return NextResponse.json({
      success: true,
      message: 'Order list created successfully',
      data: orderList,
    });
  } catch (err: unknown) {
    logger.error('[Order Lists API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/order-lists', method: 'POST' },
    });
    if (err && typeof err === 'object' && 'status' in err && typeof err.status === 'number') {
      return NextResponse.json(err, { status: err.status });
    }
    return handleOrderListError(err, 'POST');
  }
}

// PUT and DELETE moved to /api/order-lists/[id]
