# Conditional Custom SignIn Page Implementation

**Date:** December 12, 2025
**Status:** ✅ **Complete - Both Parts Implemented**

## Overview

Implemented a two-part solution to restore custom Cyber Carrot styling while maintaining correct NextAuth redirect behavior:

1. **Part 1:** Style NextAuth's default signin page with Cyber Carrot CSS
2. **Part 2:** Conditional custom signIn page that auto-redirects provider signins

## Part 1: NextAuth Default Signin Page Styling

**File:** `app/globals.css`

Added comprehensive Cyber Carrot styling for NextAuth's default signin page CSS classes:

- `.signin` - Main container with dark background
- `.card` - Card container with gradient border effect
- `.button` - Cyber Carrot gradient buttons with hover effects
- `.error` - Styled error messages
- `.section-header` - Form labels
- Form inputs with focus states

**Features:**

- ✅ Dark theme background (`#0a0a0a`)
- ✅ Cyber Carrot gradient borders (Cyan → Orange → Magenta)
- ✅ Styled buttons with hover effects
- ✅ Responsive design for all screen sizes
- ✅ Maintains NextAuth functionality

## Part 2: Conditional Custom SignIn Page

**Files:**

- `lib/auth-options.ts` - Restored custom signIn page
- `app/api/auth/signin/page.tsx` - Conditional rendering logic

**How It Works:**

1. **Provider-Specific Signins** (`error=auth0`):
   - Custom signIn page detects `error=auth0` parameter
   - Immediately calls `signIn('auth0')` to bypass custom page
   - Shows loading state while redirecting
   - Redirects to Auth0 login page (POST request with CSRF token)
   - **Result:** No custom page UI shown, redirect works correctly

2. **Non-Provider Signins** (initial visit, etc.):
   - No `error=auth0` parameter detected
   - Shows full custom Cyber Carrot styled page
   - User can see custom branding and styling
   - **Result:** Custom UX for initial signin experience

**Implementation:**

```typescript
// Detect provider-specific signins and redirect immediately
useEffect(() => {
  if (error === 'auth0' && !isRedirecting && !redirectInitiated) {
    redirectInitiated = true;
    setIsRedirecting(true);
    // Bypass custom page and go straight to Auth0
    signIn('auth0', {
      callbackUrl,
      redirect: true,
    });
  }
}, [error, callbackUrl, isRedirecting]);

// Conditional rendering - show loading for provider signins
if (error === 'auth0' && isRedirecting) {
  return <LoadingState />; // Minimal UI while redirecting
}

// Show full custom page for non-provider signins
return <CustomSignInPage />;
```

## Benefits

✅ **Custom Styling:** Cyber Carrot design system applied to signin pages
✅ **Correct Redirects:** Provider signins work correctly (no redirect loops)
✅ **Best of Both Worlds:** Custom UX + working authentication flow
✅ **Backward Compatible:** Works with existing NextAuth configuration

## Test Results

✅ **Provider Signin:** `/api/auth/signin/auth0` → Redirects to Auth0 correctly
✅ **Custom Page:** `/api/auth/signin` → Shows custom Cyber Carrot page
✅ **Auto-Redirect:** `error=auth0` → Immediately redirects to Auth0
✅ **Styling:** NextAuth default page styled with Cyber Carrot theme

## Files Modified

- `app/globals.css` - Added NextAuth signin page styling (237 lines)
- `lib/auth-options.ts` - Restored custom signIn page configuration
- `app/api/auth/signin/page.tsx` - Added conditional rendering logic

## Related Documentation

- `docs/CUSTOM_SIGNIN_PAGE_FIX.md` - Initial problem analysis
- `docs/NEXTAUTH_ERROR_AUTH0_ROOT_CAUSE.md` - Root cause investigation
- `docs/AUTH0_STRIPE_REFERENCE.md` - Auth0 configuration reference
