/**
 * Sentry custom metrics utility.
 *
 * Wraps Sentry metrics calls with a no-op guard so metrics work correctly
 * when Sentry is configured and fail silently when it is not.
 *
 * Usage:
 *   import { trackAllergenDetection, trackApiDuration } from '@/lib/sentry-metrics';
 *   trackAllergenDetection('keyword');
 *   trackApiDuration('/api/ingredients', 120);
 */

type MetricTags = Record<string, string | number | boolean>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SentryMetrics = Record<string, (...args: any[]) => void>;

function getSentryMetrics(): SentryMetrics | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Sentry = require('@sentry/nextjs') as any;
    // metrics namespace may not exist in all SDK versions — guard defensively
    return typeof Sentry?.metrics === 'object' ? (Sentry.metrics as SentryMetrics) : null;
  } catch {
    return null;
  }
}

/**
 * Increment a counter metric.
 * @param name   Dot-separated metric name, e.g. 'allergen.detection'
 * @param value  Amount to increment (default 1)
 * @param tags   Optional key-value tags for filtering in Sentry
 */
export function metricsIncrement(name: string, value = 1, tags?: MetricTags): void {
  try {
    const m = getSentryMetrics();
    if (typeof m?.increment === 'function') m.increment(name, value, { tags });
  } catch {
    // metrics not available in this environment
  }
}

/**
 * Record a distribution metric (e.g. response time in ms).
 * @param name   Metric name, e.g. 'api.response_time'
 * @param value  Measured value
 * @param unit   Unit label (default 'millisecond')
 * @param tags   Optional key-value tags
 */
export function metricsDistribution(
  name: string,
  value: number,
  unit = 'millisecond',
  tags?: MetricTags,
): void {
  try {
    const m = getSentryMetrics();
    if (typeof m?.distribution === 'function') m.distribution(name, value, { unit, tags });
  } catch {
    // metrics not available
  }
}

/**
 * Record a gauge metric (current value, e.g. total ingredient count).
 * @param name  Metric name, e.g. 'ingredients.count'
 * @param value Current value
 * @param tags  Optional key-value tags
 */
export function metricsGauge(name: string, value: number, tags?: MetricTags): void {
  try {
    const m = getSentryMetrics();
    if (typeof m?.gauge === 'function') m.gauge(name, value, { tags });
  } catch {
    // metrics not available
  }
}

// ---------------------------------------------------------------------------
// Domain-specific helpers
// ---------------------------------------------------------------------------

/**
 * Track allergen detection usage by method.
 * @param method 'keyword' | 'ai' | 'hybrid' | 'none'
 */
export function trackAllergenDetection(method: 'keyword' | 'ai' | 'hybrid' | 'none'): void {
  metricsIncrement('allergen.detection', 1, { method });
}

/**
 * Track AI detection confidence.
 * @param confidence 'high' | 'medium' | 'low'
 * @param parsedAsJson Whether the AI returned structured JSON
 */
export function trackAllergenAIConfidence(
  confidence: 'high' | 'medium' | 'low',
  parsedAsJson: boolean,
): void {
  metricsIncrement('allergen.ai_detection', 1, {
    confidence,
    parsed_as_json: String(parsedAsJson),
  });
}

/**
 * Track API endpoint response duration.
 * @param endpoint  API path, e.g. '/api/ingredients'
 * @param durationMs Response time in milliseconds
 * @param status    HTTP status code
 */
export function trackApiDuration(endpoint: string, durationMs: number, status?: number): void {
  metricsDistribution('api.response_time', durationMs, 'millisecond', {
    endpoint,
    ...(status ? { status: String(status) } : {}),
  });
}

/**
 * Track total entity counts for data volume monitoring.
 * @param entity 'ingredients' | 'recipes' | 'dishes' | 'menus'
 * @param count  Current count
 */
export function trackEntityCount(
  entity: 'ingredients' | 'recipes' | 'dishes' | 'menus',
  count: number,
): void {
  metricsGauge(`${entity}.count`, count);
}
