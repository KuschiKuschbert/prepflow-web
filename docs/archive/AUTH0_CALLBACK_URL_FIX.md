# Fix Auth0 Callback URL Issue (`error=auth0`)

## Problem

Even though `NEXTAUTH_URL` is set correctly in Vercel (`https://www.prepflow.org`), login still fails with `error=auth0`.

## Root Cause

NextAuth's Auth0 provider may construct the authorization URL using the **request origin** instead of `NEXTAUTH_URL`, even when we force the callback URL. This causes a mismatch between:

- The callback URL we're forcing: `https://www.prepflow.org/api/auth/callback/auth0`
- The callback URL Auth0 receives: Might be constructed from request origin

## Solution

### Step 1: Verify NEXTAUTH_URL in Vercel

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. **Verify `NEXTAUTH_URL` is set to:** `https://www.prepflow.org` (exactly, no trailing slash)
3. **Verify it's set for Production environment** (not just Preview/Development)
4. **Redeploy** after verifying

### Step 2: Check Diagnostic Endpoint

Visit: `https://www.prepflow.org/api/debug/auth`

This will show:

- Current `NEXTAUTH_URL` value
- Expected callback URL
- Actual redirect_uri being used by the provider
- Any configuration issues

### Step 3: Verify Auth0 Callback URLs

Even though they're configured, double-check:

1. Go to: https://manage.auth0.com → Applications → Prepflow → Settings
2. **Allowed Callback URLs** must include:
   ```
   https://www.prepflow.org/api/auth/callback/auth0
   https://prepflow.org/api/auth/callback/auth0
   ```
3. **Allowed Logout URLs** must include:
   ```
   https://www.prepflow.org
   https://www.prepflow.org/
   https://prepflow.org
   https://prepflow.org/
   ```
4. **Allowed Web Origins** must include:
   ```
   https://www.prepflow.org
   https://prepflow.org
   ```

### Step 4: Clear Browser Data

1. **Clear cookies** for both `prepflow.org` and `www.prepflow.org`
2. **Clear cache** (hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`)
3. **Try incognito/private window**

### Step 5: Test Login Flow

1. **Always access via www:** `https://www.prepflow.org/api/auth/signin`
2. Click "Sign in with Auth0"
3. Complete Auth0 login
4. Should redirect back to `/webapp` without `error=auth0`

## Code Changes Applied

### Enhanced Callback URL Forcing

Updated `lib/auth-options.ts` to more explicitly force the callback URL:

```typescript
// Force callback URL in both places to ensure NextAuth uses it
if (callbackUrl) {
  // Set redirect_uri in authorization params (what Auth0 sees)
  providerConfig.authorization.params.redirect_uri = callbackUrl;
  // Set callbackURL at provider level (what NextAuth uses internally)
  providerConfig.callbackURL = callbackUrl;
}
```

### Enhanced Diagnostic Endpoint

Updated `app/api/debug/auth/route.ts` to show:

- Actual `redirect_uri` being used by the provider
- Provider `callbackURL` value
- Any provider configuration errors

## Why This Happens

1. **NextAuth URL Construction:** NextAuth may construct URLs from request origin instead of `NEXTAUTH_URL`
2. **Domain Mismatch:** If user accesses `prepflow.org`, NextAuth might use that domain for URL construction
3. **Auth0 Validation:** Auth0 validates callback URL against allowed list - mismatch causes `error=auth0`

## Testing

After applying fixes:

1. ✅ Visit `https://www.prepflow.org/api/debug/auth` - Should show correct `NEXTAUTH_URL`
2. ✅ Visit `https://www.prepflow.org/api/auth/signin` - Should redirect to Auth0
3. ✅ Complete login - Should redirect back without `error=auth0`
4. ✅ Check Vercel logs - Should see `[Auth0 Config] Forcing callback URL` log

## If Still Failing

If login still fails after these steps:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for `[Auth0 Config]` log entries
   - Check for any error messages

2. **Check Browser Network Tab:**
   - Open DevTools → Network
   - Try login
   - Check the authorization request URL
   - Verify `redirect_uri` parameter matches `https://www.prepflow.org/api/auth/callback/auth0`

3. **Verify Middleware Redirect:**
   - Visit `https://prepflow.org` (non-www)
   - Should redirect to `https://www.prepflow.org` BEFORE NextAuth processes request
   - If redirect doesn't work, middleware isn't deployed correctly

## Related Documentation

- `docs/AUTH0_PRODUCTION_LOGIN_FIX.md` - Complete production login fix guide
- `docs/AUTH0_PRODUCTION_SETUP.md` - Complete Auth0 production setup
- `docs/AUTH0_DOMAIN_MISMATCH_FIX.md` - Domain mismatch fixes
