---
description: Folder structure, module boundaries, import rules (what can import what)
globs: app/**, lib/**, components/**
---

# Architecture — Folder Structure, Module Boundaries & What Goes Where

## Top-Level Map

```
prepflow-web/
├── app/                    # Next.js App Router (pages + API routes)
├── components/             # Shared React components (not page-specific)
├── contexts/               # React context providers (3: Notification, GlobalWarning, Country)
├── hooks/                  # Custom React hooks (150+ hooks, co-located tests)
├── lib/                    # Business logic, utilities, third-party wrappers
├── types/                  # Global TypeScript type definitions
├── public/                 # Static assets (images, icons, fonts)
├── e2e/                    # Playwright E2E tests
├── __tests__/              # Jest unit/integration tests
├── scripts/                # Build, migration, audit, and utility scripts
├── docs/                   # Project documentation (ADRs, guides, references)
├── migrations/             # Database migration SQL files
├── supabase/               # Supabase project config
└── .cursor/                # Cursor IDE rules, skills, plans
```

## `app/` Structure

```
app/
├── page.tsx                # Landing page (marketing)
├── layout.tsx              # Root layout (analytics, providers)
├── globals.css             # Global styles, CSS variables, custom breakpoints
├── providers.tsx           # React Query + context providers
├── proxy.ts                # Auth0 + security middleware (Next.js 16 convention)
│
├── api/                    # 300+ API routes
│   └── [domain]/           # Each domain gets its own folder
│       ├── route.ts        # Thin handler: validates input, calls helpers, returns response
│       └── helpers/        # All business logic lives here
│           └── myHelper.ts
│
├── webapp/                 # Authenticated app (34 routes)
│   ├── layout.tsx          # Webapp layout (navigation, auth gate)
│   ├── page.tsx            # Dashboard
│   ├── [feature]/
│   │   ├── page.tsx        # Page component (<500 lines)
│   │   ├── layout.tsx      # Feature layout (optional)
│   │   ├── components/     # Feature-specific components
│   │   │   └── hooks/      # Component-scoped hooks
│   │   └── hooks/          # Feature-scoped hooks
│   └── components/         # Shared webapp components (navigation, etc.)
│
├── admin/                  # Admin dashboard (separate from webapp)
│   └── [section]/
│       ├── page.tsx
│       └── components/
│
├── curbos/                 # CurbOS integration (PROTECTED — do not modify)
├── curbos-import/          # CurbOS import utilities (PROTECTED)
│
└── [marketing pages]       # pricing/, privacy-policy/, terms-of-service/, etc.
```

## `lib/` Structure

Everything in `lib/` is server-safe unless it imports a client API (e.g., `localStorage`).

```
lib/
├── [domain]/               # Domain-specific business logic
│   ├── index.ts            # Public API (re-exports)
│   └── helpers/            # Internal helpers
│
├── ai/                     # AI service wrappers
│   ├── ai-service/         # Unified AI service (chat, vision)
│   ├── groq-client.ts      # Groq API client
│   ├── gemini-client.ts    # Gemini client (deprecated, flagged for removal)
│   ├── huggingface-client/ # Hugging Face client
│   └── prompts/            # AI prompt templates
│
├── auth0/                  # Auth0 SDK client instance
├── auth0-api-helpers.ts    # API route auth helpers
├── auth0-middleware.ts     # Middleware/proxy auth helpers
├── auth0-management/       # Auth0 Management API (role extraction)
│
├── billing/                # Stripe billing helpers
├── billing-sync/           # Subscription sync utilities
├── tier-config-db/         # Tier config from database
├── feature-gate/           # Feature gating by subscription tier
├── feature-flags/          # Runtime feature flags (DB-backed)
│
├── cache/                  # Caching utilities
│   ├── data-cache.ts       # Generic sessionStorage cache
│   └── prefetch-config.ts  # Route → API endpoint prefetch map
│
├── exports/                # PDF/export generation (Puppeteer)
├── qr-codes/               # QR code generation
├── csv/                    # CSV import/export
│
├── optimistic-updates.ts   # Generic optimistic update helpers
├── api-error-handler/      # ApiErrorHandler class
├── logger/                 # Logger utility (replaces console.*)
├── supabase.ts             # Supabase client singleton
│
├── square/                 # Square POS integration (226 files)
│   ├── client/             # Square API client factory
│   ├── sync/               # Sync operations (catalog, staff, orders, costs)
│   └── mappings/           # ID mapping tables
│
├── backup/                 # Google Drive backup system
│   ├── google-drive/       # OAuth + Drive API
│   ├── export/             # Backup export logic
│   └── restore/            # Backup restore logic
│
├── rsi/                    # Recursive Self-Improvement system
├── skill-learning/         # Skill learning utilities
├── error-learning/         # Error pattern learning
│
└── types/                  # Shared TypeScript types (within lib)
```

## `components/` Structure

Only truly shared components — if a component is used in only one feature, it lives in `app/webapp/[feature]/components/` instead.

```
components/
├── ui/                     # Base UI components (Button, Card, Icon, etc.)
│   ├── Icon.tsx            # Lucide icon wrapper (use this, not direct lucide imports)
│   ├── ConfirmDialog.tsx   # Confirmation dialog
│   ├── InputDialog.tsx     # Input dialog
│   ├── LoadingSkeleton.tsx # Loading skeleton variants
│   ├── TablePagination.tsx # Pagination component
│   ├── ScrollReveal.tsx    # Scroll animation wrapper
│   ├── MagneticButton.tsx  # Landing page magnetic button
│   ├── GlowCard.tsx        # Landing page glow card
│   └── animated/           # Animated component variants
│
├── Arcade/                 # Easter egg arcade games
├── EasterEggs/             # Easter egg triggers
├── ErrorGame/              # Error page game
├── Loading/                # Full-page loading states
├── CountrySetup/           # Country detection UI
├── gamification/           # Gamification UI components
├── personality/            # Personality system UI
├── demo/                   # Demo mode components
├── pricing/                # Pricing page components
└── variants/               # A/B testing variants
```

## `hooks/` Structure

```
hooks/
├── useHookName.ts          # Hook implementation
├── useHookName.test.ts     # Co-located unit test (MANDATORY)
└── useHookName/            # Complex hooks get a subdirectory
    ├── helpers/            # Internal hook helpers
    │   ├── myHelper.ts
    │   └── myHelper.test.ts
    └── types.ts            # Hook-specific types
```

## Module Boundary Rules

| Importing FROM → | `app/api/`             | `app/webapp/` | `lib/`        | `components/` | `hooks/` |
| ---------------- | ---------------------- | ------------- | ------------- | ------------- | -------- |
| `app/api/`       | ✅ same domain helpers | ❌ never      | ✅ yes        | ❌ never      | ❌ never |
| `app/webapp/`    | via `fetch()` only     | ✅ yes        | ✅ yes        | ✅ yes        | ✅ yes   |
| `lib/`           | ❌ never               | ❌ never      | ✅ within lib | ❌ never      | ❌ never |
| `components/`    | ❌ never               | ❌ never      | ✅ yes        | ✅ yes        | ✅ yes   |
| `hooks/`         | ❌ never               | ❌ never      | ✅ yes        | ❌ never      | ✅ yes   |

Key rules:

- API routes **never** import from `components/` or `hooks/`
- `lib/` **never** imports from `app/` or `components/`
- Webapp pages communicate with API via `fetch()` — never direct imports across the boundary
- `hooks/` may import from `lib/` but never from `app/`

## File Size Limits

| Type            | Max Lines | Where                                     |
| --------------- | --------- | ----------------------------------------- |
| Page components | 500       | `app/webapp/*/page.tsx`                   |
| Components      | 300       | `components/`, `app/webapp/*/components/` |
| API routes      | 200       | `app/api/*/route.ts`                      |
| Utilities       | 150       | `lib/`                                    |
| Hooks           | 120       | `hooks/`                                  |
| Data files      | 2000      | seed data, translations                   |

## Naming Conventions

- **Files:** kebab-case → `my-component.tsx`, `my-helper.ts`
- **React components:** PascalCase → `MyComponent`
- **Functions:** camelCase with verb → `fetchIngredients`, `buildQuery`
- **Constants:** UPPER_SNAKE_CASE → `MAX_BATCH_SIZE`
- **Types/interfaces:** PascalCase → `IngredientRow`, `ApiResponse<T>`
- **Test files:** co-located, same name + `.test.ts` → `myHelper.test.ts`

## Special Protected Areas

- `app/curbos/` — Never modify. Pre-commit hook enforces this.
- `app/curbos-import/` — Excluded from all tooling (lint, typecheck, prettier, cleanup).
- `migrations/` — Never edit existing migration files. Add new ones only.
- `package-lock.json` — Never manually edit.
- `e2e/` — Excluded from TypeScript compilation (`tsconfig.json` excludes it).
