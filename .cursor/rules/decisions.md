---
description: Architecture Decision Records (ADRs) - why certain technical choices were made
globs: docs/**
---

# Decisions — Key Architectural Choices & Reasoning

This file is an append-only ADR-style log. Add new decisions at the bottom with `[YYYY-MM-DD]`.

See also: `docs/adr/` for full Architecture Decision Records.

---

## [2024] Next.js App Router over Pages Router

**Decision:** Use Next.js App Router exclusively.  
**Reasoning:** Better server component support, layout nesting, streaming, and the direction of the framework. All new routes use App Router conventions.  
**Consequence:** All pages must be in `app/` directory. `getServerSideProps` and `getStaticProps` are not used.

---

## [2024] proxy.ts over middleware.ts (Next.js 16)

**Decision:** Use `proxy.ts` as the auth and security middleware entry point, not the standard `middleware.ts`.  
**Reasoning:** Next.js 16 adopted the `proxy.ts` convention. This file handles Auth0 session checks, allowlist enforcement, rate limiting, and security headers in one place.  
**Consequence:** Never create a `middleware.ts` file — it will conflict with `proxy.ts`.

---

## [2024] Auth0 over NextAuth directly

**Decision:** Use Auth0 SDK (`@auth0/nextjs-auth0`) as the authentication provider, with NextAuth as a compatibility layer.  
**Reasoning:** Auth0 provides enterprise-grade auth with MFA, social logins, and compliance features out of the box. NextAuth alone would require more custom implementation.  
**Consequence:** `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are deprecated in favor of `AUTH0_SECRET` and `AUTH0_BASE_URL`.

---

## [2024] Supabase for Database (Not for Auth)

**Decision:** Use Supabase for PostgreSQL database only. Auth0 handles user authentication.  
**Reasoning:** Supabase's built-in auth has limitations for enterprise features. Auth0 provides better session management, MFA, and social provider support. Separating auth and database avoids coupling.  
**Consequence:** No Supabase Auth usage. User records are synced to the `users` table on first login via `lib/auth-user-sync.ts`.

---

## [2024] Optimistic Updates for All CRUD

**Decision:** All create, update, and delete operations must update the UI immediately before the API response.  
**Reasoning:** Loading spinners after user actions feel sluggish. Optimistic updates give instant feedback.  
**Consequence:** Every mutation must store original state, apply optimistic change, then revert on error. Utilities in `lib/optimistic-updates.ts` and `hooks/useOptimisticMutation.ts`.

---

## [2024] Custom Tailwind Breakpoints (Disable sm/md/lg)

**Decision:** Disable standard Tailwind breakpoints (`sm:`, `md:`, `lg:`) and use custom ones only: `tablet:` (481px), `desktop:` (1025px), `large-desktop:` (1440px).  
**Reasoning:** The standard breakpoints don't map cleanly to the design's tablet-first approach. A single `desktop:` breakpoint covers the primary layout transition. Explicit naming reduces confusion.  
**Consequence:** All responsive classes must use the custom breakpoints. Codemod at `scripts/codemods/breakpoint-migration.js` migrates old code.

---

## [2024] Lucide React as Exclusive Icon Library

**Decision:** Use only Lucide React icons via the `Icon` wrapper component. No emoji icons in UI.  
**Reasoning:** Emoji render inconsistently across platforms. Lucide provides consistent, accessible, scalable icons with tree-shaking.  
**Consequence:** All emoji icons in buttons/UI must be replaced with Lucide equivalents. `components/ui/Icon.tsx` is the only way to render icons.

---

## [2024] SessionStorage Caching for Perceived Performance

**Decision:** Cache first-page API responses in `sessionStorage` with 5-minute expiry.  
**Reasoning:** Cold-load API calls add 1-3 seconds of latency. Showing cached data instantly while refreshing in background dramatically improves perceived performance.  
**Consequence:** All list pages initialize state from `getCachedData()`. Cache cleared on tab close (sessionStorage vs localStorage).

---

## [2024] Batch API Endpoints for N+1 Prevention

**Decision:** Create batch endpoints (e.g., `/api/recipes/ingredients/batch`) that accept arrays of IDs and return grouped results.  
**Reasoning:** Recipes page was making 14 sequential API calls (~10 seconds). One batch call takes ~1-2 seconds.  
**Consequence:** New list features should check if N+1 patterns exist and create batch endpoints upfront. `lib/api/batch-utils.ts` provides helpers.

---

## [2024] compress: false in next.config.ts

**Decision:** Set `compress: false` in Next.js config.  
**Reasoning:** Vercel handles compression automatically. Enabling Next.js compression AND Vercel compression causes `ERR_CONTENT_DECODING_FAILED` errors in browsers.  
**Consequence:** Never add explicit `Content-Encoding` headers manually. Let Vercel handle it.

---

## [2024] Cyber Carrot Design System

**Decision:** Custom dark-theme design system with fixed color palette and no light mode.  
**Reasoning:** PrepFlow targets professional kitchen staff who often work in low-light environments. Dark mode is the primary experience. Consistent palette (`#29E7CD`, `#D925C7`, `#FF6B00`) creates strong brand identity.  
**Consequence:** All UI components follow Cyber Carrot guidelines. No light mode toggle. No ad-hoc color values.

---

## [2024] app/curbos/ Protection

**Decision:** The `app/curbos/` directory is protected by a pre-commit hook and excluded from all tooling.  
**Reasoning:** CurbOS is a separate product integrated into the PrepFlow codebase. Its code must not be accidentally modified by automated tools or refactoring operations.  
**Consequence:** Pre-commit hook blocks any staged changes to `app/curbos/`. Override with `ALLOW_CURBOS_MODIFY=1` only for intentional changes.

---

## [2025-02-26] Skill Audit Branch Pattern

**Decision:** Large multi-domain changes (skill audits, codebase-wide refactors) run on a dedicated `improvement/skill-audit` branch with domain-by-domain commits.  
**Reasoning:** Accumulating changes across 30+ domains in a single commit makes review impossible and rollback all-or-nothing. Domain commits are individually reversible.  
**Consequence:** Each domain batch gets its own commit: `refactor(domain): apply skill standards`. Merge to main only after full verification.

---

<!-- Add new decisions below this line -->
