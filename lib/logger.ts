/** Logger utilities - re-exported from specialized modules. */

import { detectCategory } from './error-detection/category-detector';
import { detectSeverity } from './error-detection/severity-detector';
import { createLogEntry, formatLogEntry, type ErrorContext } from './logger/logEntry';
import { reportToSentry, addSentryBreadcrumb } from './logger/sentry-reporter';

export type { ErrorContext } from './logger/logEntry';

const isDev = process.env.NODE_ENV === 'development';
const enableProdLogs = process.env.NEXT_PUBLIC_ENABLE_PROD_LOGS === 'true';

/**
 * Store error in admin_error_logs table (non-blocking).
 * This runs asynchronously and won't block the main execution.
 */
async function storeErrorInDatabase(
  message: string,
  context?: ErrorContext,
  error?: Error,
): Promise<void> {
  // Only store on server-side and in production or if explicitly enabled
  if (typeof window !== 'undefined') return; // Client-side, skip
  if (!isDev && process.env.STORE_ERROR_LOGS !== 'true') {
    return;
  }

  // Run asynchronously to avoid blocking
  const scheduleCallback = (fn: () => void) => {
    if (typeof setImmediate !== 'undefined') {
      setImmediate(fn);
    } else {
      setTimeout(fn, 0);
    }
  };
  scheduleCallback(async () => {
    try {
      // Lazy import supabaseAdmin to prevent module load failures if env vars are missing
      let supabaseAdminModule;
      try {
        supabaseAdminModule = await import('./supabase');
      } catch (_importErr) {
        return;
      }

      const supabaseAdmin = supabaseAdminModule.supabaseAdmin;
      if (!supabaseAdmin) return;

      // Auto-detect severity and category if not explicitly provided
      const detectionContext = {
        message,
        error: error?.message || error,
        endpoint: context?.endpoint,
        component: context?.component,
        operation: context?.operation,
        ...context,
      };

      const severity = context?.severity || detectSeverity(detectionContext);
      const category = context?.category || detectCategory(detectionContext);

      const { error: insertError } = await supabaseAdmin.from('admin_error_logs').insert({
        user_id: context?.userId || null,
        endpoint: context?.endpoint || null,
        error_message: message,
        stack_trace: error?.stack || null,
        context: context ? JSON.parse(JSON.stringify(context)) : null,
        severity,
        category,
        status: 'new',
      });

      if (insertError) {
        // Use console directly to avoid circular dependency
        console.error('[Logger] Failed to store error in database:', insertError);
      }
    } catch (err) {
      // Use console directly to avoid circular dependency
      console.error('[Logger] Failed to store error in database:', err);
    }
  });
}

export const logger = {
  dev: (message: string, data?: unknown): void => {
    if (isDev || enableProdLogs) {
      const entry = createLogEntry('dev', message, data);
      const formatted = formatLogEntry(entry);
      console.log(`[DEV] ${formatted}`);
    }
  },

  error: (
    message: string,
    contextOrError?: ErrorContext | Error | unknown,
    error?: Error,
  ): void => {
    let logError: Error | undefined;
    let context: ErrorContext | undefined;
    if (contextOrError instanceof Error) {
      logError = contextOrError;
    } else if (contextOrError && typeof contextOrError === 'object') {
      context = contextOrError as ErrorContext;
      if (error) {
        logError = error;
      }
    }

    const entry = createLogEntry('error', message, context, logError);
    const formatted = formatLogEntry(entry);
    console.error(`[ERROR] ${formatted}`);

    // Store error in database for admin viewing
    storeErrorInDatabase(message, context, logError);

    // Report to Sentry (non-blocking, fails silently if Sentry is not configured)
    reportToSentry(logError ?? message, context);
  },

  warn: (message: string, context?: ErrorContext | unknown): void => {
    const entry = createLogEntry('warn', message, context);
    const formatted = formatLogEntry(entry);
    console.warn(`[WARN] ${formatted}`);

    // Add a breadcrumb to Sentry so warnings appear in error context
    addSentryBreadcrumb(message, context);
  },

  info: (message: string, context?: ErrorContext | unknown): void => {
    if (isDev || enableProdLogs) {
      const entry = createLogEntry('info', message, context);
      const formatted = formatLogEntry(entry);
      console.log(`[INFO] ${formatted}`);
    }
  },

  debug: (message: string, data?: unknown): void => {
    if (isDev || enableProdLogs) {
      const entry = createLogEntry('debug', message, data);
      const formatted = formatLogEntry(entry);
      console.log(`[DEBUG] ${formatted}`);
    }
  },
};

export const devLog = logger.dev;
export const devInfo = logger.info;
export const devDebug = logger.debug;
