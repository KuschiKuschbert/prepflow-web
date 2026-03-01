/**
 * Roster Templates API Route
 * Handles GET (list templates) and POST (create template) operations.
 *
 * @module api/roster/templates
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { parseAndValidate } from '@/lib/api/parse-request-body';
import { logger } from '@/lib/logger';
import { getAuthenticatedUserByEmail } from '@/lib/api-helpers/getAuthenticatedUserByEmail';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GET /api/roster/templates
 * List roster templates with optional filters.
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, supabaseAdmin } = await getAuthenticatedUserByEmail(request);
    const supabase = supabaseAdmin;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');

    let query = supabase.from('roster_templates').select('*', { count: 'exact' });

    // Filter by user_id
    query = query.eq('user_id', userId);

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    query = query.order('created_at', { ascending: false });

    const { data: templates, error: dbError, count } = await query;

    if (dbError) {
      logger.error('[Templates API] Database error fetching templates:', {
        error: dbError.message,
        code: dbError.code,
        context: { endpoint: '/api/roster/templates', operation: 'GET', table: 'roster_templates' },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(dbError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
      count: count || 0,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Templates API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/roster/templates', method: 'GET' },
    });

    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }

    return NextResponse.json(
      ApiErrorHandler.createError(
        process.env.NODE_ENV === 'development'
          ? err instanceof Error
            ? err.message
            : 'Unknown error'
          : 'Internal server error',
        'SERVER_ERROR',
        500,
      ),
      { status: 500 },
    );
  }
}

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
});

/**
 * POST /api/roster/templates
 * Create a new roster template.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, supabaseAdmin } = await getAuthenticatedUserByEmail(request);
    const supabase = supabaseAdmin;

    const parsed = await parseAndValidate(request, createTemplateSchema, '[RosterTemplates]');
    if (!parsed.ok) return parsed.response;
    const { name, description, is_active } = parsed.data;

    const templateData = {
      name,
      description: description || null,
      is_active: is_active !== undefined ? is_active : true,
      user_id: userId,
    };

    const { data: template, error: insertError } = await supabase
      .from('roster_templates')
      .insert(templateData)
      .select()
      .single();

    if (insertError) {
      logger.error('[Templates API] Database error creating template:', {
        error: insertError.message,
        code: insertError.code,
        context: { endpoint: '/api/roster/templates', operation: 'POST', templateName: name },
      });

      const apiError = ApiErrorHandler.fromSupabaseError(insertError, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    return NextResponse.json({
      success: true,
      template,
      message: 'Template created successfully',
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;

    logger.error('[Templates API] Unexpected error:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      context: { endpoint: '/api/roster/templates', method: 'POST' },
    });

    if (err && typeof err === 'object' && 'status' in err) {
      return NextResponse.json(err, { status: (err as { status: number }).status || 500 });
    }

    return NextResponse.json(
      ApiErrorHandler.createError(
        process.env.NODE_ENV === 'development'
          ? err instanceof Error
            ? err.message
            : 'Unknown error'
          : 'Internal server error',
        'SERVER_ERROR',
        500,
      ),
      { status: 500 },
    );
  }
}
