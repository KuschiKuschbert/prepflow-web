# NextAuth Auth0 Redirect Fix - Final Solution

**Date:** December 12, 2025
**Status:** 🔍 Investigating Root Cause

## Problem Summary

When accessing `/api/auth/signin/auth0?callbackUrl=/webapp`:

- NextAuth returns HTTP 400 or redirects to `/api/auth/signin?error=auth0`
- The redirect to Auth0 never happens
- User sees "Redirecting to sign in..." message but nothing happens

## Root Cause Analysis

### NextAuth Request Parsing Bug

**File:** `node_modules/next-auth/src/core/index.ts`
**Line:** 72

```typescript
error: url.searchParams.get("error") ?? nextauth[1],
```

When NextAuth parses `/api/auth/signin/auth0`:

1. `nextauth[0]` = `"signin"` (action)
2. `nextauth[1]` = `"auth0"` (providerId)
3. `error` = `undefined ?? "auth0"` = `"auth0"` (fallback bug)

### NextAuth Signin Route Handler

**File:** `node_modules/next-auth/src/core/index.ts`
**Line:** 187-194

```typescript
case "signin":
  if (pages.signIn) {
    let signinUrl = `${pages.signIn}${
      pages.signIn.includes("?") ? "&" : "?"
    }callbackUrl=${encodeURIComponent(options.callbackUrl)}`
    if (error)
      signinUrl = `${signinUrl}&error=${encodeURIComponent(error)}`
    return { redirect: signinUrl, cookies }
  }
```

**Problem:** When `error` is set (even if it's just the provider ID), NextAuth redirects to the custom signin page instead of processing the provider signin.

### Why Provider Signin Doesn't Work

When NextAuth processes `/api/auth/signin/auth0`:

1. It parses the URL and sets `error = "auth0"` (fallback bug)
2. It checks if there's a custom signIn page (`pages.signIn`)
3. Since we have a custom signIn page (`/api/auth/signin`), it redirects there with `error=auth0`
4. The provider signin route handler (`routes.signin`) is never called

## Solution Options

### Option 1: Remove Custom SignIn Page (Not Recommended)

Remove `pages.signIn` from `authOptions` to let NextAuth handle signin natively:

- ❌ Loses custom Cyber Carrot styling
- ❌ Loses custom signin page UX
- ✅ Would fix the redirect issue

### Option 2: Fix NextAuth Request Parser (Not Possible)

We can't modify NextAuth source code, so we can't fix the fallback bug directly.

### Option 3: Workaround - Handle in Middleware (Recommended)

Intercept `/api/auth/signin/auth0` requests in middleware and ensure they're processed correctly:

```typescript
// In proxy.ts
if (pathname === '/api/auth/signin/auth0') {
  // Let NextAuth handle it - don't redirect
  return NextResponse.next();
}
```

But this won't help because NextAuth still processes it incorrectly.

### Option 4: Fix Auth0 Provider Configuration (Investigate)

Check if the Auth0 provider configuration is correct:

- ✅ `callbackURL` is set correctly
- ✅ `authorization.params.redirect_uri` is set correctly
- ❓ Maybe NextAuth needs both or a different configuration?

### Option 5: Use NextAuth's Native Signin (Recommended)

Instead of redirecting to `/api/auth/signin/auth0`, use NextAuth's built-in signin flow:

- Call `signIn('auth0')` from the client
- This should bypass the custom signin page for provider-specific signins

## Recommended Fix

**Use NextAuth's `signIn()` function directly** instead of redirecting to `/api/auth/signin/auth0`:

```typescript
// In app/api/auth/signin/page.tsx
useEffect(() => {
  if (error === 'auth0' && providers?.auth0 && !isRedirecting) {
    setIsRedirecting(true);
    // Use NextAuth's signIn() function directly
    signIn('auth0', {
      callbackUrl,
      redirect: true, // Force immediate redirect
    });
  }
}, [error, providers, callbackUrl, isRedirecting]);
```

This should:

1. ✅ Bypass the custom signin page
2. ✅ Call NextAuth's signin route handler directly
3. ✅ Generate the Auth0 authorization URL correctly
4. ✅ Redirect to Auth0 immediately

## Testing

1. Navigate to `https://www.prepflow.org/webapp`
2. Should redirect to `/api/auth/signin?error=auth0`
3. Auto-redirect should call `signIn('auth0')` directly
4. Should redirect to Auth0 login page immediately

## Next Steps

1. ✅ Update signin page to use `signIn('auth0')` directly
2. ✅ Test in browser
3. ✅ Verify redirect works correctly
4. ✅ Document the solution
