# Fix Auth0 Domain Mismatch (`error=auth0`)

## Problem

Even after deploying middleware redirects and configuring Auth0, sign-in still fails with `error=auth0`.

**Error URL:** `prepflow.org/api/auth/signin?callbackUrl=https%3A%2F%2Fwww.prepflow.org%2Fwebapp&error=auth0`

## Root Cause

NextAuth constructs callback URLs based on the **request origin**, not `NEXTAUTH_URL`. When a user accesses `prepflow.org`, NextAuth might construct the callback URL using `prepflow.org` even though `NEXTAUTH_URL` is set to `www.prepflow.org`.

## Solution: Verify Vercel Environment Variables

**CRITICAL:** The most common cause is that `NEXTAUTH_URL` is not set correctly in Vercel production environment.

### Step 1: Check Vercel Environment Variables

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. **Verify Production environment** has:
   ```bash
   NEXTAUTH_URL=https://www.prepflow.org
   ```
3. **Check that it's set for Production** (not just Preview/Development)
4. **Redeploy** after changing environment variables

### Step 2: Clear Browser Data

1. **Clear cookies** for both `prepflow.org` and `www.prepflow.org`
2. **Clear cache** (hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`)
3. **Try incognito/private window**

### Step 3: Test Direct Access

**Always access via www:**

- ✅ **Correct:** `https://www.prepflow.org/api/auth/signin`
- ❌ **Wrong:** `https://prepflow.org/api/auth/signin` (will redirect, but might cause issues)

### Step 4: Verify Middleware Redirect

The middleware should redirect `prepflow.org` → `www.prepflow.org` **before** NextAuth processes the request.

**Test:**

1. Go to: `https://prepflow.org`
2. Should automatically redirect to: `https://www.prepflow.org`
3. If redirect doesn't work, middleware isn't deployed correctly

## Why This Happens

1. **NextAuth callback construction:** NextAuth constructs callback URLs based on request origin
2. **Domain mismatch:** If user accesses `prepflow.org`, callback might be `prepflow.org/api/auth/callback/auth0`
3. **Auth0 validation:** Auth0 validates callback URL against allowed list
4. **Rejection:** If callback doesn't match exactly, Auth0 rejects with `error=auth0`

## Current Fixes Applied

✅ **Middleware redirect:** Redirects `prepflow.org` → `www.prepflow.org` before Auth0
✅ **Auth0 provider config:** Added `redirect_uri` and `callbackURL` to force `NEXTAUTH_URL`
✅ **Error messages:** Updated to guide users to `www.prepflow.org`

## Still Not Working?

If sign-in still fails after verifying Vercel environment variables:

1. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Deployments → Latest → Functions
   - Look for errors in `/api/auth/[...nextauth]` function

2. **Check Auth0 logs:**
   - Go to Auth0 Dashboard → Monitoring → Logs
   - Look for failed authentication attempts
   - Check the exact callback URL being used

3. **Verify callback URL construction:**
   - The callback URL should be: `${NEXTAUTH_URL}/api/auth/callback/auth0`
   - If `NEXTAUTH_URL=https://www.prepflow.org`, callback should be: `https://www.prepflow.org/api/auth/callback/auth0`

4. **Test with curl:**
   ```bash
   curl -I https://www.prepflow.org/api/auth/signin
   ```
   Should redirect to Auth0 login page

## Prevention

**Always access via www:**

- Bookmark: `https://www.prepflow.org`
- Update all links to use `www.prepflow.org`
- Set up DNS redirect at domain level (if possible)

**Verify environment variables:**

- Always check Vercel environment variables after deployment
- Ensure `NEXTAUTH_URL` matches your primary domain
- Redeploy after changing environment variables
