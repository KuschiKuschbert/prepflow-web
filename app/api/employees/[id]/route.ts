import { ApiErrorHandler } from '@/lib/api-error-handler';
import { getAuthenticatedUserByEmail } from '@/lib/api-helpers/getAuthenticatedUserByEmail';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { PostgrestError } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteEmployee } from '../helpers/deleteEmployee';
import { handleEmployeeError } from '../helpers/handleEmployeeError';
import { updateEmployee } from '../helpers/updateEmployee';

const updateEmployeeByIdSchema = z.object({
  full_name: z.string().optional(),
  role: z.string().optional(),
  employment_start_date: z.string().optional(),
  employment_end_date: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  emergency_contact: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

const EMPLOYEE_SELECT = `
  *,
  employee_qualifications (
    *,
    qualification_types (
      id,
      name,
      description,
      is_required,
      default_expiry_days
    )
  )
`;

/**
 * GET /api/employees/[id]
 * Get a single employee by ID
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const { userId, supabaseAdmin } = await getAuthenticatedUserByEmail(request);
    const supabase = supabaseAdmin;

    const { data, error: dbError } = await supabase
      .from('employees')
      .select(EMPLOYEE_SELECT)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (dbError) {
      const pgError = dbError as PostgrestError;
      logger.error('[Employees API] Database error fetching employee:', {
        error: pgError.message,
        code: pgError.code,
        context: {
          endpoint: '/api/employees/[id]',
          operation: 'GET',
          table: 'employees',
          employee_id: id,
        },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(dbError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    if (!data) {
      return NextResponse.json(
        ApiErrorHandler.createError('Employee not found', 'NOT_FOUND', 404),
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Employees API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      context: { endpoint: '/api/employees/[id]', method: 'GET', employeeId: id },
    });
    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }
    return handleEmployeeError(err, 'GET');
  }
}

/**
 * PUT /api/employees/[id]
 * Update an employee
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const { userId, supabaseAdmin } = await getAuthenticatedUserByEmail(request);
    const supabase = supabaseAdmin;

    const parsed = await parseAndValidate(request, updateEmployeeByIdSchema, '[EmployeesById]');
    if (!parsed.ok) return parsed.response;

    const data = await updateEmployee(supabase, id, parsed.data, userId);

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      data,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    if (err instanceof Error && 'status' in err) {
      const statusError = err as { status: number; message: string };
      logger.error('[Employees API] Error with status:', {
        error: statusError.message,
        status: statusError.status,
        context: { endpoint: '/api/employees/[id]', method: 'PUT' },
      });
      return NextResponse.json(err, { status: statusError.status });
    }
    return handleEmployeeError(err, 'PUT');
  }
}

/**
 * DELETE /api/employees/[id]
 * Delete (deactivate) an employee
 */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const { userId, supabaseAdmin } = await getAuthenticatedUserByEmail(request);
    const supabase = supabaseAdmin;

    await deleteEmployee(supabase, id, userId);

    return NextResponse.json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    if (err instanceof Error && 'status' in err) {
      const statusError = err as { status: number; message: string };
      logger.error('[Employees API] Error with status:', {
        error: statusError.message,
        status: statusError.status,
        context: { endpoint: '/api/employees/[id]', method: 'DELETE' },
      });
      return NextResponse.json(err, { status: statusError.status });
    }
    return handleEmployeeError(err, 'DELETE');
  }
}
