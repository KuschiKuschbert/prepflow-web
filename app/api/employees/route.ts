import { ApiErrorHandler } from '@/lib/api-error-handler';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { getAuthenticatedUser } from '@/lib/server/get-authenticated-user';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createEmployee } from './helpers/createEmployee';
import { handleDeleteEmployee } from './helpers/deleteEmployeeHandler';
import { handleEmployeeError } from './helpers/handleEmployeeError';
import { createEmployeeSchema, EMPLOYEE_SELECT, updateEmployeeSchema } from './helpers/schemas';
import { updateEmployee } from './helpers/updateEmployee';

/**
 * GET /api/employees
 * List all employees with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    let query = supabase.from('employees').select(EMPLOYEE_SELECT).order('full_name');

    // Filter by user_id
    query = query.eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }
    if (role) {
      query = query.eq('role', role);
    }

    const { data: employees, error: fetchError } = await query;

    if (fetchError) {
      const pgError = fetchError as PostgrestError;
      logger.error('[Employees API] Database error fetching employees:', {
        error: pgError.message,
        code: pgError.code,
        context: {
          endpoint: '/api/employees',
          operation: 'GET',
          table: 'employees',
        },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(fetchError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    return NextResponse.json({
      success: true,
      data: employees || [],
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Employees API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/employees', method: 'GET' },
    });
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }
    return handleEmployeeError(err, 'GET');
  }
}

/**
 * POST /api/employees
 * Create a new employee
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);

    const parsed = await parseAndValidate(request, createEmployeeSchema, '[Employees]');
    if (!parsed.ok) return parsed.response;

    const data = await createEmployee(supabase, parsed.data, userId);

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      data,
    });
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

    logger.error('[Employees API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/employees', method: 'POST' },
    });
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }
    return handleEmployeeError(err, 'POST');
  }
}

/**
 * PUT /api/employees
 * Update an employee
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);

    const parsed = await parseAndValidate(request, updateEmployeeSchema, '[Employees]');
    if (!parsed.ok) return parsed.response;
    const { id, ...updates } = parsed.data;

    const data = await updateEmployee(supabase, id, updates, userId);

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data,
    });
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

    logger.error('[Employees API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/employees', method: 'PUT' },
    });
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }
    return handleEmployeeError(err, 'PUT');
  }
}

/**
 * DELETE /api/employees
 * Delete (deactivate) an employee
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId, supabase } = await getAuthenticatedUser(request);
    return handleDeleteEmployee(request, supabase, userId);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }
    return handleEmployeeError(err, 'DELETE');
  }
}
