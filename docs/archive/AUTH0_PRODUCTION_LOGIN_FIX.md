# Fix Production Auth0 Login Issue - Complete Guide

## Problem Summary

Production login fails with `error=auth0` while development works correctly. This is almost always caused by incorrect `NEXTAUTH_URL` environment variable in Vercel production.

## Root Cause Analysis

Based on browser testing and code review:

1. ✅ **Auth0 Dashboard Configuration:** All callback URLs, logout URLs, and web origins are correctly configured
2. ✅ **Code Configuration:** Callback URL is correctly forced to use `NEXTAUTH_URL`
3. ✅ **Middleware:** Non-www redirects to www before auth processing
4. ❌ **Most Likely Issue:** `NEXTAUTH_URL` is not set correctly in Vercel Production environment

## Diagnostic Steps

### Step 1: Check Production Environment Variables

**Go to Vercel Dashboard:**

1. Navigate to: https://vercel.com/dashboard
2. Select your project: **prepflow-web**
3. Go to: **Settings** → **Environment Variables**
4. **CRITICAL:** Select **Production** environment (not Preview or Development)

**Verify these variables are set:**

```bash
NEXTAUTH_URL=https://www.prepflow.org
AUTH0_ISSUER_BASE_URL=https://dev-7myakdl4itf644km.us.auth0.com
AUTH0_CLIENT_ID=CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL
AUTH0_CLIENT_SECRET=[your-production-secret]
NEXTAUTH_SECRET=[your-production-secret-min-32-chars]
```

**⚠️ CRITICAL CHECKLIST:**

- [ ] `NEXTAUTH_URL` is set to `https://www.prepflow.org` (with www, no trailing slash)
- [ ] `NEXTAUTH_URL` is set for **Production** environment (not just Preview)
- [ ] All Auth0 variables are set for **Production** environment
- [ ] No typos or extra spaces in variable values

### Step 2: Use Diagnostic Endpoint (After Deployment)

After deploying the fixes, you can check production configuration:

```bash
# Check production configuration (requires admin key or dev mode)
curl https://www.prepflow.org/api/debug/auth \
  -H "X-Admin-Key: $SEED_ADMIN_KEY"
```

This will show:

- What `NEXTAUTH_URL` is actually set to in production
- Expected callback URL
- Any configuration issues

### Step 3: Check Browser Console

1. Open production site: https://www.prepflow.org/webapp
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Try to sign in
5. Look for any errors mentioning:
   - Callback URL
   - `NEXTAUTH_URL`
   - Auth0 errors
   - CORS errors

### Step 4: Check Network Tab

1. Open browser DevTools → **Network** tab
2. Try to sign in
3. Look for the Auth0 authorization request
4. Check the `redirect_uri` parameter in the request
5. Verify it matches: `https://www.prepflow.org/api/auth/callback/auth0`

## Fix Steps

### Fix 1: Set NEXTAUTH_URL in Vercel (MOST COMMON FIX)

**If `NEXTAUTH_URL` is missing or incorrect:**

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Find `NEXTAUTH_URL` (or create it if missing)
3. **Set value to:** `https://www.prepflow.org` (exactly, with www, no trailing slash)
4. **Select environment:** Production (and optionally Preview/Development if same)
5. Click **Save**
6. **Redeploy:** Go to **Deployments** → Click **Redeploy** on latest deployment
7. Wait 2-3 minutes for deployment to complete
8. Test login again

### Fix 2: Verify All Auth0 Variables Are Set

**Check each variable is set for Production:**

- [ ] `AUTH0_ISSUER_BASE_URL` = `https://dev-7myakdl4itf644km.us.auth0.com`
- [ ] `AUTH0_CLIENT_ID` = `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL`
- [ ] `AUTH0_CLIENT_SECRET` = [your production secret]
- [ ] `NEXTAUTH_SECRET` = [32+ character secret]
- [ ] `NEXTAUTH_URL` = `https://www.prepflow.org`

### Fix 3: Use Vercel CLI Script (Alternative)

If you have Vercel CLI access:

```bash
# Set Vercel token
export VERCEL_TOKEN=your-vercel-token-here

# Run the script to set environment variables
node scripts/set-vercel-env.js
```

This will:

- Fetch current Vercel environment variables
- Compare with required variables
- Prompt for production values
- Set/update variables in Vercel Production environment

**Get Vercel Token:**

1. Go to: https://vercel.com/account/tokens
2. Click **Create Token**
3. Copy the token

### Fix 4: Clear Browser Data

After fixing environment variables:

