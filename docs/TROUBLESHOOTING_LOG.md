# Troubleshooting Log

Format: **Symptom** | **Root Cause** | **Fix** | **Derived Rule**

---

## Vercel build fails: Missing Supabase environment variables / supabaseUrl is required

**Symptom:** Build fails during "Collecting page data" with `Missing Supabase environment variables` or `supabaseUrl is required`. Error references `/api/account/delete` or `/_not-found` or `/curbos/customers`.

**Root Cause:** Supabase client was created at module load time. When env vars are not set in Vercel (or during build), the validation/clients throw immediately when the module loads.

**Fix:**

1. **Add env vars to Vercel:** In Project Settings → Environment Variables, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for Production/Preview.
2. **Code changes (build resilience):** Lazy initialization defers validation to first use: `lib/supabase.ts` (getSupabaseConfig, supabaseAdmin proxy), `lib/env.ts` (Supabase vars optional), `app/curbos-import/lib/check-subscription.ts` (lazy getSupabase), `app/curbos/customers/page.tsx` (use shared supabase).

**Derived Rule:** Supabase clients must use lazy initialization so builds can succeed before env vars are configured. Runtime will fail fast on first DB access if vars are missing.

---

## TS2304: Cannot find name 'logger' (roster/templates route)

**Symptom:** `error TS2304: Cannot find name 'logger'` in `app/api/roster/templates/route.ts` at lines 58, 76, 133, 151.

**Root Cause:** The route used `logger.error()` but did not import the logger.

**Fix:** Add `import { logger } from '@/lib/logger';` at the top of the file.

**Derived Rule:** All API routes that use `logger` must import it from `@/lib/logger`.

---

## TS2345: Argument of type 'string' is not assignable to parameter of type 'ExportTheme' (recipe-cards export)

**Symptom:** `error TS2345: Argument of type 'string' is not assignable to parameter of type 'ExportTheme | undefined'` when passing `theme` from `searchParams.get('theme')` to `generateHTML()`.

**Root Cause:** `searchParams.get('theme')` returns `string | null`; `generateHTML` expects `ExportTheme` (union of literal strings).

**Fix:** Validate the theme param against `VALID_THEMES` (from `lib/exports/themes`) and cast: `VALID_THEMES.includes(themeParam as ExportTheme) ? (themeParam as ExportTheme) : 'cyber-carrot'`.

**Derived Rule:** When passing URL params to typed functions, validate against allowed values and provide a safe default.

---

## Hydration mismatch: server text doesn't match client (HowItWorksSection, useTranslation)

**Symptom:** `Hydration failed because the server rendered text didn't match the client` for HowItWorksSection title ("How PrepFlow Works" vs "Get Results in 3 Simple Steps"), TechnicalSpecs items, CloserLook feature titles.

**Root Cause:** `useTranslation` loads translations async in `useEffect`. On server, no translations exist (empty cache), so `t()` returns fallback. On client, after load or from cached prior visit, translations return different values. Server and first client paint produce different HTML.

**Fix:**

1. In `useTranslation`, return fallback when `isLoading` is true (both server and initial client have `isLoading === true`).
2. Align component fallbacks with `lib/translations/en-AU.ts` so fallback matches the default translation (no visible flash when translations load).

**Derived Rule:** Translation hooks used in SSR components must return fallback until translations are ready; fallbacks should match the default locale for consistent hydration.

---

## HMR: Icon module factory not available (Turbopack)

**Symptom:** `Error: Module [project]/components/ui/Icon.tsx was instantiated because it was required from module [project]/app/webapp/ingredients/components/SupplierCombobox.tsx, but the module factory is not available. It might have been deleted in an HMR update.`

**Root Cause:** The `components/ui/Icon.tsx` file was a thin re-export of `lib/ui/Icon.tsx`. During HMR (Fast Refresh), Turbopack can invalidate the re-export chain such that one module holds a stale reference to a "deleted" factory.

**Fix:**

1. **Immediate:** Restart the dev server (`npm run dev`).
2. **Structural:** Consolidated Icon: moved full implementation into `components/ui/Icon.tsx` and made `lib/ui/Icon.tsx` re-export from components. Single source of truth in components avoids the fragile re-export chain for the hot path.

**Derived Rule:** Prefer inlining shared UI component implementations in their canonical import location rather than re-export chains, to reduce HMR fragility.

---

## Message channel closed before response (Vercel Analytics / extensions)

**Symptom:** `A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received` and `runtime.lastError` in console.

**Root Cause:** Vercel Analytics and Speed Insights run in debug mode in development and use async message-passing. When HMR reloads or the page navigates, the message channel closes before handlers respond. Browser extensions (React DevTools, etc.) can also cause similar errors.

**Fix:** Do not render Vercel Analytics and Speed Insights in development. In `app/layout.tsx`, wrap them with `process.env.NODE_ENV === 'production'`. Both packages do not track data in dev anyway, so skipping them eliminates the noise and avoids loading debug scripts.

