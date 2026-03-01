---
description: Full tech stack versions, library constraints, and upgrade notes for PrepFlow/CurbOS
globs: package.json, package-lock.json, tsconfig.json, next.config.ts, tailwind.config.ts
---

# Stack — Full Tech Stack, Versions & Constraints

## Runtime & Framework

- **Node.js:** >=22.0.0 (enforced by `scripts/check-legal-and-node.js`)
- **Next.js:** ^16.0.7 (App Router, `proxy.ts` convention replaces middleware)
- **React:** ^19.2.1
- **TypeScript:** ^5.9.2 (strict mode, `noEmit: true`)

## Styling

- **Tailwind CSS:** ^4.2.1 (PostCSS plugin: `@tailwindcss/postcss`)
- **prettier-plugin-tailwindcss:** ^0.7.2 (auto-sorts classes on save)
- **Custom breakpoints ONLY:** `tablet:` (481px), `desktop:` (1025px), `large-desktop:` (1440px), `xl:` (1920px), `2xl:` (2560px)
- Standard Tailwind `sm:`, `md:`, `lg:` are **disabled** in the config

## Database & Auth

- **Supabase JS:** ^2.78.0 (PostgreSQL + storage; NOT used for user auth)
- **Auth0 Next.js SDK:** ^4.13.3 (`@auth0/nextjs-auth0`)
- **Auth0 Node SDK:** ^5.3.1 (`auth0`) — Management API calls only

## Payments

- **Stripe:** ^20.3.0 (API version: `2025-11-17.clover`)

## State & Data Fetching

- **TanStack React Query:** ^5.90.21 (server state)
- **Zustand:** ^5.0.9 (client state, used sparingly)
- **Native `fetch` + optimistic updates** for most CRUD

## UI & Animation

- **Lucide React:** ^0.563.0 (icons — exclusive icon library)
- **Framer Motion:** ^12.34.3 (animations)
- **@dnd-kit:** core ^6.3.1, sortable ^10.0.0 (drag-and-drop)
- **Recharts:** ^3.7.0 (charts)
- **Sonner:** ^2.0.7 (toast notifications — alternative to custom `useNotification`)
- **canvas-confetti:** ^1.9.4 (gamification effects)
- **react-signature-canvas:** ^1.0.7

## AI / ML

- **@huggingface/inference:** ^4.13.4
- Groq client: internal wrapper at `lib/ai/groq-client.ts`
- Gemini client: `lib/ai/gemini-client.ts` (flagged for removal)
- Hugging Face: `lib/ai/huggingface-client.ts`

## Integrations

- **Square:** ^44.0.0 (POS sync, 226 files in `lib/square/`)
- **Stripe:** ^20.3.0
- **googleapis:** ^171.2.0 (Google Drive backup)
- **Resend** (email, via API key — no SDK package)
- **Puppeteer Core:** ^24.37.2 + **@sparticuz/chromium:** ^143.0.4 (PDF generation)
- **QRCode:** ^1.5.4, **qrcode.react:** ^4.2.0

## Data Processing

- **Zod:** ^4.1.12 (input validation — MANDATORY for all POST/PUT/PATCH routes)
- **PapaParse:** ^5.4.1 (CSV import/export)
- **date-fns:** ^4.1.0 (date formatting)
- **UUID:** ^13.0.0
- **axios:** ^1.13.2 (used in some scripts; prefer native `fetch` in app code)

## Testing

- **Jest:** ^30.2.0 + **jest-environment-jsdom:** ^30.2.0
- **@testing-library/react:** ^16.3.2
- **@testing-library/jest-dom:** ^6.9.1
- **Playwright:** ^1.58.2 (E2E; config in `playwright.config.ts`)

## Build & Tooling

- **ESLint:** ^9.38.0 + **eslint-config-next:** ^16.0.7
- **Prettier:** ^3.4.2
- **Husky:** ^9.1.7 (pre-commit hooks)
- **lint-staged:** ^16.16.2
- **jscodeshift:** ^17.3.0 (codemods)
- **madge:** ^8.0.0 (circular dependency detection)
- **tsx:** ^4.21.0 (run TypeScript scripts directly)
- **sharp:** ^0.34.3 (image processing)
- **commitlint:** ^20.4.2 (Conventional Commits enforcement)

## Analytics & Monitoring

- **@vercel/analytics:** ^1.6.1
- **@vercel/speed-insights:** ^1.2.0
- **web-vitals:** ^5.1.0
- Google Tag Manager (GTM-WQMV22RD), GA4 (G-W1D5LQXGJT)

## Deployment

- **Vercel** (production + preview)
- `compress: false` in `next.config.ts` — Vercel handles compression
- Node 22 LTS required (checked at deploy time)

## Key Constraints

- Never chain `.catch()` on Supabase query builders (breaks TypeScript types on Vercel)
- Always use `RefObject<HTMLElement | null>` (not `RefObject<HTMLElement>`) in interfaces
- No `console.log` in production code — use `lib/logger`
- No `any` type without justification and comment
- `app/curbos/` is protected — never modify without `ALLOW_CURBOS_MODIFY=1`
- `app/curbos/` and `app/curbos-import/` are excluded from all linting, type-checking, and formatting

## Version Upgrade Notes

- Next.js 16: `context.params` is a Promise — always `await context.params`
- Next.js 16: uses `proxy.ts` convention (not `middleware.ts`)
- Auth0 SDK v4+: uses `/api/auth/[auth0]` catch-all route (not `/api/auth/callback/auth0`)
- Tailwind v4: config is in `tailwind.config.ts`, not `tailwind.config.js`
- Zod v4: some breaking changes from v3 — check migration guide if adding validators
