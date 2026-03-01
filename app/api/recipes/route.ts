/**
 * Recipes API Routes
 *
 * 📚 Square Integration: This route automatically triggers Square sync hooks after recipe
 * create/update operations. See `docs/SQUARE_API_REFERENCE.md` (Automatic Sync section) for details.
 */

import { ApiErrorHandler } from '@/lib/api-error-handler';
import { getAuthenticatedUser } from '@/lib/server/get-authenticated-user';
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { buildQuery } from './helpers/buildQuery';
import { catchRecipesHandler } from './helpers/catchHandler';
import { filterRecipes } from './helpers/filterRecipes';
import { resolveCreateOrUpdate } from './helpers/handleRecipeCreateOrUpdate';
import { safeParseBody } from '@/lib/api/parse-request-body';
import { CreateRecipeInput, createRecipeSchema, RecipeResponse } from './helpers/schemas';
import { validateRequest } from './helpers/validateRequest';

export async function GET(request: NextRequest) {
  try {
    const { userId, supabase: supabaseAdmin } = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const params = validateRequest(searchParams);

    const { data: recipes, error, count } = await buildQuery(supabaseAdmin, params, userId);

    if (error) {
      logger.error('[Recipes API] Database error fetching recipes:', {
        error: error.message,
        code: error.code,
        context: { endpoint: '/api/recipes', operation: 'GET', table: 'recipes' },
      });
      const apiError = ApiErrorHandler.fromSupabaseError(error, 500);
      return NextResponse.json(apiError, { status: apiError.status || 500 });
    }

    const filteredRecipes = await filterRecipes(recipes || [], params.includeAllergens);

    return NextResponse.json({
      success: true,
      recipes: filteredRecipes,
      count: count || 0,
      page: params.page,
      pageSize: params.pageSize,
    } satisfies RecipeResponse);
  } catch (err) {
    return catchRecipesHandler(err, 'GET');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await safeParseBody(request);

    const validationResult = createRecipeSchema.safeParse(body);
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

    const recipeData = validationResult.data as CreateRecipeInput;
    const { userId } = await getAuthenticatedUser(request);

    return await resolveCreateOrUpdate(request, recipeData, userId);
  } catch (err) {
    return catchRecipesHandler(err, 'POST');
  }
}
