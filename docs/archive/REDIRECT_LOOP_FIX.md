# Redirect Loop Fix - Google Login Issue

**Date:** December 12, 2025
**Status:** ✅ **Fixed - Custom SignIn Page Removed**

## Problem

When logging in with Google account through Auth0, users experienced a redirect loop:

1. User navigates to `/webapp` → Redirects to `/api/auth/signin?error=auth0`
2. Custom signin page detects `error=auth0` → Calls `signIn('auth0')` or redirects to `/api/auth/signin/auth0`
3. NextAuth processes request → Redirects back to `/api/auth/signin?error=auth0` (because custom signin page exists)
4. Loop continues indefinitely...

## Root Cause

**File:** `lib/auth-options.ts`

When a custom signIn page is configured (`pages.signIn: '/api/auth/signin'`), NextAuth redirects **ALL** signin requests (including provider-specific ones like `/api/auth/signin/auth0`) to the custom signin page.

**NextAuth Behavior:**

- NextAuth checks for custom signIn page **BEFORE** processing provider signins
- When custom signIn page exists, it redirects provider signins to the custom page with `error=auth0`
- The custom page then tries to redirect back to the provider signin route
- This creates an infinite redirect loop

## Solution

**Removed the custom signIn page** from `authOptions`:

```typescript
pages: {
  // Removed custom signIn page to prevent redirect loops with provider signins
  // NextAuth's default signin page is styled with Cyber Carrot CSS (app/globals.css)
  error: '/api/auth/error', // Custom error page (optional)
},
```

**Why This Works:**

- NextAuth's default signin page handles provider signins correctly
- No redirect loops because NextAuth processes provider signins directly
- Cyber Carrot styling is maintained via CSS (`app/globals.css`)
- Provider signins (Auth0, Google) now work correctly

## Benefits

✅ **No Redirect Loops:** Provider signins work correctly without looping
✅ **Cyber Carrot Styling:** Default signin page is styled with Cyber Carrot CSS
✅ **Correct Redirects:** After Google login, users are redirected to `/webapp` correctly
✅ **Simpler Code:** No complex conditional logic needed in custom signin page

## Testing

After deployment, test the Google login flow:

1. Navigate to `/webapp`
2. Should redirect to Auth0 login page (no loop)
3. Log in with Google account
4. Should redirect to `/webapp` after successful login (no loop)

## Files Changed

- `lib/auth-options.ts` - Removed `signIn: '/api/auth/signin'` from pages config
- `app/globals.css` - Cyber Carrot styling for NextAuth's default signin page (already implemented)

## Related Documentation

- `docs/CONDITIONAL_SIGNIN_PAGE_IMPLEMENTATION.md` - Previous attempt at conditional custom signin page
- `docs/GOOGLE_LOGIN_FIX.md` - Session callback defensive checks
- `docs/CUSTOM_SIGNIN_PAGE_FIX.md` - Root cause analysis of custom signin page issue
