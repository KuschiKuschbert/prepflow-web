# Auth0 Deployment Fix

## Issue Found

The `url` property was added to `authOptions`, but **NextAuth v4 does NOT support this property**. This was causing deployment issues.

## Fix Applied

**Removed:** The unsupported `url` property from `authOptions`

**File:** `lib/auth-options.ts`

```typescript
// BEFORE (INCORRECT - causes deployment errors):
export const authOptions: NextAuthOptions = {
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }), // ❌ Not supported in v4
  // ...
};

// AFTER (CORRECT):
export const authOptions: NextAuthOptions = {
  // NextAuth v4 uses NEXTAUTH_URL environment variable automatically
  // No url property needed
  // ...
};
```

## Current Solution

NextAuth v4 automatically uses `NEXTAUTH_URL` environment variable for URL construction. The key is ensuring:

1. **NEXTAUTH_URL is set correctly** in Vercel: `https://www.prepflow.org`
2. **Middleware redirects non-www to www** BEFORE NextAuth processes requests
3. **Callback URL is forced in provider config** (already implemented)

## Remaining Issue

The `error=auth0` problem persists because NextAuth v4 validates callback URLs against the **request origin** before using our forced `redirect_uri` value.

## Next Steps

Since NextAuth v4 doesn't support `url` property, we need to ensure:

1. **Middleware redirects happen FIRST** - ✅ Already implemented
2. **NEXTAUTH_URL matches request origin** - ✅ Should match after middleware redirect
3. **Callback URL forcing in provider** - ✅ Already implemented

The issue might be that NextAuth is still seeing a different origin. Let's test after this deployment completes.

## Testing After Deployment

1. **Wait for deployment** (2-3 minutes)
2. **Test signin endpoint:**
   ```bash
   curl -I "https://www.prepflow.org/api/auth/signin/auth0?callbackUrl=/webapp"
   ```
3. **Check if it redirects to Auth0** (not error page)
4. **If still failing**, check Vercel logs for `[Auth0 Config]` entries
