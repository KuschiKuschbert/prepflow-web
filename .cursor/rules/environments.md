---
description: Environment variables, dev/staging/prod differences, feature flags
globs: .env*, env.example, vercel.json
---

# Environments — Env Vars, Dev/Staging/Prod Differences & Feature Flags

## Environment Files

- `.env.local` — development secrets (gitignored, never commit)
- No `.env.example` exists yet — **this is a tech debt item** (see `TECH_DEBT.md`)
- Vercel dashboard holds staging and production environment variables
- Production and development use different Auth0 tenants and Stripe keys

## All Environment Variables (names only)

### Supabase

| Variable                        | Required | Purpose                                           |
| ------------------------------- | -------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL (public)                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key (public)                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service role (server only, never expose) |
| `SUPABASE_ACCESS_TOKEN`         | No       | Supabase CLI access token                         |

### Auth0

| Variable                  | Required   | Purpose                                                                |
| ------------------------- | ---------- | ---------------------------------------------------------------------- |
| `AUTH0_SECRET`            | Yes        | Session encryption secret (min 32 chars, `openssl rand -hex 32`)       |
| `AUTH0_BASE_URL`          | Yes        | App URL (`http://localhost:3000` dev, `https://www.prepflow.org` prod) |
| `AUTH0_ISSUER_BASE_URL`   | Yes        | Auth0 tenant URL                                                       |
| `AUTH0_CLIENT_ID`         | Yes        | Auth0 app client ID                                                    |
| `AUTH0_CLIENT_SECRET`     | Yes        | Auth0 app client secret                                                |
| `AUTH0_M2M_CLIENT_ID`     | No         | Machine-to-machine client for Management API                           |
| `AUTH0_M2M_CLIENT_SECRET` | No         | Machine-to-machine secret                                              |
| `AUTH0_TENANT_DOMAIN`     | No         | Auth0 domain (extracted from issuer URL if not set)                    |
| `AUTH0_DOMAIN`            | No         | Alias for `AUTH0_TENANT_DOMAIN`                                        |
| `NEXTAUTH_SECRET`         | Deprecated | Use `AUTH0_SECRET` instead                                             |
| `NEXTAUTH_URL`            | Deprecated | Use `AUTH0_BASE_URL` instead                                           |

### Stripe

| Variable                        | Required | Purpose                                   |
| ------------------------------- | -------- | ----------------------------------------- |
| `STRIPE_SECRET_KEY`             | Yes      | `sk_test_...` (dev), `sk_live_...` (prod) |
| `STRIPE_PUBLISHABLE_KEY`        | Yes      | `pk_test_...` (dev), `pk_live_...` (prod) |
| `STRIPE_WEBHOOK_SECRET`         | Yes      | Webhook signing secret (`whsec_...`)      |
| `STRIPE_WEBHOOK_SECRET_DEV`     | No       | Dev-specific webhook secret               |
| `STRIPE_WEBHOOK_SECRET_PROD`    | No       | Prod-specific webhook secret              |
| `STRIPE_PRICE_STARTER_MONTHLY`  | Yes      | Price ID for Starter tier                 |
| `STRIPE_PRICE_PRO_MONTHLY`      | Yes      | Price ID for Pro tier                     |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | Yes      | Price ID for Business tier                |

### Email (Resend)

| Variable         | Required | Purpose              |
| ---------------- | -------- | -------------------- |
| `RESEND_API_KEY` | Yes      | Resend API key       |
| `FROM_EMAIL`     | Yes      | Sender email address |
| `FROM_NAME`      | Yes      | Sender display name  |
| `SMTP_HOST`      | No       | SMTP fallback host   |
| `SMTP_PORT`      | No       | SMTP fallback port   |
| `SMTP_USER`      | No       | SMTP username        |
| `SMTP_PASS`      | No       | SMTP password        |

### AI Services

| Variable                   | Required | Purpose                                            |
| -------------------------- | -------- | -------------------------------------------------- |
| `AI_ENABLED`               | No       | Feature flag to enable/disable AI (`true`/`false`) |
| `OPENAI_API_KEY`           | No       | OpenAI API key                                     |
| `OPENAI_MODEL`             | No       | OpenAI model name                                  |
| `GEMINI_API_KEY`           | No       | Google Gemini API key                              |
| `GEMINI_MODEL`             | No       | Gemini model name                                  |
| `GOOGLE_AI_STUDIO_API_KEY` | No       | Google AI Studio key                               |
| `HUGGINGFACE_API_KEY`      | No       | Hugging Face API key                               |
| `HUGGINGFACE_TEXT_MODEL`   | No       | HF text model                                      |
| `HUGGINGFACE_IMAGE_MODEL`  | No       | HF image model                                     |
| `HUGGINGFACE_VISION_MODEL` | No       | HF vision model                                    |
| `OLLAMA_NUM_GPU`           | No       | Ollama GPU count (local dev)                       |
| `OLLAMA_NUM_CTX`           | No       | Ollama context size                                |
| `OLLAMA_PERFORMANCE_MODE`  | No       | Ollama performance mode                            |

### Square POS

| Variable                      | Required | Purpose              |
| ----------------------------- | -------- | -------------------- |
| `SQUARE_APPLICATION_ID`       | No       | Square app ID        |
| `SQUARE_APPLICATION_SECRET`   | No       | Square app secret    |
| `SQUARE_TOKEN_ENCRYPTION_KEY` | No       | Token encryption key |

