# PrepFlow - AI Agent Instructions

**Quick Reference Index** - For detailed documentation, see the links below.

## 🎯 Project Overview

PrepFlow is a unified restaurant profitability optimization platform that helps cafés, restaurants, and food trucks analyze their menu costs, calculate COGS, and optimize gross profit margins. The platform combines a marketing landing page with a comprehensive webapp featuring subscription-based access.

**Target Market:** Independent restaurants, cafés, food trucks in Australia and globally
**Primary Goal:** Convert visitors into customers through lead generation and subscription sales
**Business Model:** Subscription-based SaaS ($29/month AUD) with 7-day free trial
**Platform:** Unified Next.js webapp with future React Native mobile apps

## 🚨 Critical Reminders

1. **Never work directly on main** - Always use feature branches (`improvement/feature-name`)
2. **File size limits** - Pages: 500, Components: 300, API: 200, Utils: 150, Hooks: 120
3. **Optimistic updates** - MANDATORY for all CRUD operations
4. **Custom breakpoints only** - Use `desktop:`, `tablet:`, NOT `sm:`, `md:`, `lg:`
5. **Always use `RefObject<HTMLElement | null>`** for ref types in interfaces
6. **Design source of truth** - `design.mdc` defines required patterns; VISUAL_HIERARCHY_STANDARDS.md provides hierarchy guidance
7. **No unjustified `any`** - Use proper types; run `npm run audit:any` to track
8. **Auth is Auth0 SDK** (`@auth0/nextjs-auth0` v4) — NOT NextAuth. See `integrations.md` for patterns
9. **Never touch `app/curbos/` or `app/curbos-import/`** without explicit user request

## 📚 Documentation Index

### Standards & Guidelines (Always-Loaded Rules)

- **[Development Standards](.cursor/rules/development.mdc)** - Code quality, naming, Git workflow, file refactoring, optimistic updates
- **[Design System](.cursor/rules/design.mdc)** - Cyber Carrot design, breakpoints, Framer Motion, components, responsive
- **[Operations Standards](.cursor/rules/operations.mdc)** - Deployment, performance, caching, memoization guidelines
- **[Implementation Patterns](.cursor/rules/implementation.mdc)** - API patterns, database patterns
- **[Technical Patterns](.cursor/rules/technical.mdc)** - Autosave, Next.js 16, React Query, Zustand, DPR canvas
- **[Cleanup Standards](.cursor/rules/cleanup.mdc)** - Automated enforcement, code quality checks
- **[Core Patterns](.cursor/rules/core.mdc)** - Auth0 SDK setup, allowlist, Stripe, project overview
- **[Context Hygiene](.cursor/rules/context-hygiene.md)** - Handoff checkpoints, self-improvement protocol, session-end checklist

### File-Scoped Rules (Auto-loaded when editing relevant files)

