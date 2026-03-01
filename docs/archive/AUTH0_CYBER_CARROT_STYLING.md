# Auth0 Cyber Carrot Styling Guide

**Date:** 2025-12-08
**Status:** ✅ **Complete - Custom Styled Auth0 Pages**

## Overview

The Auth0 sign-in and error pages have been customized with the **Cyber Carrot Design System** to match PrepFlow's visual identity.

## Custom Pages Created

### 1. Sign-In Page (`/api/auth/signin`)

**Location:** `app/api/auth/signin/page.tsx`

**Features:**

- ✅ Cyber Carrot gradient border (Cyan → Orange → Magenta → Cyan)
- ✅ Dark theme background (`#1f1f1f`)
- ✅ Cyber Carrot button styling with gradient
- ✅ Fluid typography from landing styles
- ✅ Loading states with Cyber Carrot spinner
- ✅ Error message display
- ✅ "Create account" link with signup hint
- ✅ Responsive design (mobile-first)

**Styling Elements:**

- **Container:** Gradient border with rounded-3xl
- **Background:** Dark theme (`bg-[#1f1f1f]/95`)
- **Button:** Cyber Carrot gradient (`from-[#29E7CD] via-[#FF6B00] to-[#D925C7]`)
- **Typography:** Fluid typography system from `landing-styles.ts`
- **Hover Effects:** Shadow glow with orange accent

### 2. Error Page (`/api/auth/error`)

**Location:** `app/api/auth/error/page.tsx`

**Features:**

- ✅ Cyber Carrot gradient border
- ✅ Error icon with red accent
- ✅ Contextual error messages
- ✅ "Try Again" button with Cyber Carrot gradient
- ✅ Error code display for debugging
- ✅ Responsive design

**Error Types Handled:**

- `Configuration` - Server configuration errors
- `AccessDenied` - Permission denied
- `Verification` - Token verification errors
- `Default` - Generic authentication errors

## Configuration

### NextAuth Pages Configuration

Updated `lib/auth-options.ts` to use custom pages:

```typescript
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers,
  pages: {
    signIn: '/api/auth/signin', // Custom Cyber Carrot styled sign-in page
    error: '/api/auth/error', // Custom error page
  },
  // ... rest of config
};
```

## Design System Integration

### Colors Used

- **Primary:** `#29E7CD` (Electric Cyan)
- **Secondary:** `#3B82F6` (Blue)
- **Accent:** `#D925C7` (Vibrant Magenta)
- **Tertiary:** `#FF6B00` (Cyber Orange)
- **Background:** `#0a0a0a` (Dark background)
- **Surface:** `#1f1f1f` (Card background)
- **Border:** `#2a2a2a` (Subtle borders)

### Typography

Uses `LANDING_TYPOGRAPHY` constants:

- `text-fluid-3xl` - Page titles
- `text-fluid-base` - Body text
- `text-fluid-sm` - Small text
- `text-fluid-xs` - Fine print

### Components

- **Gradient Border:** Cyber Carrot pattern (`from-[#29E7CD]/20 via-[#FF6B00]/20 via-[#D925C7]/20 to-[#29E7CD]/20`)
- **Buttons:** Gradient buttons with hover effects
- **Cards:** Rounded-3xl containers with dark backgrounds

## User Experience

### Sign-In Flow

1. User navigates to protected route
2. Redirected to `/api/auth/signin` (custom Cyber Carrot page)
3. Sees branded sign-in button
4. Clicks "Sign in with Auth0"
5. Redirected to Auth0 Universal Login
6. After authentication, redirected back to app

### Error Handling

1. If error occurs, redirected to `/api/auth/error`
2. Sees contextual error message
3. Can click "Try Again" to retry
4. Can navigate back to home

## Testing

### Manual Testing

1. **Test Sign-In Page:**

   ```bash
   # Navigate to sign-in page
   http://localhost:3000/api/auth/signin
   ```

2. **Test Error Page:**

   ```bash
   # Navigate to error page with error parameter
   http://localhost:3000/api/auth/error?error=AccessDenied
   ```

3. **Test Sign-In Flow:**
   - Navigate to `/webapp` (protected route)
   - Should redirect to custom sign-in page
   - Click sign-in button
   - Complete Auth0 authentication
   - Should redirect back to `/webapp`

### Visual Verification

- ✅ Gradient borders visible
- ✅ Dark theme consistent
- ✅ Typography matches landing page
- ✅ Buttons have hover effects
- ✅ Responsive on mobile/tablet/desktop
- ✅ Loading states work correctly

## Customization

### Modify Sign-In Page

Edit `app/api/auth/signin/page.tsx`:

- **Change colors:** Update gradient colors in button classes
- **Change layout:** Modify container structure
- **Add branding:** Add logo or additional branding elements
- **Change copy:** Update text content

### Modify Error Page

Edit `app/api/auth/error/page.tsx`:

- **Add error types:** Add new entries to `errorMessages` object
- **Change styling:** Update colors, typography, layout
- **Add actions:** Add additional action buttons

## Best Practices

### ✅ Do

- Use Cyber Carrot design system constants
- Maintain consistent spacing and typography
- Test on all screen sizes
- Handle loading and error states
- Provide clear error messages

### ❌ Don't

- Use hardcoded colors (use constants)
- Break responsive design
- Skip error handling
- Use generic error messages
- Forget to test authentication flow

## Related Documentation

- `docs/LANDING_PAGE_STYLE_GUIDE.md` - Complete style guide
- `lib/landing-styles.ts` - Style constants and utilities
- `docs/AUTH0_FAILPROOF_ANALYSIS.md` - Auth0 integration analysis
- `AUTH0_LOCALHOST_SETUP.md` - Localhost configuration

## Future Enhancements

### Potential Improvements

1. **Logo Integration:** Add PrepFlow logo to sign-in page
2. **Animation:** Add subtle animations (fade-in, slide-up)
3. **Social Providers:** Style multiple provider buttons
4. **Remember Me:** Add "Remember me" checkbox
5. **Password Reset:** Add password reset link
6. **Multi-language:** Support multiple languages

### Auth0 Universal Login Customization

For even more customization, you can customize Auth0's Universal Login page:

1. Go to Auth0 Dashboard
2. Navigate to **Branding** > **Universal Login**
3. Customize the login page HTML/CSS
4. Use Cyber Carrot colors and styling

**Note:** Custom pages (what we've created) are simpler and easier to maintain than Universal Login customization.

---

**Status:** ✅ **Production Ready**

The Auth0 sign-in and error pages are fully styled with Cyber Carrot design system and ready for production use.
