# Auth0 `error=auth0` Diagnosis & Test Results

## Test Results (After Latest Deployment)

### Diagnostic Endpoint (`/api/debug/auth`)

```json
{
  "environment": "production",
  "nextAuthUrl": "https://www.prepflow.org",
  "expectedCallbackUrl": "https://www.prepflow.org/api/auth/callback/auth0",
  "requestOrigin": "https://www.prepflow.org",
  "isCorrectProductionUrl": true,
  "auth0Configured": true,
  "nextAuthSecretSet": true,
  "issues": [],
  "actualRedirectUri": "NOT SET IN PROVIDER",
  "providerCallbackURL": "NOT SET IN PROVIDER"
}
```

**Status:** ✅ Configuration appears correct

- `NEXTAUTH_URL` is set correctly
- No configuration issues detected
- Diagnostic endpoint can't read provider config at runtime (expected limitation)

### Sign-In Endpoint Test

```bash
curl "https://www.prepflow.org/api/auth/signin/auth0?callbackUrl=https%3A%2F%2Fwww.prepflow.org%2Fwebapp"
```

**Result:**

- HTTP 302 redirect
- Redirects to: `https://www.prepflow.org/api/auth/signin?callbackUrl=...&error=auth0`
- **NextAuth returns `error=auth0` IMMEDIATELY** before redirecting to Auth0

### Middleware Redirect Test

```bash
curl "https://prepflow.org" -I
```

**Result:**

- HTTP 307 redirect
- ✅ Middleware redirects non-www to www correctly

## Root Cause Analysis

**The Problem:**
NextAuth v4 validates callback URLs against the **request origin** BEFORE redirecting to Auth0. Even though we're forcing the callback URL in the provider configuration, NextAuth performs validation before using our forced value.

**Why This Happens:**

1. NextAuth v4 constructs callback URLs from request origin by default
2. NextAuth validates the callback URL before redirecting to Auth0
3. If the callback URL doesn't match what NextAuth expects (based on request origin), it returns `error=auth0` immediately
4. Our forced `redirect_uri` in provider config is set, but NextAuth validates BEFORE using it

## Current Code Configuration

**Callback URL Forcing (lib/auth-options.ts):**

```typescript
// Force callback URL in both places
providerConfig.authorization.params.redirect_uri = callbackUrl; // What Auth0 sees
providerConfig.callbackURL = callbackUrl; // What NextAuth uses internally
```

**Status:** ✅ Code is correctly forcing the callback URL

## Next Steps to Fix

### Option 1: Check Vercel Function Logs (CRITICAL)

**Action Required:**

1. Go to **Vercel Dashboard** → **Your Project** → **Functions**
2. Look for recent function invocations for `/api/auth/signin/auth0`
3. Check logs for:
   - `[Auth0 Config] Forcing callback URL` - Should appear if callback URL is being forced
   - Any error messages about callback URL validation
   - What callback URL NextAuth is actually using

**Why:** The logs will show what NextAuth is actually doing at runtime, which the diagnostic endpoint can't capture.

### Option 2: Verify Auth0 Dashboard Configuration

**Double-check these URLs are EXACTLY correct:**

1. Go to: https://manage.auth0.com → Applications → Prepflow → Settings
2. **Allowed Callback URLs** - Must include EXACTLY:
   ```
   https://www.prepflow.org/api/auth/callback/auth0
   https://prepflow.org/api/auth/callback/auth0
   ```
3. **No trailing slashes, no extra spaces, exact match required**

### Option 3: Test with Browser Network Tab

**Action Required:**

1. Open browser DevTools → Network tab
2. Navigate to: `https://www.prepflow.org/api/auth/signin`
3. Click "Sign in with Auth0"
4. **Before the redirect happens**, check the Network tab for the request to `/api/auth/signin/auth0`
5. Look at:
   - Request URL
   - Response headers (especially `Location` header)
   - Response body (if any)

**Why:** This will show the actual authorization URL NextAuth is trying to construct and what callback URL it's using.

### Option 4: Check if NextAuth is Using NEXTAUTH_URL

**The Issue:** NextAuth v4 might not be using `NEXTAUTH_URL` for URL construction even when it's set.

**Possible Solutions:**

1. Ensure `NEXTAUTH_URL` has no trailing slash
2. Ensure `NEXTAUTH_URL` matches the exact domain (www.prepflow.org)
3. Check if there are any other environment variables interfering

## Recommended Next Steps

1. **Check Vercel Function Logs** - This is the most important step to see what's actually happening
2. **Verify Auth0 Callback URLs** - Ensure they match EXACTLY (no typos, no extra spaces)
3. **Test with Browser Network Tab** - See the actual authorization URL being generated
4. **Check if middleware redirect is working** - Ensure non-www requests are redirected BEFORE NextAuth processes them

## Code Changes Made

1. ✅ Enhanced callback URL forcing in `lib/auth-options.ts`
2. ✅ Created diagnostic endpoint `/api/debug/auth`
3. ✅ Added production logging for callback URL configuration
4. ✅ Middleware redirects non-www to www before auth processing

## Expected Behavior

When working correctly:

1. User accesses `https://www.prepflow.org/api/auth/signin`
2. Clicks "Sign in with Auth0"
3. NextAuth constructs authorization URL with `redirect_uri=https://www.prepflow.org/api/auth/callback/auth0`
4. Redirects to Auth0 login page
5. After login, Auth0 redirects back to callback URL
6. NextAuth processes callback and creates session
7. User is redirected to `/webapp`

## Current Behavior

1. User accesses `https://www.prepflow.org/api/auth/signin`
2. Clicks "Sign in with Auth0"
3. NextAuth validates callback URL
4. **NextAuth returns `error=auth0` IMMEDIATELY** (before redirecting to Auth0)
5. User sees error page

## Conclusion

The configuration appears correct, but NextAuth is still returning `error=auth0` immediately. This suggests NextAuth is validating the callback URL against the request origin before using our forced value.

**Next Step:** Check Vercel Function Logs to see what NextAuth is actually doing at runtime.
