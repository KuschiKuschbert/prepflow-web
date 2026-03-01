---
description: Third-party integration patterns - Auth0, Stripe, Square, Supabase, Google Drive
globs: lib/auth0*, lib/stripe*, lib/square/**, app/api/webhook/**, app/api/billing/**
---

# Integrations — Third-Party Services, Auth Patterns & Wrapper Conventions

## Auth0 (Authentication)

**Package:** `@auth0/nextjs-auth0` ^4.13.3  
**Wrapper files:** `lib/auth0.ts`, `lib/auth0-api-helpers.ts`, `lib/auth0-middleware.ts`, `lib/auth0-management/`

### Pattern

- Auth0 SDK handles all authentication via the catch-all route `app/api/auth/[auth0]/route.ts`
- `proxy.ts` enforces auth checks on `/webapp/**` and `/api/**` using `lib/auth0-middleware.ts`
- User sync on first login: `lib/auth-user-sync.ts`
- Role extraction (fallback chain): JWT token → Auth0 Management API
- **Never** use `getServerSideProps` for auth — use `proxy.ts` + Auth0 SDK session

### Getting the current user in API routes

```typescript
import { getAuthenticatedUser } from '@/lib/auth0-api-helpers';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // user.email, user.sub, user.role
}
```

### Session management

- Sessions are 4-hour inactivity timeout, 24-hour absolute timeout
- `AUTH0_SECRET` minimum 32 characters
- Callback URL: `/api/auth/callback` (NOT `/api/auth/callback/auth0`)

---

## Supabase (Database)

**Package:** `@supabase/supabase-js` ^2.78.0  
**Client file:** `lib/supabase.ts` (singleton — import this, never create new clients in route handlers)

### Pattern

```typescript
import { supabaseAdmin } from '@/lib/supabase';

// ✅ Always destructure { data, error } — never chain .catch()
const { data, error } = await supabaseAdmin.from('ingredients').select('*').eq('user_id', userId);

if (error) {
  logger.error('Query failed', { error });
  return ApiErrorHandler.createError('DB_ERROR', 'Database error', 500);
}
```

### Key rules

- Use `supabaseAdmin` (service role) in API routes — full database access
- Never use `supabaseAdmin` in client components — security risk
- Use `.in()` for batch queries instead of N sequential `.eq()` calls
- Always paginate: `.range(from, to)` for large tables
- Canonical field: `ingredient_name` (not `ingredients.name`)

---

## Stripe (Payments)

**Package:** `stripe` ^20.3.0  
**Wrapper files:** `lib/billing/`, `lib/billing-sync/`, `lib/tier-config-db/`, `lib/feature-gate/`

### Pattern

```typescript
import { stripe } from '@/lib/stripe'; // singleton

// Create checkout session (from API route)
const session = await stripe.checkout.sessions.create({ ... });
```

### Webhook handling

- All webhooks at `POST /api/webhook/stripe`
- **MUST** verify signature before processing:

```typescript
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

- Idempotency checked via `webhook_events` table
- Return `200` for success, `400` to not retry, `500` to retry

### Key tables

- `users` — `tier`, `stripe_customer_id`, `stripe_subscription_id`
- `billing_customers` — customer ID cache by email
- `webhook_events` — idempotency tracking

---

## Square POS (Point of Sale Sync)

**Package:** `square` ^44.0.0  
**Wrapper files:** `lib/square/` (226 files)

### Pattern

```typescript
import { createSquareClient } from '@/lib/square/client/factory';

const client = await createSquareClient(userId); // loads OAuth token from DB
const { result } = await client.catalogApi.listCatalog();
```

### OAuth flow

1. User initiates at `/webapp/square`
2. Redirect to `/api/square/oauth`
3. Callback at `/api/square/callback`
4. Token stored encrypted in database

### Sync operations

- `lib/square/sync/catalog/` — dishes ↔ Square items
- `lib/square/sync/staff/` — employees ↔ Square team members
- `lib/square/sync/orders/` — order history
- `lib/square/sync/costs/` — ingredient costs
- `lib/square/mappings/` — ID mapping between PrepFlow and Square IDs

### Webhook

- `POST /api/webhook/square` — Square event webhooks

---

## Google APIs (Drive Backup)

**Package:** `googleapis` ^171.2.0  
**Wrapper files:** `lib/backup/google-drive/`

### Pattern

```typescript
import { getDriveClient } from '@/lib/backup/google-drive/oauth-client';

const drive = await getDriveClient(userId); // loads OAuth token from DB
await drive.files.create({ ... });
```

### OAuth flow

1. User connects at `/webapp/settings/backup`
2. Auth URL from `/api/backup/google-auth`
3. Callback at `/api/backup/google-callback`
4. Token stored encrypted (`GOOGLE_TOKEN_ENCRYPTION_KEY`)

---

## AI Services

**Wrapper:** `lib/ai/ai-service/` (unified interface)

### Available providers

| Provider     | Wrapper                      | Use for                              |
| ------------ | ---------------------------- | ------------------------------------ |
| Groq         | `lib/ai/groq-client.ts`      | Fast text generation (primary)       |
| Hugging Face | `lib/ai/huggingface-client/` | Image classification, embeddings     |
| Gemini       | `lib/ai/gemini-client.ts`    | **Deprecated — flagged for removal** |

### Pattern

```typescript
import { generateText } from '@/lib/ai/ai-service/chat';

const response = await generateText({
  prompt: 'Describe this dish...',
  maxTokens: 200,
});
```

### Feature flag

Check `AI_ENABLED` env var before making AI calls. Always handle failures gracefully — AI is non-critical.

---

## Resend (Email)

**No SDK package** — calls Resend REST API directly via `fetch`.  
**Wrapper:** `lib/email/sender.ts`

### Pattern

```typescript
import { sendEmail } from '@/lib/email/sender';

await sendEmail({
  to: user.email,
  subject: 'Welcome to PrepFlow',
  html: '<p>...</p>',
});
```

---

## Puppeteer / Chromium (PDF Export)

**Packages:** `puppeteer-core` ^24.37.2, `@sparticuz/chromium` ^143.0.4  
**Wrapper:** `lib/exports/generate-pdf.ts`

### Pattern

```typescript
import { generatePDF } from '@/lib/exports/generate-pdf';

const pdfBuffer = await generatePDF(htmlContent, options);
```

- Uses `@sparticuz/chromium` for Vercel/Lambda compatibility (no full Chromium binary)
- Only used server-side in API routes
- Avoid in hot paths — PDF generation is slow (~2-5s)

---

## Vercel Analytics

**Package:** `@vercel/analytics` ^1.6.1  
**Component:** `components/ClientAnalytics.tsx`

Automatically tracks page views. No additional setup needed.

---

## Google Analytics & GTM

**Components:** `components/GoogleAnalytics.tsx`, `components/GoogleTagManager.tsx`  
**GTM Container:** GTM-WQMV22RD  
**GA4 Measurement ID:** G-W1D5LQXGJT

### Event tracking

```typescript
import { trackEvent } from '@/lib/analytics';

trackEvent('recipe_created', { category: 'recipes', label: recipeName });
```

---

## Wrapper Convention (for all integrations)

1. **Always wrap third-party clients in a singleton** — never instantiate in route handlers
2. **Always wrap API calls in try/catch** — third-party services fail
3. **Always log errors** with `logger.error()` including the service name
4. **Never expose secrets** — all keys live in `process.env.*` server-side variables
5. **Always use the wrapper** — never call third-party SDKs directly in route handlers

```typescript
// ❌ WRONG — direct SDK usage in route handler
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ✅ CORRECT — use the wrapper
import { stripe } from '@/lib/stripe';
```
