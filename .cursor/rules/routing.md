---
description: Route conventions, API route patterns, Next.js 16 params, dynamic segments
globs: app/**/route.ts, app/**/page.tsx, app/**/layout.tsx, proxy.ts
---

# Routing — All URLs, Dynamic Routes, Domains & Patterns

## Route Conventions

- **Framework:** Next.js 16 App Router
- **Auth middleware:** `proxy.ts` (not `middleware.ts`) — handles auth, allowlist, rate limiting, security headers
- **Protected routes:** All `/webapp/**` and `/api/**` routes (except public exceptions below)
- **Public exceptions:** `/api/auth/**`, `/api/leads`, `/api/detect-country`, `/api/health`, `/api/webhook/**`

## Webapp Routes (34 routes)

| URL                             | File                                        | Description              |
| ------------------------------- | ------------------------------------------- | ------------------------ |
| `/webapp`                       | `app/webapp/page.tsx`                       | Dashboard                |
| `/webapp/calendar`              | `app/webapp/calendar/page.tsx`              | Calendar view            |
| `/webapp/cleaning`              | `app/webapp/cleaning/page.tsx`              | Cleaning management      |
| `/webapp/cogs`                  | `app/webapp/cogs/page.tsx`                  | COGS calculator          |
| `/webapp/compliance`            | `app/webapp/compliance/page.tsx`            | Compliance records       |
| `/webapp/customers`             | `app/webapp/customers/page.tsx`             | Customer list            |
| `/webapp/customers/[id]`        | `app/webapp/customers/[id]/page.tsx`        | Customer detail          |
| `/webapp/dish-builder`          | `app/webapp/dish-builder/page.tsx`          | Dish builder             |
| `/webapp/equipment/[id]`        | `app/webapp/equipment/[id]/page.tsx`        | Equipment detail         |
| `/webapp/functions`             | `app/webapp/functions/page.tsx`             | Functions/events list    |
| `/webapp/functions/[id]`        | `app/webapp/functions/[id]/page.tsx`        | Function detail          |
| `/webapp/guide`                 | `app/webapp/guide/page.tsx`                 | User guide               |
| `/webapp/ingredients`           | `app/webapp/ingredients/page.tsx`           | Ingredient management    |
| `/webapp/menu-builder`          | `app/webapp/menu-builder/page.tsx`          | Menu builder             |
| `/webapp/order-lists`           | `app/webapp/order-lists/page.tsx`           | Order lists              |
| `/webapp/par-levels`            | `app/webapp/par-levels/page.tsx`            | Par levels               |
| `/webapp/performance`           | `app/webapp/performance/page.tsx`           | Performance analysis     |
| `/webapp/prep-lists`            | `app/webapp/prep-lists/page.tsx`            | Prep lists               |
| `/webapp/recipe-sharing`        | `app/webapp/recipe-sharing/page.tsx`        | Recipe sharing           |
| `/webapp/recipes`               | `app/webapp/recipes/page.tsx`               | Recipe management        |
| `/webapp/roster`                | `app/webapp/roster/page.tsx`                | Staff roster             |
| `/webapp/sections`              | `app/webapp/sections/page.tsx`              | Kitchen sections         |
| `/webapp/settings`              | `app/webapp/settings/page.tsx`              | Settings hub             |
| `/webapp/settings/backup`       | `app/webapp/settings/backup/page.tsx`       | Backup settings          |
| `/webapp/settings/billing`      | `app/webapp/settings/billing/page.tsx`      | Billing/subscription     |
| `/webapp/setup`                 | `app/webapp/setup/page.tsx`                 | Initial setup wizard     |
| `/webapp/specials`              | `app/webapp/specials/page.tsx`              | Daily specials           |
| `/webapp/square`                | `app/webapp/square/page.tsx`                | Square POS integration   |
| `/webapp/staff`                 | `app/webapp/staff/page.tsx`                 | Staff management         |
| `/webapp/staff/[id]/onboarding` | `app/webapp/staff/[id]/onboarding/page.tsx` | Staff onboarding         |
| `/webapp/suppliers`             | `app/webapp/suppliers/page.tsx`             | Supplier management      |
| `/webapp/temperature`           | `app/webapp/temperature/page.tsx`           | Temperature monitoring   |
| `/webapp/test-error`            | `app/webapp/test-error/page.tsx`            | Error testing (dev only) |
| `/webapp/time-attendance`       | `app/webapp/time-attendance/page.tsx`       | Time & attendance        |

