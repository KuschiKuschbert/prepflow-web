import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rates for production — capture all errors, sample performance traces
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Session replay: 5% of sessions, 100% of error sessions
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  // Only initialize when DSN is configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.replayIntegration({
      // Mask sensitive text inputs by default; opt out specific elements with
      // data-sentry-unmask attribute (e.g. navigation labels, page headers)
      maskAllText: false,
      blockAllMedia: false,

      // Mask all input fields and textareas regardless of maskAllText setting
      maskAllInputs: true,

      // Un-mask safe non-sensitive elements using CSS selector
      // Add data-sentry-unmask to navigation labels, headings, and buttons
      unmask: ['[data-sentry-unmask]'],

      // Block sensitive media uploads from being captured in replays
      block: ['[data-sentry-block]', 'input[type="file"]'],

      // Capture network requests for better debugging context
      // Sanitize request/response bodies to avoid leaking PII
      networkDetailAllowUrls: [typeof window !== 'undefined' ? window.location.origin : ''],
      networkCaptureBodies: false, // Don't capture request/response bodies
    }),
  ],
});