1. **Clear cookies** for both `prepflow.org` and `www.prepflow.org`
2. **Clear cache** (hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`)
3. **Try incognito/private window**
4. Test login again

## Code Fixes Applied

### 1. Added `url` Option to NextAuth Configuration

**File:** `lib/auth-options.ts`

```typescript
export const authOptions: NextAuthOptions = {
  // Ensure NextAuth uses NEXTAUTH_URL for all URL construction
  url: process.env.NEXTAUTH_URL,
  // ... rest of config
};
```

This ensures NextAuth uses `NEXTAUTH_URL` for all URL construction, not just the provider callback URL.

### 2. Added Production Logging

**File:** `lib/auth-options.ts`

Added production-safe logging to track callback URL configuration:

- Logs callback URL being used (no secrets exposed)
- Logs if `NEXTAUTH_URL` is missing
- Helps diagnose configuration issues

### 3. Created Diagnostic Endpoint

**File:** `app/api/debug/auth/route.ts`

Diagnostic endpoint to check production configuration:

- Shows what `NEXTAUTH_URL` is set to
- Shows expected callback URL
- Identifies configuration issues
- Safe (no secrets exposed)

### 4. Updated Middleware

**File:** `proxy.ts`

Added `/api/debug` to allowed public APIs for diagnostic access.

## Testing After Fixes

### Test 1: Verify Environment Variables

```bash
# After redeploy, check diagnostic endpoint
curl https://www.prepflow.org/api/debug/auth \
  -H "X-Admin-Key: $SEED_ADMIN_KEY"
```

Should show:

- `nextAuthUrl: "https://www.prepflow.org"`
- `isCorrectProductionUrl: true`
- `issues: []`

### Test 2: Test Login Flow

1. **Clear browser data** (cookies, cache)
2. Navigate to: `https://www.prepflow.org/webapp`
3. Should redirect to Auth0 sign-in
4. Complete Google OAuth
5. Should redirect back to `/webapp` successfully
6. Should be logged in

### Test 3: Test Both Domains

1. **Non-www:** `https://prepflow.org/webapp`
   - Should redirect to `https://www.prepflow.org/webapp`
   - Login should work

2. **WWW:** `https://www.prepflow.org/webapp`
   - Should work directly
   - Login should work

### Test 4: Test Account Creation

1. Navigate to sign-in page
2. Click "Create one now"
3. Complete account creation flow
4. Should redirect to `/webapp` successfully

## Common Issues & Solutions

### Issue: Still getting `error=auth0` after setting `NEXTAUTH_URL`

**Possible Causes:**

1. Environment variable not set for Production environment
2. Application not redeployed after setting variable
3. Browser cache/cookies still holding old values

**Solution:**

1. Verify variable is set for **Production** (not Preview)
2. Redeploy application
3. Clear browser data completely
4. Test in incognito window

### Issue: `NEXTAUTH_URL` has trailing slash

**Problem:** `NEXTAUTH_URL=https://www.prepflow.org/` (with trailing slash)

**Solution:** Remove trailing slash: `https://www.prepflow.org`

### Issue: `NEXTAUTH_URL` is `http://` instead of `https://`

**Problem:** `NEXTAUTH_URL=http://www.prepflow.org`

**Solution:** Use HTTPS: `https://www.prepflow.org`

### Issue: `NEXTAUTH_URL` is `prepflow.org` instead of `www.prepflow.org`

**Problem:** `NEXTAUTH_URL=https://prepflow.org` (without www)

**Solution:** Use www: `https://www.prepflow.org`

## Verification Checklist

After applying fixes, verify:

- [ ] `NEXTAUTH_URL=https://www.prepflow.org` in Vercel Production environment
- [ ] Application redeployed after setting variables
- [ ] Browser cookies cleared for both domains
- [ ] Login works on `https://www.prepflow.org`
- [ ] Login works after redirect from `https://prepflow.org`
- [ ] No `error=auth0` in URL after login attempt
- [ ] Session persists after login
- [ ] Logout works correctly

## Next Steps

1. **Set `NEXTAUTH_URL` in Vercel:** `https://www.prepflow.org`
2. **Redeploy application**
3. **Clear browser data**
4. **Test login flow**
5. **Check diagnostic endpoint** if issues persist

## Support

If issues persist after following this guide:

1. Check Vercel deployment logs for errors
2. Check browser console for errors
3. Check network tab for failed requests
4. Verify Auth0 dashboard configuration hasn't changed
5. Use diagnostic endpoint to verify configuration

## Related Documentation

- `docs/AUTH0_PRODUCTION_SETUP.md` - Complete production setup guide
- `docs/VERCEL_ENV_CHECKLIST.md` - Vercel environment variables checklist
- `docs/AUTH0_TROUBLESHOOTING.md` - General Auth0 troubleshooting