**Derived Rule:** Only mount Vercel Analytics and Speed Insights when `NODE_ENV === 'production'` to avoid dev-time message channel errors.

---

## Partytown TypeError: Cannot read properties of undefined (reading 'apply')

**Symptom:** `TypeError: Cannot read properties of undefined (reading 'apply')` in `partytown-ww-sw.js`.

**Root Cause:** Partytown runs third-party scripts in web workers. During HMR or navigation, worker scripts can receive messages for handlers that have been torn down.

**Fix:** Usually transient. Restart dev server if it persists. Consider disabling Partytown in development if it causes repeated noise.

**Derived Rule:** Partytown-related errors during development are often timing/HMR-related; verify production build behavior separately.

---

## QR codes not working (unscannable, 404s, params ignored)

**Symptom:** QR codes appear in Temperature Equipment, Cleaning Areas, Settings QR Library, Menu Builder, and Recipe Sharing, but: (1) codes may be unscannable or render incorrectly, (2) recipe QR scans result in 404, (3) scanning cleaning/ingredients QR codes navigates but destination pages ignore query params.

**Root Cause:**

1. **Rendering:** `react-qr-code` expects hex color strings (`#000000`, `#FFFFFF`) for `fgColor`/`bgColor`. Passing CSS variables (`var(--qr-foreground)`) produces invalid SVG colors. `--qr-background` was undefined.
2. **Recipe 404:** Recipe QR encoded `/webapp/recipes/{id}` but no `/webapp/recipes/[id]` route exists; recipes page is list-only.
3. **Params ignored:** Cleaning, ingredients, staff, and suppliers pages did not read `?area`, `?storage`, `?id` from `useSearchParams()`.
4. **Storage semantics:** API used `storage_area` but DB column is `storage_location`. Storage-area QR used equipment ID, but ingredients filter by storage location name (string).

**Fix:**

1. Use hex colors in all `react-qr-code` usages: `fgColor="#000000"` and `bgColor="#FFFFFF"`. Add `--qr-background: #FFFFFF` to globals.css.
2. Change recipe destination to `/webapp/recipes?recipe={id}` and add logic to open `UnifiedRecipeModal` when `recipe` param is present.
3. Wire URL params: Cleaning page reads `?area={id}` and opens area tasks; ingredients page reads `?storage={value}` and sets storage filter. Staff/suppliers lower priority.
4. Fix API: use `storage_location` (not `storage_area`) in getIngredientsHandler. Change storage-area QR URL to use equipment `name` (not `id`) so it matches `storage_location` values.

**Derived Rule:** Use hex colors for `react-qr-code`; wire `useSearchParams()` on destination pages for QR deep links; ensure URL param values align with filter semantics (e.g. storage name vs ID).

---

## auth0.handler is not a function (Auth0 route 500s)

**Symptom:** `/api/auth/login` returns 500; server error `auth0.handler is not a function`.

**Root Cause:** Auth0 SDK v4 exposes `middleware()` on Auth0Client; the internal `handler` is on AuthClient, not Auth0Client. Route handlers were incorrectly calling `auth0.handler()` which does not exist.

**Fix:** Use `auth0.middleware(req)` in route handlers instead of `auth0.handler(req)`. `middleware()` delegates to the internal handler.

**Derived Rule:** Auth0 SDK v4: use `auth0.middleware()` for route handlers; do not use `auth0.handler`.

---

## column recipes.name does not exist / recipes_1.name

**Symptom:** 500 on `/api/recipe-share`, dishes APIs; Postgres error `column recipes.name does not exist`.

**Root Cause:** Migration `rename-recipe-name-to-recipe-name.sql` renamed `recipes.name` → `recipes.recipe_name`. API code still selected or filtered by `name`.

**Fix:** Update all recipe selects and filters to use `recipe_name`: recipe-share GET, recipes/exists, dishes fetchDishRecipes. Use `recipeRecord.recipe_name` for the `name` field in mapped responses.

**Derived Rule:** After recipe name migration: use `recipe_name` in Supabase queries; map to `name` in API responses for backwards-compatible consumers.

---

## PGRST200: Could not find relationship compliance_records ↔ compliance_types

**Symptom:** 500 on `/api/compliance-records`; PostgREST error PGRST200.

**Root Cause:** PostgREST embedded resource syntax `compliance_records(*, compliance_types(...))` requires a visible FK relationship. Schema cache or RLS may not expose it.

**Fix:** Fetch `compliance_records` and `compliance_types` in separate queries; merge in code by `compliance_type_id`. Avoids join dependency.

**Derived Rule:** When PostgREST join fails (PGRST200), fall back to separate queries and merge client-side.

---

## column dishes.category does not exist

**Symptom:** 500 on `/api/menu-dishes`, kitchen-sections; Postgres error `column dishes.category does not exist`.

**Root Cause:** Migration `add-dishes-recipes-category.sql` adds `dishes.category`; some databases haven't run it.

