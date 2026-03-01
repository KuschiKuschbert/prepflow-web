/**
 * Build performance API URL with default 30-day date range (matches PerformanceClient default).
 * Used for prefetching so data is ready when user navigates to performance page.
 */
function getPerformancePrefetchUrl(): string {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  return `/api/performance?startDate=${startStr}&endDate=${endStr}`;
}

/**
 * Prefetch configuration for all navigation links
 * Maps routes to their API endpoints for smart prefetching
 */
export const PREFETCH_MAP: Record<string, string[]> = {
  '/webapp': [
    '/api/dashboard/stats',
    '/api/dashboard/performance-summary',
    '/api/dashboard/menu-summary',
    '/api/dashboard/recipe-readiness',
    '/api/weather/current',
    '/api/weather/operational-tip',
  ],
  '/webapp/recipes': [
    '/api/recipes/catalog',
    '/api/ingredients/catalog',
    '/api/menus',
    '/api/dishes/catalog',
  ],
  '/webapp/recipe-sharing': ['/api/recipes/catalog', '/api/recipe-share'],
  '/webapp/performance': ['/api/menus', '/api/weather/performance-insight'],
  '/webapp/temperature': ['/api/temperature-logs'],
  '/webapp/cleaning': ['/api/cleaning-areas', '/api/cleaning-tasks'],
  '/webapp/compliance': ['/api/compliance-records', '/api/compliance-types'],
  '/webapp/customers': ['/api/customers'],
  '/webapp/dish-builder': ['/api/dishes/catalog', '/api/recipes/catalog'],
  '/webapp/ingredients': ['/api/ingredients?page=1&pageSize=50', '/api/suppliers'],
  '/webapp/par-levels': ['/api/par-levels', '/api/ingredients', '/api/weather/operational-tip'],
  '/webapp/order-lists': ['/api/menus', '/api/weather/operational-tip'],
  '/webapp/sections': ['/api/kitchen-sections', '/api/menu-dishes'],
  '/webapp/prep-lists': [
    '/api/prep-lists?page=1&pageSize=10',
    '/api/kitchen-sections',
    '/api/ingredients?page=1&pageSize=50',
    '/api/weather/operational-tip',
  ],
  '/webapp/ai-specials': ['/api/ai-specials'],
  '/webapp/functions': ['/api/functions', '/api/customers', '/api/weather/function-alerts'],
  '/webapp/menu-builder': ['/api/menus', '/api/dishes/catalog', '/api/recipes/catalog'],
  '/webapp/settings': [
    '/api/user/profile',
    '/api/user/notifications',
    '/api/user/sessions',
    '/api/user/login-history',
    '/api/user/data-usage',
    '/api/user/activity?limit=5',
  ],
  '/webapp/settings/billing': ['/api/entitlements'],
  '/webapp/staff': ['/api/staff/employees'],
  '/webapp/roster': ['/api/roster/templates', '/api/roster/shifts', '/api/staff/employees'],
  '/webapp/suppliers': ['/api/suppliers'],
  '/webapp/cogs': ['/api/recipes/catalog', '/api/ingredients/catalog'],
  '/webapp/square': ['/api/square/status', '/api/square/config'],
  '/webapp/calendar': ['/api/roster/shifts', '/api/functions'],
  '/webapp/time-attendance': ['/api/time-attendance/records', '/api/staff/employees'],
  '/webapp/specials': ['/api/recipes/catalog', '/api/ingredients/catalog'],
  '/webapp/guide': [],
  '/webapp/setup': [],
};

/**
 * Get prefetch endpoints for a route.
 * Performance route gets dynamic 30-day default date range for instant load.
 */
export function getPrefetchEndpoints(route: string): string[] {
  const base = PREFETCH_MAP[route] || [];
  if (route === '/webapp/performance') {
    return [getPerformancePrefetchUrl(), ...base];
  }
  return base;
}

/**
 * Prefetch all endpoints for a route
 */
export function prefetchRoute(route: string): void {
  const endpoints = getPrefetchEndpoints(route);
  if (endpoints.length > 0) {
    import('./data-cache').then(({ prefetchApis }) => {
      prefetchApis(endpoints);
    });
  }
}
