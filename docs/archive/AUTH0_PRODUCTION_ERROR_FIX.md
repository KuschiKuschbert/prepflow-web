# Fix Production Auth0 Error (`error=autho`)

## Problem

Production sign-in is failing with `error=autho` even though Auth0 dashboard configuration is correct.

**Error URL:** `prepflow.org/api/auth/signin?callbackUrl=https%3A%2F%2Fwww.prepflow.org%2Fwebapp&error=autho`

## Root Cause

The issue is likely a **domain mismatch** between:

- The domain you're accessing: `prepflow.org` (non-www)
- The callback URL domain: `www.prepflow.org` (www)
- The `NEXTAUTH_URL` environment variable in Vercel

## Solution

### Step 1: Check Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Verify these are set correctly:**

```bash
NEXTAUTH_URL=https://www.prepflow.org
AUTH0_ISSUER_BASE_URL=https://dev-7myakdl4itf644km.us.auth0.com
AUTH0_CLIENT_ID=CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL
AUTH0_CLIENT_SECRET=your-production-secret
NEXTAUTH_SECRET=your-production-secret-min-32-chars
```

**⚠️ CRITICAL:** `NEXTAUTH_URL` must be `https://www.prepflow.org` (with www) to match your primary domain.

### Step 2: Verify Auth0 Callback URLs

Even though we verified they're configured, double-check:

1. Go to: https://manage.auth0.com → Applications → Prepflow → Settings
2. **Allowed Callback URLs** should include:
   ```
   https://prepflow.org/api/auth/callback/auth0
   https://www.prepflow.org/api/auth/callback/auth0
   ```
3. **Allowed Web Origins** should include:
   ```
   https://prepflow.org
   https://www.prepflow.org
   ```

### Step 3: Handle Domain Redirects

The issue is that users can access your site via both:

- `prepflow.org` (non-www)
- `www.prepflow.org` (www)

But NextAuth constructs callback URLs based on `NEXTAUTH_URL`, which should be your primary domain.

**Option A: Redirect non-www to www (Recommended)**

Add this to your `next.config.ts`:

```typescript
async redirects() {
  return [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'prepflow.org',
        },
      ],
      destination: 'https://www.prepflow.org/:path*',
      permanent: true,
    },
  ];
}
```

This ensures all traffic goes to `www.prepflow.org`, matching your `NEXTAUTH_URL`.

**Option B: Set NEXTAUTH_URL to non-www**

If you prefer non-www as primary:

1. Set `NEXTAUTH_URL=https://prepflow.org` in Vercel
2. Ensure both callback URLs are in Auth0
3. Update all references to use non-www

### Step 4: Clear Browser Cache and Cookies

After fixing:

1. Clear browser cookies for `prepflow.org` and `www.prepflow.org`
2. Try signing in again
3. Use incognito/private window for testing

### Step 5: Verify Production Environment

**Check what's actually deployed:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify **Production** environment has all variables set
3. Check that `NEXTAUTH_URL` matches your primary domain
4. Redeploy if you changed any variables

## Quick Diagnostic

Run this to check what NextAuth is using:

```bash
# In production, check the actual callback URL being constructed
# The callback URL should be: ${NEXTAUTH_URL}/api/auth/callback/auth0
```

If `NEXTAUTH_URL=https://www.prepflow.org`, then callback is:

- `https://www.prepflow.org/api/auth/callback/auth0` ✅

If user accesses `prepflow.org`, but callback is `www.prepflow.org`, Auth0 might reject it if:

- The origin (`prepflow.org`) doesn't match the callback domain (`www.prepflow.org`)
- CORS policy blocks the redirect

## Most Likely Fix

**Set up domain redirects** so all traffic goes to `www.prepflow.org`:

1. Add redirect in `next.config.ts` (see Step 3, Option A)
2. Verify `NEXTAUTH_URL=https://www.prepflow.org` in Vercel
3. Redeploy
4. Test sign-in

This ensures consistent domain usage and prevents callback URL mismatches.

## Testing

After fixing:

1. **Test www domain:** https://www.prepflow.org → Sign in → Should work
2. **Test non-www domain:** https://prepflow.org → Should redirect to www → Sign in → Should work
3. **Check callback:** After Auth0 login, should redirect back to `www.prepflow.org/webapp`

## Still Not Working?

If still failing:

1. **Check Vercel logs** for actual callback URL being used
2. **Check Auth0 logs** (Dashboard → Monitoring → Logs) for rejected callback attempts
3. **Verify DNS** - both domains should point to Vercel
4. **Check Vercel domain settings** - both domains should be configured

## Related Documentation

- `docs/AUTH0_PRODUCTION_SETUP.md` - Complete production setup
- `docs/AUTH0_FIX_ALL_ISSUES.md` - All Auth0 issues and fixes
- `docs/AUTH0_TROUBLESHOOTING.md` - Troubleshooting guide