### Google (Backup)

| Variable                      | Required | Purpose                               |
| ----------------------------- | -------- | ------------------------------------- |
| `GOOGLE_CLIENT_ID`            | No       | Google OAuth client ID                |
| `GOOGLE_CLIENT_SECRET`        | No       | Google OAuth client secret            |
| `GOOGLE_REDIRECT_URI`         | No       | OAuth redirect URI                    |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | No       | Drive token encryption key            |
| `GITHUB_TOKEN`                | No       | GitHub API token (for latest release) |

### Backup

| Variable                         | Required | Purpose                    |
| -------------------------------- | -------- | -------------------------- |
| `PREPFLOW_BACKUP_ENCRYPTION_KEY` | No       | Backup file encryption key |

### Application

| Variable           | Required | Purpose                             |
| ------------------ | -------- | ----------------------------------- |
| `NODE_ENV`         | Yes      | `development`, `production`, `test` |
| `PORT`             | No       | Server port (default 3000)          |
| `CORS_ORIGIN`      | No       | CORS origin                         |
| `LOG_LEVEL`        | No       | Logger level                        |
| `STORE_ERROR_LOGS` | No       | Enable error log storage            |

### Security & Admin

| Variable                  | Required  | Purpose                                                       |
| ------------------------- | --------- | ------------------------------------------------------------- |
| `SEED_ADMIN_KEY`          | Yes (dev) | Admin key for `/api/db/reset` and `/api/populate-*` endpoints |
| `ADMIN_BYPASS`            | No        | Admin bypass flag                                             |
| `BCRYPT_ROUNDS`           | No        | bcrypt rounds for password hashing                            |
| `RATE_LIMIT_WINDOW_MS`    | No        | Rate limit window in ms                                       |
| `RATE_LIMIT_MAX_REQUESTS` | No        | Rate limit max requests                                       |

### Access Control

| Variable            | Required | Purpose                                                  |
| ------------------- | -------- | -------------------------------------------------------- |
| `ALLOWED_EMAILS`    | No       | Comma-separated email allowlist                          |
| `DISABLE_ALLOWLIST` | No       | `true` disables email allowlist (all auth users allowed) |

### CurbOS

| Variable                               | Required | Purpose             |
| -------------------------------------- | -------- | ------------------- |
| `NEXT_PUBLIC_CURBOS_SUPABASE_URL`      | No       | CurbOS Supabase URL |
| `NEXT_PUBLIC_CURBOS_SUPABASE_ANON_KEY` | No       | CurbOS Supabase key |

### Testing

| Variable                 | Required | Purpose                           |
| ------------------------ | -------- | --------------------------------- |
| `SIM_AUTH_EMAIL`         | No       | Simulation auth email             |
| `SIM_AUTH_PASSWORD`      | No       | Simulation auth password          |
| `PERFORMANCE_TEST_TOKEN` | No       | Token for performance test bypass |
| `CRON_SECRET`            | No       | Cron job authorization secret     |

### Vercel

| Variable            | Required | Purpose                        |
| ------------------- | -------- | ------------------------------ |
| `VERCEL_TOKEN`      | No       | Vercel API token (for scripts) |
| `VERCEL_ORG_ID`     | No       | Vercel organization ID         |
| `VERCEL_PROJECT_ID` | No       | Vercel project ID              |

## Environment Differences

| Setting             | Development             | Staging (Vercel Preview) | Production                 |
| ------------------- | ----------------------- | ------------------------ | -------------------------- |
| `NODE_ENV`          | `development`           | `production`             | `production`               |
| `AUTH0_BASE_URL`    | `http://localhost:3000` | Preview URL              | `https://www.prepflow.org` |
| Stripe keys         | `sk_test_...`           | `sk_test_...`            | `sk_live_...`              |
| Auth allowlist      | Bypassed automatically  | Configured               | Configured                 |
| Error messages      | Detailed                | Detailed                 | Generic                    |
| Debug routes        | Accessible              | Blocked                  | Blocked                    |
| Dev tools           | Enabled                 | Disabled                 | Disabled                   |
| `DISABLE_ALLOWLIST` | `true` (optional)       | —                        | —                          |

## Feature Flags

Feature flags are stored in the database (`feature_flags` table) and toggled via admin UI at `/admin/features` or API at `/api/admin/features/[flag]`.

**Read a flag in server code:**

```typescript
import { getFeatureFlag } from '@/lib/feature-flags';
const isEnabled = await getFeatureFlag('my-feature', userId);
```

**Read a flag in client code:**

```typescript
const { isEnabled } = useFeatureFlag('my-feature');
```

**AI feature flag:** The `AI_ENABLED` env var is a coarse on/off toggle. Individual AI features may also be controlled by DB feature flags.

## Accessing Environment Variables

```typescript
// ✅ Server-only (API routes, lib/)
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ✅ Client-safe (NEXT_PUBLIC_ prefix only)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// ❌ NEVER expose server secrets to client
const secret = process.env.STRIPE_SECRET_KEY; // Only use in API routes / lib/
```

## Validation

Environment variables are validated at runtime in `lib/env-validation.ts` (or equivalent). The app fails fast if required vars are missing.