- **[Security](.cursor/rules/security.mdc)** - Input validation, Supabase query safety, API security (loads for `app/api/**`, `lib/**`)
- **[Integrations](.cursor/rules/integrations.md)** - Auth0, Supabase, Stripe, Square, Google APIs (loads for `lib/auth0*`, `lib/stripe*`)
- **[Testing](.cursor/rules/testing.mdc)** - Jest, Playwright E2E patterns, smoke/crawl tests (loads for `*.test.*`, `e2e/**`)
- **[Dialogs](.cursor/rules/dialogs.mdc)** - `useConfirm`/`usePrompt`/`useAlert` hooks, PrepFlow voice (loads for dialog components)
- **[Architecture](.cursor/rules/architecture.md)** - Folder structure, import boundaries (loads for `app/**`, `lib/**`)
- **[Git Workflow](.cursor/rules/git.md)** - Branching, commit format, safe-merge (loads for `.github/**`)
- **[Stack Versions](.cursor/rules/stack.md)** - Exact package versions and constraints (loads for `package.json`)
- **[Error Patterns](.cursor/rules/error-patterns.mdc)** - Learned fixes for common errors (loads for `app/api/**`)
- **[RSI Standards](docs/AI_RULES.md#6-recursive-self-improvement-rsi)** - Autonomous repair and evolution rules

### Implementation Guides

- **[Project Architecture](docs/PROJECT_ARCHITECTURE.md)** - Technical architecture, file structure, unified architecture
- **[API Endpoints Reference](docs/API_ENDPOINTS.md)** - Complete API documentation (59 endpoints)
- **[Feature Implementation Guide](docs/FEATURE_IMPLEMENTATION.md)** - Current status, best practices, implementation patterns
- **[Project Roadmap](docs/PROJECT_ROADMAP.md)** - Success metrics, future roadmap
- **[Landing Page Guide](docs/LANDING_PAGE_GUIDE.md)** - Landing page components, style system
- **[File Size Refactoring Guide](docs/FILE_SIZE_REFACTORING_GUIDE.md)** - Proven refactoring patterns, examples, and best practices for fixing file size violations
- **[Tech Debt Backlog](docs/TECH_DEBT_BACKLOG.md)** - Track cleanup violations (console.log, file size, etc.) for gradual fixes

### Setup & Configuration

- **[Auth0 & Stripe Reference](docs/AUTH0_STRIPE_REFERENCE.md)** - Complete Auth0 and Stripe setup guide
- **[Square API Reference](docs/SQUARE_API_REFERENCE.md)** - Square POS integration guide
- **[Friend Access Guide](docs/FRIEND_ACCESS.md)** - Shared workspace configuration

### Development Utilities

**Reset and Seed (dev-only):**

- `POST /api/db/reset` — wipes domain tables in FK-safe order
- `POST /api/populate-clean-test-data` — generates all clean test data (ingredients, recipes, suppliers, equipment, cleaning, compliance). Replaces existing data
- `POST /api/db/reset-self` — authenticated self-reset that deletes only the current user's data (`user_id` scoped). Supports `?dry=1`. No reseed
- Both require header `X-Admin-Key: $SEED_ADMIN_KEY` and are blocked in production
- Optional `?dry=1` for a dry-run plan

### TypeScript Gotchas

**Supabase TypeScript Gotcha (Vercel Build):**

- Do not chain `.catch()` on Supabase query builders; they are not Promises until awaited
- Always use: `const { data, error } = await supabase.from('table').insert(row);`
- Handle `error` explicitly; avoid `.catch()` which breaks type checks on Vercel

**TypeScript Ref Types (React useRef):**

- **MANDATORY:** Always use `RefObject<HTMLElement | null>` when declaring ref types in interfaces or function return types
- When using `useRef<HTMLElement>(null)`, TypeScript infers the type as `RefObject<HTMLElement | null>`, not `RefObject<HTMLElement>`
- This prevents TypeScript build errors on Vercel

## 🔄 Quick Reference

### Essential Commands

```bash
# Pre-deployment check (MANDATORY before pushing to main)
npm run pre-deploy

# Code quality checks
npm run lint              # ESLint
npm run type-check        # TypeScript
npm run format:check      # Prettier
npm run cleanup:check     # All standards

# Auto-fix available issues
npm run cleanup:fix
npm run rsi:fix           # Autonomous RSI repair

# Breakpoint detection
npm run detect-breakpoints
```

### Key Patterns

**Optimistic Updates (MANDATORY for CRUD):**

- Store original state → Update UI immediately → Make API call → Revert on error
- See: `development.mdc` (Optimistic Updates Pattern)

**File Size Limits:** Pages: 500 | Components: 300 | API: 200 | Utils: 150 | Hooks: 120

**Custom Breakpoints:** `tablet:` (481px+) | `desktop:` (1025px+, PRIMARY) | `large-desktop:` (1440px+) | `xl:` (1920px+) | `2xl:` (2560px+). NEVER use `sm:`, `md:`, `lg:`.

### Tech Stack Summary

| Layer        | Package                 | Version | Notes                             |
| ------------ | ----------------------- | ------- | --------------------------------- |
| Framework    | Next.js                 | 16      | App Router, `proxy.ts` convention |
| Auth         | `@auth0/nextjs-auth0`   | v4      | NOT NextAuth                      |
| Database     | `@supabase/supabase-js` | v2      | DB only, not auth                 |
| Payments     | `stripe`                | v20     | with webhook idempotency          |
| POS          | `square`                | v44     | OAuth sync via `lib/square/`      |
| Styling      | Tailwind CSS            | v4      | Custom breakpoints (see above)    |
| Animation    | `framer-motion`         | v12     | See `design.mdc` for patterns     |
| Server state | `@tanstack/react-query` | v5      | See `technical.mdc`               |
| UI state     | `zustand`               | v5      | See `technical.mdc`               |
| Validation   | `zod`                   | v4      | MANDATORY for all API inputs      |
| Charts       | `recharts`              | v3      | Temperature analytics             |
| E2E tests    | `@playwright/test`      | v1.58   | See `testing.mdc`                 |
| Language     | TypeScript              | 5       | Strict mode                       |

## 🎯 PrepFlow COGS Dynamic Methodology

The PrepFlow performance analysis system uses a **dynamic approach** that automatically adapts to your menu data:

- **Dynamic Profit Thresholds:** `profitThreshold = averageProfitMargin` (HIGH if above average, LOW if below)
- **Dynamic Popularity Thresholds:** `popularityThreshold = averagePopularity * 0.8` (HIGH if ≥ 80% of average)
- **Menu Item Classifications:** Chef's Kiss (High Profit + High Popularity), Hidden Gem (High Profit + Low Popularity), Bargain Bucket (Low Profit + High Popularity), Burnt Toast (Low Profit + Low Popularity)

**See:** `.cursor/rules/implementation.mdc` (PrepFlow COGS Dynamic Methodology) for complete details

## 🇦🇺 Queensland Food Safety Standards

PrepFlow automatically applies Queensland food safety regulations to all temperature monitoring equipment:

- **Cold Storage:** 0°C to 5°C
- **Hot Holding:** ≥60°C
- **Freezer Standards:** -24°C to -18°C
- **2-Hour/4-Hour Rule:** Automatic time-in-danger-zone management

**See:** `.cursor/rules/implementation.mdc` (Queensland Food Safety Standards Integration) for complete details

## 🧭 Modern Navigation System

- **Collapsible Sidebar:** 320px width, hidden by default
- **Smart Search:** ⌘K shortcut for quick access
- **Keyboard Shortcuts:** ⌘B to toggle sidebar, ⌘K for search
- **Touch-Optimized:** 44px minimum touch targets

**See:** `.cursor/rules/implementation.mdc` (Modern Navigation System) for complete details

## 📊 Current Status

**✅ Completed:**

- All 19 webapp pages implemented
- 59 API endpoints working
- Performance optimizations (80-90% load time reduction)
- Mobile optimization complete
- Comprehensive error handling

**📋 Next Steps:**

- Production deployment
- Performance monitoring
- SEO enhancement
- User testing

**See:** [Feature Implementation Guide](docs/FEATURE_IMPLEMENTATION.md) for complete status

## 🔗 Additional Resources

- **Scripts Reference:** `docs/SCRIPTS.md` - Complete script documentation (includes `test:smoke`, `test:crawl`)
- **E2E Testing:** `docs/E2E_TESTING_GUIDE.md` - Crawl report (`CRAWL_REPORT.md` / `CRAWL_REPORT.json`), smoke test, QA audit
- **Print/Export/Import:** `docs/PRINT_EXPORT_IMPORT_PATTERNS.md` - Standardized patterns
- **CSV Import:** `docs/CSV_IMPORT_INTEGRATION.md` - CSV import guide
- **Voice Guide:** `docs/VOICE_ENHANCEMENT_GUIDE.md` - PrepFlow voice guidelines

---

**Remember:** PrepFlow is a high-converting landing page that needs to balance technical excellence with conversion optimization. Every change should be measured and optimized for maximum impact on both user experience and business results.
