# Auth0 SDK Browser Testing Guide

**Date:** December 13, 2025
**Status:** Ready for Testing

## Overview

This guide provides comprehensive browser testing steps for the Auth0 SDK migration. Test each step thoroughly and log all errors, redirects, and behaviors.

## Pre-Testing Checklist

- [ ] Vercel deployment is complete and live
- [ ] Environment variables are configured in Vercel:
  - `AUTH0_SECRET`
  - `AUTH0_BASE_URL` (should be `https://www.prepflow.org` for production)
  - `AUTH0_ISSUER_BASE_URL`
  - `AUTH0_CLIENT_ID`
  - `AUTH0_CLIENT_SECRET`
- [ ] Auth0 Dashboard is configured with callback/logout URLs
- [ ] Browser console is open (F12 → Console tab)
- [ ] Network tab is open (F12 → Network tab)

## Testing Steps

### 1. Landing Page Access

**URL:** `https://www.prepflow.org`

**Expected Behavior:**

- ✅ Page loads successfully
- ✅ No console errors
- ✅ Sign in/Register buttons visible

**What to Log:**

- [ ] Page load time
- [ ] Any console errors or warnings
- [ ] Network requests (check for failed requests)
- [ ] Cookies set (Application → Cookies)

**Test:**

```bash
# Open browser and navigate to:
https://www.prepflow.org
```

---

### 2. Login Flow - Direct Login URL

**URL:** `https://www.prepflow.org/api/auth/login?returnTo=/webapp`

**Expected Behavior:**

- ✅ Redirects to Auth0 login page
- ✅ Shows Google login option
- ✅ No 400 errors

**What to Log:**

- [ ] HTTP status code (should be 302/307 redirect)
- [ ] Redirect location (should include `auth0.com`)
- [ ] Any console errors
- [ ] Network requests (check for failed requests)
- [ ] Cookies set after redirect

**Test:**

```bash
# Open browser and navigate to:
https://www.prepflow.org/api/auth/login?returnTo=/webapp
```

**If you see 400 error:**

- Check Vercel logs for Auth0 SDK errors
- Verify environment variables are set correctly
- Check Auth0 Dashboard configuration

---

### 3. Google Login Flow

**Steps:**

1. Click "Sign in" button on landing page OR navigate to `/api/auth/login?returnTo=/webapp`
2. Should redirect to Auth0 login page
3. Click "Continue with Google"
4. Complete Google authentication
5. Should redirect back to `/webapp`

**Expected Behavior:**

- ✅ Redirects to Auth0 login page
- ✅ Google login button works
- ✅ After Google auth, redirects to `/webapp`
- ✅ User is logged in (can see webapp content)
- ✅ No console errors

**What to Log:**

- [ ] Each redirect URL
- [ ] Time taken for each redirect
- [ ] Any console errors during flow
- [ ] Network requests (check for failed requests)
- [ ] Cookies set after login (should include Auth0 session cookies)
- [ ] Final URL after login

**Test:**

```bash
# 1. Navigate to landing page
https://www.prepflow.org

# 2. Click "Sign in" button
# OR navigate directly to:
https://www.prepflow.org/api/auth/login?returnTo=/webapp

# 3. Complete Google login
# 4. Verify redirect to /webapp
```

---

### 4. Protected Route Access (Without Login)

**URL:** `https://www.prepflow.org/webapp`

**Expected Behavior:**

- ✅ Redirects to `/api/auth/login?returnTo=/webapp`
- ✅ No 401/403 errors
- ✅ Smooth redirect flow

**What to Log:**

- [ ] HTTP status code (should be 302/307 redirect)
- [ ] Redirect location (should be `/api/auth/login?returnTo=/webapp`)
- [ ] Any console errors
- [ ] Network requests (check for failed requests)

**Test:**

```bash
# Open browser in incognito/private mode (not logged in)
# Navigate to:
https://www.prepflow.org/webapp
```

---

### 5. Protected Route Access (After Login)

**URL:** `https://www.prepflow.org/webapp`

**Expected Behavior:**

- ✅ Page loads successfully
- ✅ User is authenticated
- ✅ Can see webapp content
- ✅ No redirect loops

**What to Log:**

- [ ] Page load time
- [ ] Any console errors
- [ ] Network requests (check for failed requests)
- [ ] User email displayed in navigation (if applicable)
- [ ] Cookies present (should include Auth0 session cookies)

**Test:**

```bash
# After completing login flow, navigate to:
https://www.prepflow.org/webapp
```

---

### 6. Logout Flow

**Steps:**

1. While logged in, click "Logout" button
2. Should redirect to Auth0 logout
3. Should redirect back to landing page
4. Should be logged out

**Expected Behavior:**

- ✅ Logout button works
- ✅ Redirects to Auth0 logout endpoint
- ✅ Redirects back to landing page
- ✅ User is logged out (cannot access `/webapp` without login)
- ✅ Session cookies cleared

**What to Log:**

- [ ] Logout button click
- [ ] Redirect URLs
- [ ] Cookies cleared (check Application → Cookies)
- [ ] Final URL after logout
- [ ] Any console errors

**Test:**

