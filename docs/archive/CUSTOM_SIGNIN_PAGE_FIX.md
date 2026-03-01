# Custom SignIn Page Fix - Solution Found

**Date:** December 12, 2025
**Status:** ✅ Solution Identified

## Problem

When using a custom signIn page (`pages.signIn: '/api/auth/signin'`), NextAuth redirects ALL signin requests (including provider-specific ones like `/api/auth/signin/auth0`) to the custom signin page, even when a provider ID is present in the URL.

This causes a redirect loop:

1. User navigates to `/webapp` → Redirects to `/api/auth/signin?error=auth0`
2. Custom signin page tries to redirect to `/api/auth/signin/auth0`
3. NextAuth processes GET `/api/auth/signin/auth0` → Redirects back to `/api/auth/signin?error=auth0`
4. Loop continues...

## Root Cause

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

**Problem:** NextAuth checks for a custom signIn page BEFORE checking if there's a provider. When a custom signIn page exists, it redirects ALL signin requests to that page, even provider-specific ones.

## Solution

**Temporarily remove the custom signIn page** to allow NextAuth to handle provider signins correctly:

```typescript
// lib/auth-options.ts
pages: {
  // Temporarily removed custom signIn page to test if it fixes Auth0 redirect issue
  // signIn: '/api/auth/signin', // Custom Cyber Carrot styled sign-in page
  error: '/api/auth/error', // Custom error page (optional)
},
```

## Test Results

✅ **Redirect works correctly** when custom signIn page is removed:

- User navigates to `/webapp` → Redirects to `/api/auth/signin?error=auth0`
- NextAuth processes the request → Redirects to Auth0 login page
- User can log in successfully

## Next Steps

### Option 1: Use NextAuth's Default Signin Page (Recommended for Now)

- ✅ Works correctly with provider signins
- ✅ No redirect loops
- ❌ Loses custom Cyber Carrot styling
- ❌ Loses custom signin page UX

### Option 2: Conditional Custom SignIn Page (Future Enhancement)

We could modify the custom signIn page to:

1. Check if there's a provider ID in the URL
2. If provider ID exists, call `signIn(providerId)` directly (POST request)
3. If no provider ID, show the custom signin page

But this requires NextAuth to NOT redirect provider-specific signins to the custom page, which it currently does.

### Option 3: Style NextAuth's Default Signin Page

We could use CSS to style NextAuth's default signin page:

- Override NextAuth's default styles with Cyber Carrot theme
- Use CSS variables and Tailwind classes
- Maintain custom branding while using NextAuth's native signin flow

## Recommendation

**For now:** Keep the custom signIn page removed to ensure login works correctly.

**Future:** Implement Option 3 (style NextAuth's default signin page) to restore custom styling while maintaining correct functionality.

## Files Modified

- `lib/auth-options.ts` - Temporarily removed `signIn: '/api/auth/signin'`

## Related Documentation

- `docs/NEXTAUTH_ERROR_AUTH0_ROOT_CAUSE.md` - Root cause analysis
- `docs/NEXTAUTH_AUTH0_REDIRECT_FIX.md` - Previous fix attempts
- `docs/AUTH0_STRIPE_REFERENCE.md` - Auth0 configuration reference
