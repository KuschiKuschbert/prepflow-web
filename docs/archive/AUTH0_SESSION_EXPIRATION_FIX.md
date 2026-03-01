# Auth0 Session Expiration Fix

**Date:** 2025-12-08
**Status:** ✅ **Complete - Session Expiration Properly Configured**

## Problem

Users were staying logged in indefinitely because:

- NextAuth sessions defaulted to 30 days (no `maxAge` configured)
- Client-side timeout (4 hours) only redirected, didn't sign out
- Token refresh didn't check expiration
- No server-side session validation

## Solution Implemented

### 1. Session maxAge Configuration ✅

**File:** `lib/auth-options.ts`

Added `maxAge` to session configuration to limit session lifetime to 4 hours:

```typescript
session: {
  strategy: 'jwt',
  maxAge: SESSION_MAX_AGE, // 4 hours - prevents "logged in forever" issue
},
```

**Environment Variable:** `NEXTAUTH_SESSION_MAX_AGE` (default: 14400 seconds = 4 hours)

### 2. Token Expiration Tracking ✅

**File:** `lib/auth-options.ts`

- **On initial sign-in:** Adds `exp` timestamp (4 hours from now) to JWT token
- **On token refresh:** Checks if token is expired, returns `RefreshAccessTokenError` if expired

**Implementation:**

- Stores expiration timestamp (`exp`) in JWT token on creation
- Checks `exp` against current time on every token refresh
- Returns error token if expired to force re-authentication

### 3. Session Callback Error Handling ✅

**File:** `lib/auth-options.ts`

Updated session callback to handle expired tokens:

```typescript
async session({ session, token }) {
  // If token has error (expired), return null session to force re-authentication
  if ((token as any).error === 'RefreshAccessTokenError') {
    return null as any;
  }
  // ... rest of session callback
}
```

### 4. Client-Side Timeout Fix ✅

**File:** `app/webapp/layout.tsx`

Updated timeout handler to actually sign out the user:

```typescript
onTimeout: async () => {
  // Actually sign out the user (not just redirect)
  // This clears the NextAuth session cookie
  await signOut({ redirect: false });
  // Then redirect to home page
  window.location.href = '/';
},
```

**Before:** Only redirected to home page (session cookie remained)
**After:** Calls `signOut()` to clear session cookie before redirecting

### 5. Environment Variable Documentation ✅

**File:** `env.example`

Added documentation for session duration configuration:

```bash
# NextAuth Session Configuration
NEXTAUTH_SESSION_MAX_AGE=14400  # 4 hours in seconds (default) - prevents "logged in forever" issue
```

## How It Works

### Session Expiration Flow

1. **User signs in:**
   - JWT token created with `exp` timestamp (4 hours from now)
   - Session cookie set with `maxAge` of 4 hours

2. **User active (within 4 hours):**
   - Token refresh checks expiration
   - If not expired, token refreshed normally
   - Session persists through activity

3. **User inactive (4 hours):**
   - Client-side timeout triggers
   - `signOut()` called → Session cookie cleared
   - User redirected to home page

4. **Token expired (server-side):**
   - NextAuth validates `maxAge` on session requests
   - Expired sessions return null
   - Middleware redirects to sign-in page

5. **Token refresh on expired token:**
   - JWT callback checks `exp` timestamp
   - If expired, returns `RefreshAccessTokenError`
   - Session callback returns null session
   - User forced to re-authenticate

### Logout Flow Verification ✅

**Test Script:** `scripts/test-logout-flow.js`
**Command:** `npm run test:logout`

**Results:**

- ✅ Logout endpoint accessible and redirects to Auth0
- ✅ LogoutButton calls `signOut({ redirect: false })`
- ✅ LogoutButton redirects to `/api/auth/logout`
- ✅ Logout API constructs Auth0 logout URL
- ✅ Session config has `maxAge` configured
- ✅ JWT callback checks token expiration
- ✅ Session callback handles expired tokens

## Testing

### Manual Testing

1. **Session Expiration:**
   - Sign in to the application
   - Wait 4 hours (or set `NEXTAUTH_SESSION_MAX_AGE` to a shorter duration for testing)
   - Verify session expires and user is redirected to sign-in

2. **Client-Side Timeout:**
   - Sign in to the application
   - Stay inactive for 4 hours
   - Verify warning shown at 3h 45m
   - Verify user signed out and redirected at 4h

3. **Logout Button:**
   - Sign in to the application
   - Click logout button
   - Verify redirected to Auth0 logout
   - Verify session cookie cleared
   - Verify protected routes require re-authentication

### Automated Testing

```bash
# Test logout flow
npm run test:logout

# Test Auth0 integration (includes session tests)
npm run test:auth0
```

## Configuration

### Environment Variables

```bash
# Session duration (in seconds)
NEXTAUTH_SESSION_MAX_AGE=14400  # 4 hours (default)
```

### Auth0 Dashboard Configuration

**Required:** Whitelist logout URL in Auth0 dashboard:

1. Go to: https://manage.auth0.com
2. Applications > Your App > Settings
3. "Allowed Logout URLs" should include: `http://localhost:3000` (dev) and your production URL

## Benefits

✅ **Security:** Sessions expire after 4 hours of inactivity
✅ **User Experience:** Clear session expiration behavior
✅ **Compliance:** Meets security best practices for session management
✅ **Failproof:** Multiple layers of expiration checking (client + server)
✅ **Logout:** Properly clears both NextAuth and Auth0 sessions

## Related Files

- `lib/auth-options.ts` - Session configuration and token expiration logic
- `app/webapp/layout.tsx` - Client-side timeout handler
- `app/webapp/components/LogoutButton.tsx` - Logout button implementation
- `app/api/auth/logout/route.ts` - Logout API endpoint
- `scripts/test-logout-flow.js` - Logout flow verification tests
- `env.example` - Environment variable documentation

## Status

✅ **All fixes implemented and tested**
✅ **Session expiration working correctly**
✅ **Logout flow verified**
✅ **No "logged in forever" issue**
