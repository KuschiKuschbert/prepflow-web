import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Diagnostic endpoint for Auth0 configuration
 * Helps diagnose production login issues without exposing secrets
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const adminKey = request.headers.get('x-admin-key');
    if (!adminKey || adminKey !== process.env.SEED_ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const auth0BaseUrl = process.env.AUTH0_BASE_URL;
  const expectedCallbackUrl = auth0BaseUrl ? `${auth0BaseUrl}/api/auth/callback` : 'NOT SET';

  // Check if AUTH0_BASE_URL is set correctly for production
  const isProduction = process.env.NODE_ENV === 'production';
  const isCorrectProductionUrl = isProduction && auth0BaseUrl === 'https://www.prepflow.org';

  // Get request origin for comparison
  const requestOrigin = request.headers.get('origin') || request.nextUrl.origin;

  const diagnostics: {
    environment: string;
    auth0BaseUrl: string;
    expectedCallbackUrl: string;
    requestOrigin: string;
    isCorrectProductionUrl: boolean;
    auth0Configured: boolean;
    auth0SecretSet: boolean;
    issues: string[];
    actualRedirectUri?: string;
    providerCallbackURL?: string;
    providerCheckError?: string;
  } = {
    environment: process.env.NODE_ENV,
    auth0BaseUrl: auth0BaseUrl || 'NOT SET',
    expectedCallbackUrl,
    requestOrigin,
    isCorrectProductionUrl,
    auth0Configured: Boolean(
      process.env.AUTH0_ISSUER_BASE_URL &&
      process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_CLIENT_SECRET,
    ),
    auth0SecretSet: Boolean(process.env.AUTH0_SECRET),
    issues: [],
  };

  // Check for common issues
  if (!auth0BaseUrl) {
    diagnostics.issues.push('AUTH0_BASE_URL is not set');
  } else if (isProduction && !isCorrectProductionUrl) {
    diagnostics.issues.push(
      `AUTH0_BASE_URL is "${auth0BaseUrl}" but should be "https://www.prepflow.org" for production`,
    );
  }

  if (auth0BaseUrl && auth0BaseUrl.endsWith('/')) {
    diagnostics.issues.push('AUTH0_BASE_URL has trailing slash (should not)');
  }

  if (requestOrigin.includes('prepflow.org') && !requestOrigin.includes('www.prepflow.org')) {
    diagnostics.issues.push('Request is from non-www domain - middleware should redirect to www');
  }

  // Log diagnostics (safe - no secrets)
  // Check if we can get the current session
  try {
    const { auth0 } = await import('@/lib/auth0');
    const session = await auth0.getSession(request);
    diagnostics.actualRedirectUri = session ? 'Session active' : 'No session';
    diagnostics.providerCallbackURL = expectedCallbackUrl;
  } catch (error) {
    logger.error('[Auth Debug] Error checking provider:', {
      error: error instanceof Error ? error.message : String(error),
      context: { endpoint: '/api/debug/auth', method: 'GET' },
    });
    diagnostics.providerCheckError = error instanceof Error ? error.message : String(error);
  }

  logger.info('[Auth Debug] Configuration check:', {
    environment: diagnostics.environment,
    auth0BaseUrlSet: Boolean(auth0BaseUrl),
    isCorrectProductionUrl,
    requestOrigin,
    issuesCount: diagnostics.issues.length,
    actualRedirectUri: diagnostics.actualRedirectUri,
  });

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
