# Auth0 Custom Domain Setup Guide

**Purpose:** Configure Auth0 to use your custom domain (`auth.prepflow.org`) instead of the default Auth0 domain (`dev-7myakdl4itf644km.us.auth0.com`).

**Reference:** [Auth0 Custom Domains Documentation](https://auth0.com/docs/customize/custom-domains)

## Benefits of Custom Domain

✅ **Brand Continuity:** Users see `auth.prepflow.org` instead of `dev-7myakdl4itf644km.us.auth0.com`
✅ **Trust & Security:** Users feel confident they're logging into your brand, not a third-party
✅ **Anti-Phishing:** Harder for attackers to mimic your domain
✅ **Better UX:** Seamless branding experience throughout authentication flow
✅ **iFrame Support:** Some browsers work better with shared domains

## Current Configuration

- **Current Auth0 Domain:** `dev-7myakdl4itf644km.us.auth0.com`
- **Production Domain:** `www.prepflow.org`
- **Proposed Custom Domain:** `auth.prepflow.org` (or `login.prepflow.org` as alternative)

## Setup Steps

### Step 1: Configure Custom Domain in Auth0 Dashboard

1. **Go to Auth0 Dashboard:**
   - Navigate to: **Branding** → **Custom Domains**
   - Or: https://manage.auth0.com/dashboard/us/production/branding/custom-domains

2. **Add Custom Domain:**
   - Click **"Create Custom Domain"**
   - Enter your custom domain: `auth.prepflow.org`
   - Choose certificate type:
     - **Auth0-Managed Certificate** (Recommended - Free, auto-renewal)
     - **Self-Managed Certificate** (Enterprise only - requires reverse proxy)

3. **Choose Auth0-Managed Certificate:**
   - ✅ Free custom domain (requires credit card on file for verification, not charged)
   - ✅ Automatic SSL certificate renewal every 3 months
   - ✅ No reverse proxy needed
   - ✅ Simplest setup

### Step 2: Configure DNS CNAME Record

Auth0 will provide you with a CNAME record to add to your DNS. Example:

```
Type: CNAME
Name: auth (or @ if using root domain)
Value: cname.verification.auth0.com (or similar - Auth0 will provide exact value)
TTL: 3600 (or default)
```

**DNS Configuration Steps:**

1. **Go to your DNS provider** (wherever `prepflow.org` DNS is managed)
2. **Add CNAME record:**
   - **Name:** `auth` (creates `auth.prepflow.org`)
   - **Value:** (Auth0 will provide this - e.g., `cname.verification.auth0.com`)
   - **TTL:** 3600 (1 hour) or default

3. **Wait for DNS propagation:**
   - Usually takes 5-60 minutes
   - You can check with: `dig auth.prepflow.org` or `nslookup auth.prepflow.org`

### Step 3: Verify Domain in Auth0

1. **Return to Auth0 Dashboard:**
   - Go back to **Branding** → **Custom Domains**
   - Click **"Verify"** next to your custom domain

2. **Auth0 will verify:**
   - DNS CNAME record is correct
   - Domain ownership (via DNS verification)
   - SSL certificate generation (if Auth0-managed)

3. **Wait for verification:**
   - Usually takes 5-15 minutes
   - Status will change from "Pending" to "Ready"

### Step 4: Configure Auth0 Features to Use Custom Domain

After verification, you must configure Auth0 features to use the custom domain:

1. **Go to:** **Branding** → **Custom Domains** → **"Configure Features"**

2. **Enable for:**
   - ✅ **Universal Login** (Required for login pages)
   - ✅ **Emails** (Links in emails will use custom domain)
   - ✅ **MFA** (Multi-factor authentication)
   - ✅ **Passwordless** (Email links)

3. **Save configuration**

### Step 5: Update Environment Variables

Update your Vercel environment variables to use the custom domain:

**Current Production Configuration:**

```bash
AUTH0_ISSUER_BASE_URL=https://dev-7myakdl4itf644km.us.auth0.com
AUTH0_BASE_URL=https://www.prepflow.org
# AUTH0_DOMAIN is not currently set (extracted from ISSUER_BASE_URL)
```

**New Production Configuration (with Custom Domain):**

```bash
# Option 1: Set AUTH0_DOMAIN explicitly (Recommended - Auth0 SDK standard)
AUTH0_DOMAIN=auth.prepflow.org
AUTH0_ISSUER_BASE_URL=https://auth.prepflow.org
AUTH0_BASE_URL=https://www.prepflow.org  # Stays the same - this is for callback URLs

# Option 2: Only set ISSUER_BASE_URL (domain extracted automatically)
AUTH0_ISSUER_BASE_URL=https://auth.prepflow.org
AUTH0_BASE_URL=https://www.prepflow.org  # Stays the same
```

**Important Notes:**

- `AUTH0_BASE_URL` stays `https://www.prepflow.org` - this is your application URL for callback URLs, NOT the Auth0 domain
- `AUTH0_DOMAIN` or `AUTH0_ISSUER_BASE_URL` changes to use the custom domain `auth.prepflow.org`
- `AUTH0_DOMAIN` is preferred (Auth0 SDK standard) but optional if `AUTH0_ISSUER_BASE_URL` is set correctly

**Vercel Environment Variables Update:**

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Update **Production** environment:
   - `AUTH0_DOMAIN` = `auth.prepflow.org` (recommended)
   - `AUTH0_ISSUER_BASE_URL` = `https://auth.prepflow.org`
   - `AUTH0_BASE_URL` = `https://www.prepflow.org` (verify this is already set correctly)
3. **Redeploy** after updating environment variables

### Step 6: Update Callback URLs in Auth0

After switching to custom domain, update your callback URLs:

1. **Go to:** Auth0 Dashboard → **Applications** → **PrepFlow** → **Settings**

2. **Update Allowed Callback URLs:**

   ```
   https://www.prepflow.org/api/auth/callback
   https://prepflow.org/api/auth/callback
   http://localhost:3000/api/auth/callback
   ```

3. **Update Allowed Logout URLs:**

   ```
   https://www.prepflow.org
   https://www.prepflow.org/
   https://prepflow.org
   https://prepflow.org/
   http://localhost:3000
   http://localhost:3000/
   ```

4. **Update Allowed Web Origins:**
   ```
   https://www.prepflow.org
   https://prepflow.org
   http://localhost:3000
   ```

### Step 7: Update Code Configuration (if needed)

The code already supports custom domains via `AUTH0_DOMAIN` environment variable. No code changes needed!

**Current Implementation:**

- `lib/auth0.ts` already reads `AUTH0_DOMAIN` or extracts from `AUTH0_ISSUER_BASE_URL`
- Auth0 SDK automatically uses the custom domain for all authentication flows

### Step 8: Test Custom Domain

1. **Clear browser cookies** (important - old sessions won't work)
2. **Test login flow:**
   - Go to: `https://www.prepflow.org`
   - Click "Sign In"
   - Verify URL shows: `https://auth.prepflow.org/authorize?...` (instead of `dev-7myakdl4itf644km.us.auth0.com`)
3. **Test callback:**
   - Complete login
   - Verify redirect back to `https://www.prepflow.org/webapp`
4. **Test logout:**
   - Click logout
   - Verify redirect to Auth0 logout page (should use custom domain)

## Important Notes

### Backward Compatibility

✅ **Existing integrations continue to work:**

- Old domain (`dev-7myakdl4itf644km.us.auth0.com`) still works
- Both domains can coexist during migration
- Users must log in again (existing sessions invalidated)

### Token Issuer (`iss` claim)

⚠️ **Important:** Tokens issued with custom domain will have `iss` claim set to custom domain:

- **Before:** `iss: "https://dev-7myakdl4itf644km.us.auth0.com"`
- **After:** `iss: "https://auth.prepflow.org"`

**Impact:**

- Management API tokens must use custom domain if obtained via custom domain
- Token validation must account for custom domain issuer

### Development Environment

For local development, you can:

**Option 1: Keep using default domain**

```bash
# .env.local (development)
AUTH0_ISSUER_BASE_URL=https://dev-7myakdl4itf644km.us.auth0.com
# No AUTH0_DOMAIN set - uses default
```

**Option 2: Use custom domain in dev too**

```bash
# .env.local (development)
AUTH0_DOMAIN=auth.prepflow.org
AUTH0_ISSUER_BASE_URL=https://auth.prepflow.org
```

### Certificate Management

**Auth0-Managed (Recommended):**

- ✅ Free
- ✅ Automatic renewal every 3 months
- ✅ No maintenance required
- ✅ Requires credit card on file (for verification, not charged)

**Self-Managed (Enterprise Only):**

- Requires reverse proxy (Cloudflare, AWS CloudFront, Azure CDN, Google Cloud)
- You manage SSL certificates
- More complex setup
- Better for enterprise compliance requirements

## Troubleshooting

### Issue: DNS Verification Fails

**Symptoms:** Auth0 shows "Verification Failed" or "Pending"

**Solutions:**

1. Verify CNAME record is correct: `dig auth.prepflow.org`
2. Wait for DNS propagation (can take up to 24 hours)
3. Check TTL - lower TTL (300-600) speeds up propagation
4. Verify no conflicting records (A, AAAA, other CNAME)

### Issue: SSL Certificate Not Generated

**Symptoms:** Custom domain shows "Pending" or "Certificate Error"

**Solutions:**

1. Wait 5-15 minutes after DNS verification
2. Check DNS propagation is complete
3. Verify CNAME points to correct Auth0 verification endpoint
4. Contact Auth0 support if still pending after 1 hour

### Issue: Login Still Uses Old Domain

**Symptoms:** Login redirects to `dev-7myakdl4itf644km.us.auth0.com` instead of `auth.prepflow.org`

**Solutions:**

1. Verify `AUTH0_DOMAIN` environment variable is set correctly
2. Redeploy after updating environment variables
3. Clear browser cache and cookies
4. Check Auth0 Dashboard → Custom Domains → Features are enabled

### Issue: Callback URL Mismatch

**Symptoms:** `redirect_uri_mismatch` error after switching to custom domain

**Solutions:**

1. Update Allowed Callback URLs in Auth0 Dashboard
2. Ensure callback URLs use `https://` (not `http://`)
3. Verify no trailing slashes in callback URLs
4. Wait 1-2 minutes after updating callback URLs

## Migration Checklist

- [ ] Add custom domain in Auth0 Dashboard
- [ ] Configure DNS CNAME record
- [ ] Verify domain in Auth0 (wait for SSL certificate)
- [ ] Enable custom domain for Universal Login
- [ ] Update Vercel environment variables (`AUTH0_DOMAIN`, `AUTH0_ISSUER_BASE_URL`)
- [ ] Update Auth0 callback URLs (if needed)
- [ ] Redeploy application
- [ ] Test login flow (verify custom domain URL)
- [ ] Test logout flow
- [ ] Clear browser cookies and test fresh login
- [ ] Verify tokens use custom domain issuer (`iss` claim)

## Next Steps

After custom domain is configured:

1. **Update documentation** with new custom domain
2. **Test all authentication flows:**
   - Email/password login
   - Google OAuth
   - Apple OAuth
   - Microsoft OAuth
   - Logout
   - Password reset
   - Email verification
3. **Monitor for issues** in first 24-48 hours
4. **Update any hardcoded Auth0 URLs** in code/docs (if any)

## References

- [Auth0 Custom Domains Documentation](https://auth0.com/docs/customize/custom-domains)
- [Configure Custom Domains with Auth0-Managed Certificates](https://auth0.com/docs/customize/custom-domains/configure-custom-domains-with-auth0-managed-certificates)
- [Configure Features to Use Custom Domains](https://auth0.com/docs/customize/custom-domains/configure-features-to-use-custom-domains)

---

**Last Updated:** December 2024
**Status:** Ready for implementation