```bash
# 1. While logged in, click "Logout" button
# OR navigate to:
https://www.prepflow.org/api/auth/logout?returnTo=https://www.prepflow.org

# 2. Verify redirect to Auth0 logout
# 3. Verify redirect back to landing page
# 4. Try accessing /webapp - should redirect to login
```

---

### 7. Protected API Route (Without Auth)

**URL:** `https://www.prepflow.org/api/me`

**Expected Behavior:**

- ✅ Returns 401 Unauthorized
- ✅ JSON error response
- ✅ No redirect

**What to Log:**

- [ ] HTTP status code (should be 401)
- [ ] Response body (should be JSON error)
- [ ] Any console errors
- [ ] Network request details

**Test:**

```bash
# Open browser console (F12)
# Run:
fetch('https://www.prepflow.org/api/me')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

### 8. Protected API Route (With Auth)

**URL:** `https://www.prepflow.org/api/me`

**Expected Behavior:**

- ✅ Returns 200 OK
- ✅ JSON response with user data
- ✅ User email in response

**What to Log:**

- [ ] HTTP status code (should be 200)
- [ ] Response body (should include user email)
- [ ] Any console errors
- [ ] Network request details

**Test:**

```bash
# After logging in, open browser console (F12)
# Run:
fetch('https://www.prepflow.org/api/me')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

### 9. Session Refresh

**Steps:**

1. Log in
2. Wait 5 minutes
3. Navigate to a different page
4. Session should still be valid

**Expected Behavior:**

- ✅ Session remains valid after inactivity
- ✅ No unexpected logouts
- ✅ Can still access protected routes

**What to Log:**

- [ ] Time waited
- [ ] Session still valid (can access `/webapp`)
- [ ] Any console errors
- [ ] Cookies still present

**Test:**

```bash
# 1. Log in
# 2. Wait 5 minutes
# 3. Navigate to /webapp/ingredients
# 4. Verify still logged in
```

---

### 10. Error Handling

**Test Invalid Login:**

- Try logging in with invalid credentials
- Should show error message
- Should not crash

**Test Network Error:**

- Disable network during login
- Should show error message
- Should not crash

**What to Log:**

- [ ] Error messages displayed
- [ ] Console errors
- [ ] Network requests (check for failed requests)
- [ ] User experience (is error message helpful?)

---

## Common Issues & Solutions

### Issue: 400 Bad Request on `/api/auth/login`

**Possible Causes:**

- Missing `AUTH0_SECRET` environment variable
- Missing `AUTH0_BASE_URL` environment variable
- Auth0 SDK configuration incorrect

**Solution:**

1. Check Vercel environment variables
2. Verify `AUTH0_SECRET` is set (should be 32+ characters)
3. Verify `AUTH0_BASE_URL` is set to `https://www.prepflow.org`
4. Check Vercel build logs for Auth0 SDK warnings

---

### Issue: Redirect Loop

**Possible Causes:**

- Callback URL not configured in Auth0 Dashboard
- Middleware redirecting incorrectly
- Auth0 SDK route handler not working

**Solution:**

1. Check Auth0 Dashboard → Applications → Settings → Allowed Callback URLs
2. Should include: `https://www.prepflow.org/api/auth/callback`
3. Check proxy.ts for incorrect redirects
4. Verify `[...auth0]/route.ts` exists and is correct

---

### Issue: Session Not Persisting

**Possible Causes:**

- Cookies not being set
- Cookie domain/path incorrect
- Session configuration incorrect

**Solution:**

1. Check Application → Cookies in browser DevTools
2. Verify Auth0 session cookies are present
3. Check cookie domain (should be `.prepflow.org` or `www.prepflow.org`)
4. Verify `AUTH0_SECRET` is set correctly

---

### Issue: Google Login Not Working

**Possible Causes:**

- Google OAuth not configured in Auth0 Dashboard
- Google connection not enabled
- Callback URL not whitelisted

**Solution:**

1. Check Auth0 Dashboard → Authentication → Social → Google
2. Verify Google connection is enabled
3. Check callback URLs are configured correctly
4. Verify Google OAuth credentials are set

---

## Logging Template

Use this template to log your testing results:

```markdown
## Test: [Test Name]

**Date:** [Date/Time]
**Browser:** [Chrome/Firefox/Safari] [Version]
**URL:** [URL tested]

### Results:

- ✅/❌ Status: [Pass/Fail]
- HTTP Status: [Status code]
- Redirects: [List of redirects]
- Cookies: [List of cookies set]
- Console Errors: [List of errors]
- Network Errors: [List of failed requests]

### Notes:

[Any additional observations]
```

---

## Next Steps After Testing

1. **If all tests pass:**
   - ✅ Migration successful
   - ✅ Ready for production use
   - ✅ Monitor for any edge cases

2. **If tests fail:**
   - Document specific failures
   - Check Vercel logs for errors
   - Verify Auth0 Dashboard configuration
   - Check environment variables
   - Review middleware and route handlers

---

## Browser Console Commands for Testing

```javascript
// Check current user
fetch('/api/me')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Check session
fetch('/api/auth/me')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test logout
window.location.href = '/api/auth/logout?returnTo=/';

// Test login
window.location.href = '/api/auth/login?returnTo=/webapp';
```

---

## Support

If you encounter issues during testing:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Check Network tab for failed requests
4. Verify Auth0 Dashboard configuration
5. Review this guide for common issues