**Fix:** (1) Run migration `migrations/add-dishes-recipes-category.sql` in Supabase. (2) Code resilience: kitchen-sections/service.ts falls back to select without category; menu-dishes/route.ts handles 42703 (undefined_column) and retries without category.

**Derived Rule:** When schema may lack optional columns, add fallback selects (omit column, map to default) and handle 42703.

---

## column kitchen_sections.name does not exist

**Symptom:** 500 on prep-lists generate-from-menu; `column kitchen_sections.name does not exist`.

**Root Cause:** Some migrations use `kitchen_sections.section_name`; code selected `kitchen_sections(id, name)`.

**Fix:** Select `kitchen_sections(id, section_name)`; use `section?.section_name || section?.name` for backwards compatibility with both schemas.

**Derived Rule:** kitchen_sections may use `name` or `section_name`; support both when consuming.

---

## minimatch ReDoS + test:coverage compatibility (minimatch, test-exclude)

**Symptom:** (1) `npm audit` reports 27+ high severity vulnerabilities (minimatch ReDoS GHSA-3ppc-4f35-3m26). (2) With `"minimatch": "^10.2.1"` override, `npm run test:coverage` fails: `TypeError: minimatch is not a function` at test-exclude.

**Root Cause:** minimatch &lt;10.2.1 has ReDoS. A global `minimatch` override fixes ESLint/etc., but `test-exclude` 6.x expects minimatch 5.x API (callable function); minimatch 10 exports differently.

**Fix:** Use both overrides—global patched minimatch and upgraded test-exclude:

```json
"overrides": {
  "minimatch": "^10.2.1",
  "test-exclude": "7.0.2"
}
```

test-exclude 7.x uses minimatch ^10.2.2 and is compatible with babel-plugin-istanbul ^6.0.0. This yields 0 vulnerabilities and passing `test:coverage`.

**Derived Rule:** Prefer upgrading test-exclude to 7.x over pinning minimatch 5.1.6 for test-exclude (which leaves vulnerabilities). See `docs/SECURITY_BEST_PRACTICES.md` (Dependency Vulnerabilities).

---

## column shifts.user_id does not exist

**Symptom:** 500 on `/api/roster/shifts`; Postgres error `column shifts.user_id does not exist`.

**Root Cause:** The multi-tenancy migration (`20260203000000`) added `user_id` to `roster_shifts`, but the actual table is named `shifts`. The shifts table was never migrated.

**Fix:** Migration `20260224000000_add_recipe_shares_and_shifts_user_id.sql` adds `user_id` to `shifts` and backfills from `employees.user_id`. Run `supabase db push` or apply the migration.

**Derived Rule:** When roster/shifts APIs fail with column errors, verify `shifts` table schema matches API expectations. The table name is `shifts`, not `roster_shifts`.

---

## Could not find table 'public.recipe_shares'

**Symptom:** 500 on `/api/recipe-share`; PostgREST error PGRST205 `Could not find the table 'public.recipe_shares' in the schema cache`.

**Root Cause:** The `recipe_shares` table may not exist in the current database (migration not applied, or table was never created in this environment).

**Fix:** Migration `20260224000000_add_recipe_shares_and_shifts_user_id.sql` creates the `recipe_shares` table with: id, recipe_id, user_id, share_type, recipient_email, notes, status, created_at, updated_at. Run `supabase db push` or apply the migration. The POST route now requires auth and passes user_id to createShareRecord.

**Derived Rule:** recipe-share feature requires `recipe_shares` table; ensure migration is applied in all environments.

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## \bnam:\s (SyntaxError-CI)

**Symptom:** \bnam:\s

**Root Cause:** file: .github/workflows/\*.yml

**Fix:**

1. Correct typo 'nam:' to 'name:' in YAML key.

**Derived Rule:** Run YAML header check or linter.

---

## Ingredient Matching (BestPractice-Architecture)

**Symptom:** Ingredient Matching

**Root Cause:** source: AI_RULES.md; date: 2026-01-28

**Fix:**

1. Fuzzy ingredient matching logic is defined in TWO places that MUST stay in sync:

**Derived Rule:** Follow AI Rules strictly

---

## Missing Error Handling (HistoricalFix-Development)

**Symptom:** Missing Error Handling

**Root Cause:** file: missing-error-handling.md

**Fix:**

1. See docs/errors/fixes/missing-error-handling.md

**Derived Rule:** Check historical fixes before refactoring

---

## TypeScript Type Errors (HistoricalFix-Development)

**Symptom:** TypeScript Type Errors

**Root Cause:** file: typescript-type-errors.md

**Fix:**

1. See docs/errors/fixes/typescript-type-errors.md

**Derived Rule:** Check historical fixes before refactoring

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---

## Auth0 SDK.\*Configuration validation failed (ConfigurationError-Runtime)

**Symptom:** Auth0 SDK.\*Configuration validation failed

**Root Cause:** file: server.js; environment: CI

**Fix:**

1. Add AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, and AUTH0_SECRET to the environment variables of the running process.

**Derived Rule:** Ensure all required Auth0 secrets are propagated to CI/CD steps running the application.

---
