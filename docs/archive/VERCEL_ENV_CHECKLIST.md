# Vercel Environment Variables Checklist

## Production Environment Variables Required

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

### Auth0 Configuration

```bash
AUTH0_ISSUER_BASE_URL=https://dev-7myakdl4itf644km.us.auth0.com
AUTH0_CLIENT_ID=CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL
AUTH0_CLIENT_SECRET=your-production-secret-here
```

### NextAuth Configuration

```bash
NEXTAUTH_URL=https://www.prepflow.org
NEXTAUTH_SECRET=your-production-secret-min-32-chars
NEXTAUTH_SESSION_MAX_AGE=14400
```

**⚠️ CRITICAL:** `NEXTAUTH_URL` must be `https://www.prepflow.org` (with www) to match your primary domain.

### Access Control

```bash
# Option 1: Email allowlist (production)
ALLOWED_EMAILS=email1@example.com,email2@example.com

# Option 2: Disable allowlist (testing/friend access)
DISABLE_ALLOWLIST=true
```

## Verification Steps

1. **Check Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Verify **Production** environment has all variables above
   - Check that `NEXTAUTH_URL=https://www.prepflow.org` (with www)

2. **Verify Domain Redirect:**
   - After deploying, test: `https://prepflow.org` → Should redirect to `https://www.prepflow.org`
   - This ensures consistent domain usage

3. **Test Sign-In:**
   - Go to: `https://www.prepflow.org`
   - Try signing in
   - Should work without `error=autho`

4. **Check Auth0 Dashboard:**
   - Verify callback URLs include both:
     - `https://prepflow.org/api/auth/callback/auth0`
     - `https://www.prepflow.org/api/auth/callback/auth0`

## Common Issues

### Issue: Still getting `error=autho` after fixing

**Causes:**

1. Vercel environment variables not set correctly
2. `NEXTAUTH_URL` doesn't match primary domain
3. Domain redirect not working
4. Browser cache/cookies

**Fix:**

1. Verify all environment variables in Vercel Dashboard
2. Redeploy after changing environment variables
3. Clear browser cookies for both domains
4. Test in incognito/private window

### Issue: Redirect not working

**Causes:**

1. DNS not configured correctly
2. Vercel domain settings not configured
3. Redirect config not deployed

**Fix:**

1. Check Vercel Dashboard → Project → Settings → Domains
2. Verify both `prepflow.org` and `www.prepflow.org` are configured
3. Redeploy after adding redirect
4. Wait 5-10 minutes for DNS propagation

## Quick Test

After setting up:

```bash
# Test redirect
curl -I https://prepflow.org
# Should return: Location: https://www.prepflow.org/...

# Test sign-in page
curl -I https://www.prepflow.org/api/auth/signin
# Should return: 200 OK
```

## Related Documentation

- `docs/AUTH0_PRODUCTION_SETUP.md` - Complete Auth0 setup
- `docs/AUTH0_PRODUCTION_ERROR_FIX.md` - Production error fixes
- `docs/AUTH0_FIX_ALL_ISSUES.md` - All Auth0 issues
