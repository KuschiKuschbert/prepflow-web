# Production Login Fix Guide

**Date:** December 12, 2025
**Status:** Action Required - Manual Configuration Needed

## Quick Summary

Production login is failing with `error=auth0` due to NextAuth callback URL validation. Two issues identified:

1. **CRITICAL:** Logout URLs not configured in Auth0 dashboard (can be fixed immediately)
2. **CRITICAL:** NextAuth callback URL validation issue (requires investigation)

## Issue 1: Missing Logout URLs (FIX THIS FIRST)

### Problem

Auth0 dashboard shows logout URLs array is empty, which will cause logout to fail.

### Fix Steps

1. **Go to Auth0 Dashboard:**
   - Navigate to: https://manage.auth0.com
   - **Applications** → **Prepflow** → **Settings**

2. **Add Logout URLs:**
   Find **"Allowed Logout URLs"** and add (one per line):

   ```
   https://www.prepflow.org
   https://www.prepflow.org/
   https://prepflow.org
   https://prepflow.org/
   ```

3. **Save Changes**

4. **Verify:**
   ```bash
   curl https://www.prepflow.org/api/test/auth0-comprehensive | jq '.tests[] | select(.name | contains("Logout"))'
   ```
   Should show `status: "pass"` after adding URLs.

**Time Required:** 2 minutes
**Impact:** Prevents logout failures

## Issue 2: NextAuth Callback URL Validation

### Problem

NextAuth v4 validates callback URLs against the request origin BEFORE redirecting to Auth0, even though we're forcing the callback URL in provider configuration. This causes `error=auth0` immediately.

### Current Status

- ✅ Callback URLs ARE configured in Auth0 dashboard
- ✅ NEXTAUTH_URL is set correctly (`https://www.prepflow.org`)
- ✅ Provider config forces callback URL
- ❌ NextAuth still validates against request origin first

### Potential Solutions

#### Solution A: Verify NEXTAUTH_URL in Vercel (Try This First)

1. **Check Vercel Environment Variables:**
   - Go to: Vercel Dashboard → Project → Settings → Environment Variables
   - Verify `NEXTAUTH_URL` is set to: `https://www.prepflow.org` (exactly, no trailing slash)
   - **CRITICAL:** Ensure it's set for **Production** environment (not just Preview/Development)

2. **Redeploy:**
   - After verifying, trigger a new deployment
   - Or push a commit to trigger automatic deployment

3. **Test:**
   ```bash
   curl -s "https://www.prepflow.org/api/test/auth0-flow?callbackUrl=/webapp" | jq '.success'
   ```
   Should return `true` if fixed.

#### Solution B: Check Vercel Deployment Logs

1. **Go to Vercel Dashboard:**
   - Deployments → Latest → Logs

2. **Look for:**
   - `[Auth0 Config]` entries
   - Any errors related to callback URL construction
   - NextAuth validation errors

3. **Check if:**
   - NEXTAUTH_URL is being read correctly at runtime
   - Callback URL is being forced correctly
   - Any validation errors are occurring

#### Solution C: Test with Different Request Origins

The issue might be that NextAuth is seeing a different origin than expected:

1. **Test direct access:**

   ```bash
   curl -I "https://www.prepflow.org/api/auth/signin/auth0?callbackUrl=/webapp"
   ```

2. **Check redirect chain:**
   - Should redirect to Auth0
   - Should NOT contain `error=auth0`

3. **If still failing:**
   - Check if middleware redirect is working correctly
   - Verify request origin matches NEXTAUTH_URL after redirect

## Testing After Fixes

### Step 1: Run Verification Script

```bash
node scripts/verify-production-auth0-env.js
```

**Expected:** All checks should pass

### Step 2: Test Authorization Flow

```bash
curl -s "https://www.prepflow.org/api/test/auth0-flow?callbackUrl=/webapp" | jq '.success'
```

**Expected:** Should return `true`

### Step 3: Test in Browser

1. **Clear browser data:**
   - Clear cookies for `prepflow.org` and `www.prepflow.org`
   - Clear cache (hard refresh: Cmd+Shift+R)

2. **Navigate to:**

   ```
   https://www.prepflow.org/webapp
   ```

3. **Expected flow:**
   - Should redirect to `/api/auth/signin`
   - Click "Sign in with Auth0"
   - Should redirect to Auth0 login page
   - After login, should redirect back to `/webapp`
   - Should NOT have `error=auth0` in URL

## If Issues Persist

### Additional Debugging

1. **Check Auth0 Dashboard Logs:**
   - Go to: Auth0 Dashboard → Monitoring → Logs
   - Filter for your application
   - Look for failed login attempts
   - Check for callback URL mismatches

2. **Check Browser Network Tab:**
   - Open DevTools → Network
   - Try to login
   - Check all requests:
     - `/api/auth/signin` - Should redirect to Auth0
     - `/api/auth/callback/auth0` - Should return 200, not error
     - Look for failed requests or unexpected redirects

3. **Test with Different Browsers:**
   - Try Chrome, Firefox, Safari
   - Try incognito/private mode
   - Clear all cookies and cache

4. **Verify Environment Variables:**
   - Ensure all required variables are set:
     - `NEXTAUTH_URL` (must be `https://www.prepflow.org`)
     - `NEXTAUTH_SECRET` (32+ characters)
     - `AUTH0_ISSUER_BASE_URL`
     - `AUTH0_CLIENT_ID`
     - `AUTH0_CLIENT_SECRET`
   - Ensure they're set for **Production** environment

## Related Files

- `docs/PRODUCTION_LOGIN_DIAGNOSTIC_RESULTS.md` - Complete diagnostic results
- `scripts/verify-production-auth0-env.js` - Verification script
- `app/api/test/auth0-comprehensive/route.ts` - Comprehensive test endpoint
- `app/api/debug/auth/route.ts` - Basic diagnostic endpoint
- `lib/auth-options.ts` - NextAuth configuration

## Next Steps

1. **Immediate:** Add logout URLs to Auth0 dashboard (Issue 1)
2. **Short-term:** Verify NEXTAUTH_URL in Vercel and redeploy (Solution A)
3. **If still failing:** Check Vercel logs and investigate further (Solutions B & C)