## Marketing / Public Pages (10 pages)

| URL                    | File                               |
| ---------------------- | ---------------------------------- |
| `/`                    | `app/page.tsx`                     |
| `/pricing`             | `app/pricing/page.tsx`             |
| `/privacy-policy`      | `app/privacy-policy/page.tsx`      |
| `/privacy`             | `app/privacy/page.tsx`             |
| `/terms-of-service`    | `app/terms-of-service/page.tsx`    |
| `/terms`               | `app/terms/page.tsx`               |
| `/not-authorized`      | `app/not-authorized/page.tsx`      |
| `/guide`               | `app/guide/page.tsx`               |
| `/bad-request`         | `app/bad-request/page.tsx`         |
| `/generate-background` | `app/generate-background/page.tsx` |

## Auth Routes

| URL                 | Handler                                       |
| ------------------- | --------------------------------------------- |
| `/api/auth/[auth0]` | Auth0 SDK catch-all (login, logout, callback) |
| `/api/me`           | Current user info                             |
| `/api/entitlements` | User subscription entitlements                |

## API Routes by Domain

### Account

- `DELETE /api/account/delete`
- `GET /api/account/export`

### Admin (requires admin role)

- `GET/POST /api/admin/users`
- `GET/PUT/DELETE /api/admin/users/[id]`
- `GET /api/admin/users/[id]/data`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/analytics`
- `GET/POST/PUT /api/admin/features`
- `GET/PUT /api/admin/features/[flag]`
- `POST /api/admin/features/auto-create`
- `POST /api/admin/features/enable-all`
- `GET /api/admin/features/discover`
- `GET /api/admin/features/hidden`
- `POST /api/admin/features/seed`
- `GET /api/admin/billing/health`
- `GET /api/admin/billing/overview`
- `POST /api/admin/billing/sync-subscriptions`
- `GET /api/admin/tiers`
- `GET /api/admin/tiers/features`
- `DELETE /api/admin/tiers/cache`
- `GET/POST /api/admin/support-tickets`
- `GET/PUT/DELETE /api/admin/support-tickets/[id]`
- `POST /api/admin/support-tickets/[id]/link-error`
- `POST /api/admin/support/impersonate`
- `POST /api/admin/support/reset-password`
- `GET /api/admin/system/health`
- `GET /api/admin/errors`
- `GET/DELETE /api/admin/errors/[id]`
- `POST /api/admin/errors/client`
- `GET /api/admin/data/export`
- `GET /api/admin/data/search`
- `GET /api/admin/check`
- `GET /api/admin/security/breach-report`

### AI

- `POST /api/ai/chat`
- `POST /api/ai/menu-item-description`
- `POST /api/ai/performance-insights`
- `POST /api/ai/performance-tips`
- `POST /api/ai/prep-details`
- `POST /api/ai/recipe-instructions`
- `POST /api/ai-specials`
- `POST /api/ai-specials/search`

### Allergens

- `GET /api/allergens/[code]/dishes`
- `GET /api/allergens/[code]/ingredients`
- `GET /api/allergens/[code]/recipes`
- `POST /api/allergens/re-aggregate-all`

### Backup

- `POST /api/backup/create`
- `GET /api/backup/list`
- `POST /api/backup/restore`
- `GET/PUT /api/backup/settings`
- `GET/PUT /api/backup/schedule`
- `GET /api/backup/google-auth`
- `GET /api/backup/google-callback`
- `POST /api/backup/upload-to-drive`
- `GET /api/backup/drive/list`
- `GET /api/backup/drive/download/[fileId]`
- `POST /api/backup/cron`

### Billing

- `POST /api/billing/create-checkout-session`
- `POST /api/billing/create-portal-session`
- `POST /api/billing/cancel-subscription`
- `POST /api/billing/reactivate-subscription`
- `POST /api/billing/extend-subscription`

### Cleaning

- `GET/POST /api/cleaning-areas`
- `GET /api/cleaning-areas/[id]/qr-code`
- `GET/POST /api/cleaning-tasks`
- `POST /api/cleaning-tasks/[id]/complete`
- `POST /api/cleaning-tasks/[id]/uncomplete`
- `POST /api/cleaning-tasks/populate-standard`
- `GET /api/cleaning-tasks/standard-templates`

### Compliance

- `GET/POST /api/compliance-records`
- `GET /api/compliance-records/[id]/qr-code`
- `GET /api/compliance-types`
- `GET /api/compliance/allergens`
- `GET /api/compliance/allergens/export`
- `GET /api/compliance/health-inspector-report`
- `POST /api/compliance/validate`

### CurbOS

- `POST /api/curbos/auth/exchange-token`
- `GET /api/curbos/check-access`
- `POST /api/curbos/public-token`
- `GET /api/curbos/public/validate`
- `POST /api/curbos/setup-public-tokens`

### Customers

- `GET/POST /api/customers`
- `GET/PUT/DELETE /api/customers/[id]`
- `POST /api/customers/upload-photo`

### Dashboard

- `GET /api/dashboard/stats`
- `GET /api/dashboard/menu-summary`
- `GET /api/dashboard/performance-summary`
- `GET /api/dashboard/recipe-readiness`

### Database (dev-only, blocked in production)

- `POST /api/db/reset`
- `POST /api/db/reset-self`
- `POST /api/db/integrity`
- `POST /api/db/audit-costs`
- `POST /api/db/audit-prices`
- `POST /api/db/dedupe-recipe-ingredients`
- `POST /api/db/diagnose-dishes`
- `POST /api/db/populate-empty-dishes`

### Dishes

- `GET/POST /api/dishes`
- `GET/PUT/DELETE /api/dishes/[id]`
- `GET /api/dishes/[id]/cost`
- `GET /api/dishes/[id]/allergen-sources`
- `POST /api/dishes/[id]/generate-image`
- `POST /api/dishes/[id]/revalidate-dietary`
- `POST /api/dishes/bulk-delete`
- `POST /api/dishes/cost/batch`

### Employees

- `GET/POST /api/employees`
- `GET/PUT/DELETE /api/employees/[id]`
- `GET /api/employees/[id]/qr-code`
- `GET/POST /api/employees/[id]/qualifications`
- `GET/PUT/DELETE /api/employees/[id]/qualifications/[qual_id]`
- `POST /api/employees/populate`
- `POST /api/employees/upload-photo`

### Ingredients

- `GET/POST /api/ingredients`
- `GET /api/ingredients/[id]/qr-code`
- `GET /api/ingredients/exists`
- `PUT /api/ingredients/bulk-update`
- `POST /api/ingredients/add-consumables`
- `POST /api/ingredients/ai-detect-allergens`
- `POST /api/ingredients/batch-ai-detect-allergens`
- `POST /api/ingredients/populate-all-allergens`
- `POST /api/ingredients/detect-missing-allergens`
- `POST /api/ingredients/auto-categorize`
- `POST /api/ingredients/migrate-units`

### Menus

- `GET/POST /api/menus`
- `GET/PUT/DELETE /api/menus/[id]`
- `GET/POST /api/menus/[id]/items`
- `GET/PUT/DELETE /api/menus/[id]/items/[itemId]`
- `GET /api/menus/[id]/items/[itemId]/statistics`
- `POST /api/menus/[id]/items/bulk`
- `POST /api/menus/[id]/lock`
- `POST /api/menus/[id]/reorder`
- `GET /api/menus/[id]/statistics`
- `GET /api/menus/[id]/ingredients`
- `POST /api/menus/[id]/refresh-prices`
- `GET /api/menus/[id]/changes`
- `GET /api/menus/[id]/allergen-matrix/export`
- `GET /api/menus/[id]/export-combined`
- `GET /api/menus/[id]/menu-display/export`
- `GET/POST /api/menus/[id]/recipe-cards`
- `POST /api/menus/[id]/recipe-cards/generate`
- `GET /api/menus/[id]/recipe-cards/export`

### Recipes

- `GET/POST /api/recipes`
- `GET/PUT/DELETE /api/recipes/[id]`
- `GET/POST /api/recipes/[id]/ingredients`
- `GET /api/recipes/[id]/qr-code`
- `GET /api/recipes/[id]/allergen-sources`
- `GET /api/recipes/[id]/dietary-suitability`
- `POST /api/recipes/[id]/generate-image`
- `POST /api/recipes/[id]/revalidate-dietary`
- `GET /api/recipes/[id]/suggest-plating-methods`
- `GET /api/recipes/exists`
- `POST /api/recipes/bulk-delete`
- `POST /api/recipes/bulk-share`
- `POST /api/recipes/ingredients/batch`
- `POST /api/recipes/allergens/batch`
- `POST /api/recipes/dietary/batch`
- `POST /api/recipe-share`

### Roster

- `GET/POST /api/roster/shifts`
- `GET/PUT/DELETE /api/roster/shifts/[id]`
- `GET/PUT/DELETE /api/roster/templates/[id]`
- `POST /api/roster/templates/[id]/apply`

### Square

- `GET /api/square/status`
- `GET/PUT /api/square/config`
- `GET/PUT /api/square/mappings`
- `GET /api/square/oauth`
- `GET /api/square/callback`
- `POST /api/square/sync`

### Staff

- `GET /api/staff` (see `/api/employees`)

### Suppliers

- `GET/POST /api/suppliers`
- `GET/POST /api/supplier-price-lists`

### Webhooks

- `POST /api/webhook/stripe` (Stripe signature verified)
- `POST /api/webhook/square` (Square signature verified)

### Other

- `POST /api/leads` (public)
- `GET /api/detect-country` (public)
- `POST /api/image-proxy`
- `GET /api/latest-release`
- `GET /api/weather/current`
- `GET /api/weather/daily-logs`
- `GET /api/weather/performance-insight`
- `GET /api/par-levels`
- `GET/POST /api/order-lists`
- `GET/PUT/DELETE /api/order-lists/[id]`
- `GET/POST /api/prep-lists`
- `POST /api/prep-lists/generate-from-menu`
- `POST /api/prep-lists/batch-create`
- `POST /api/prep-lists/analyze-prep-details`
- `GET /api/user/profile`
- `GET /api/user/notifications`
- `GET /api/user/login-history`
- `GET /api/user/errors`
- `GET /api/user/data-usage`
- `GET /api/user/import-export-history`
- `POST /api/user/avatar`
- `POST /api/user/verify-email/resend`
- `GET/PUT /api/features/[flagKey]`
- `GET /api/performance`
- `GET/POST /api/special-days`
- `GET/PUT/DELETE /api/special-days/[id]`
- `GET /api/kitchen-sections`
- `GET /api/qualification-types`
- `GET /api/menu-dishes`
- `POST /api/assign-dish-section`
- `POST /api/qr-codes`
- `POST /api/kds/update-status`
- `GET /api/navigation-optimization/patterns`
- `GET /api/navigation-optimization/preferences`
- `POST /api/navigation-optimization/log`

## Dynamic Route Params Pattern

In Next.js 16, `params` is a Promise and MUST be awaited:

```typescript
// ✅ Correct
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
}

// ❌ Wrong (Next.js 15 pattern — breaks in 16)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
}
```

## URL Constants

Never hardcode API paths. Use constants or relative paths:

- Within the app: use relative paths `/api/...`
- External URLs: define in `lib/` constants, not inline in components

## Prefetch Map

When adding a new webapp route, add its API endpoints to `lib/cache/prefetch-config.ts`:

```typescript
export const PREFETCH_MAP: Record<string, string[]> = {
  '/webapp/my-new-page': ['/api/my-data'],
};
```
