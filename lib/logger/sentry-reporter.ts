/**
 * Lightweight Sentry integration helpers for the logger.
 * Uses dynamic require so the logger works without Sentry configured.
 */

import type { ErrorContext } from './logEntry';

/**
 * Report an error or message to Sentry if available.
 */
export function reportToSentry(error: Error | string, context?: ErrorContext): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/nextjs') as typeof import('@sentry/nextjs');
    if (!Sentry || typeof Sentry.captureException !== 'function') return;

    if (error instanceof Error) {
      Sentry.withScope(scope => {
        if (context) scope.setContext('logger', context as Record<string, unknown>);
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureMessage(String(error), 'error');
    }
  } catch {
    // Sentry not available — ignore silently
  }
}

/**
 * Add a warning breadcrumb to Sentry if available.
 */
export function addSentryBreadcrumb(message: string, context?: ErrorContext | unknown): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/nextjs') as typeof import('@sentry/nextjs');
    if (!Sentry || typeof Sentry.addBreadcrumb !== 'function') return;
    Sentry.addBreadcrumb({
      level: 'warning',
      message,
      data: context as Record<string, unknown> | undefined,
    });
  } catch {
    // Sentry not available — ignore silently
  }
}
