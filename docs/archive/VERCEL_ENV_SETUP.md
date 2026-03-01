# Vercel Environment Variables Setup Guide

**Purpose:** Complete guide for setting up all required environment variables in Vercel production.

## Quick Check

Run this command to see what needs to be set:

```bash
npm run vercel:check-env
```

This will show:

- ✅ Which variables are set locally (for reference)
- ❌ Which variables need to be set in Vercel
- 📋 Copy-paste ready values (where safe)

## Critical Variables (MUST be set in Production)

### 1. Auth0 Configuration

```bash
AUTH0_ISSUER_BASE_URL=https://dev-7myakdl4itf644km.us.auth0.com
AUTH0_CLIENT_ID=CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL
AUTH0_CLIENT_SECRET=your-production-secret-here
```

**⚠️ CRITICAL:** Use your **production** Auth0 Client Secret (not the development one).

### 2. NextAuth Configuration

```bash
NEXTAUTH_URL=https://www.prepflow.org
NEXTAUTH_SECRET=your-production-secret-min-32-chars
NEXTAUTH_SESSION_MAX_AGE=14400
```

**⚠️ CRITICAL:**

- `NEXTAUTH_URL` **MUST** be `https://www.prepflow.org` (with www) in production
- `NEXTAUTH_SECRET` should be different from development (generate new one: `openssl rand -base64 32`)
- `NEXTAUTH_SESSION_MAX_AGE` is optional (defaults to 14400 = 4 hours)

### 3. Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dulkrqgjfohsuxhsmofo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**⚠️ CRITICAL:** Use your **production** Supabase keys (same as development is OK, but verify).

## Optional Variables (Set if needed)

### Stripe Configuration (if using billing)

```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_WEBHOOK_SECRET_PROD=whsec_your_prod_webhook_secret
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_BUSINESS_MONTHLY=price_...
```

### Access Control

```bash
# Option 1: Email allowlist (production)
ALLOWED_EMAILS=email1@example.com,email2@example.com

# Option 2: Disable allowlist (testing/friend access)
DISABLE_ALLOWLIST=true
```

### Email Configuration (Resend)

```bash
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=hello@prepflow.org
FROM_NAME=PrepFlow Team
```

### Node Environment

```bash
NODE_ENV=production
```

**Note:** Vercel automatically sets this, but you can override if needed.

## Step-by-Step Setup in Vercel Dashboard

### Step 1: Navigate to Environment Variables

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. You'll see three environment options: **Production**, **Preview**, **Development**

### Step 2: Set Critical Variables (Production)

For each critical variable above:

1. Click **"Add New"** button
2. **Key:** Enter the variable name (e.g., `NEXTAUTH_URL`)
3. **Value:** Enter the production value (e.g., `https://www.prepflow.org`)
4. **Environment:** Select **Production** (or all environments if same value)
5. Click **"Save"**

**⚠️ IMPORTANT:**

- Always select **Production** environment for production variables
- Use **production secrets**, not development values
- `NEXTAUTH_URL` must be `https://www.prepflow.org` (with www)

### Step 3: Verify All Variables Are Set

Run the verification script:

```bash
npm run vercel:check-env
```

This will show which variables are set locally (for reference). Compare with what you've set in Vercel.

### Step 4: Redeploy Application

After setting environment variables:

1. Go to: **Vercel Dashboard** → **Your Project** → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger automatic deployment

**⚠️ IMPORTANT:** Environment variable changes require a redeploy to take effect.

### Step 5: Verify Deployment

1. Wait 1-2 minutes for deployment to complete
2. Check deployment logs for any errors
3. Test sign-in: https://www.prepflow.org
4. Should work without `error=auth0`

## Common Issues

### Issue: Still getting `error=auth0` after setting variables

**Causes:**

1. `NEXTAUTH_URL` not set to `https://www.prepflow.org` (with www)
2. Environment variables not set for Production environment
3. Application not redeployed after setting variables
4. Browser cache/cookies

**Fix:**

1. Verify `NEXTAUTH_URL=https://www.prepflow.org` in Vercel Production environment
2. Redeploy application
3. Clear browser cookies for both domains
4. Test in incognito/private window

### Issue: Environment variables not loading

**Causes:**

1. Variables set for wrong environment (Preview instead of Production)
2. Application not redeployed after setting variables
3. Typo in variable name

**Fix:**

1. Verify variables are set for **Production** environment
2. Check variable names match exactly (case-sensitive)
3. Redeploy application
4. Check deployment logs for errors

### Issue: Secrets are different between environments

**This is correct!** You should use:

- **Development:** Local `.env.local` with development secrets
- **Production:** Vercel Production environment with production secrets

**Best Practice:**

- Generate new secrets for production: `openssl rand -base64 32`
- Never use development secrets in production
- Rotate secrets every 90 days

## Verification Checklist

After setting up, verify:

- [ ] All critical variables set in Vercel Production environment
- [ ] `NEXTAUTH_URL=https://www.prepflow.org` (with www)
- [ ] All secrets are production secrets (not development)
- [ ] Application redeployed after setting variables
- [ ] Sign-in works: https://www.prepflow.org
- [ ] No `error=auth0` errors
- [ ] Auth0 configuration verified: `npm run auth0:check-config`

## Quick Reference

### Generate New Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate AUTH0_SECRET (if needed)
openssl rand -hex 32
```

### Check Current Configuration

```bash
# Check Vercel environment variables checklist
npm run vercel:check-env

# Validate Auth0 environment variables
npm run auth0:validate-env

# Check Auth0 dashboard configuration
npm run auth0:check-config

# Run all Auth0 validations
npm run auth0:validate
```

## Related Documentation

- **Auth0 Setup:** `docs/AUTH0_PRODUCTION_SETUP.md`
- **Auth0 CLI:** `docs/AUTH0_CLI_SETUP.md`
- **Vercel Checklist:** `docs/VERCEL_ENV_CHECKLIST.md`
- **Troubleshooting:** `docs/AUTH0_TROUBLESHOOTING.md`
