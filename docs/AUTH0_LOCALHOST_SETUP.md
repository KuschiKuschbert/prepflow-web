# Auth0 Localhost Configuration Guide

## Quick Setup Instructions

To enable Auth0 authentication on localhost, you need to configure your Auth0 application to allow localhost URLs.

### 1. Auth0 Dashboard Configuration

1. Go to https://manage.auth0.com
2. Navigate to **Applications** > **Applications**
3. Select your application (or create a new one if needed)
4. Go to **Settings** tab

### 2. Configure Allowed URLs

Add these URLs to your Auth0 application:

#### Allowed Callback URLs:

```
http://localhost:3000/api/auth/callback/auth0
http://localhost:3001/api/auth/callback/auth0
```

#### Allowed Logout URLs:

```
http://localhost:3000
http://localhost:3000/
http://localhost:3001
http://localhost:3001/
```

**⚠️ CRITICAL:** These URLs MUST be added to "Allowed Logout URLs" or logout will fail with `redirect_uri_mismatch` error.

#### Allowed Web Origins:

```
http://localhost:3000
http://localhost:3001
```

### 3. Save Changes

Click **Save Changes** at the bottom of the Settings page.

### 4. Environment Variables

Your `.env.local` is already configured:

```bash
AUTH0_ISSUER_BASE_URL=https://dev-7myakdl4itf644km.us.auth0.com
AUTH0_CLIENT_ID=CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL
AUTH0_CLIENT_SECRET=zlbcaViOHPG27NhE1KwcQjUp8aiOTILCgVAX0kR1IzSM0bxs1BVpv8KL9uIeqgX_
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-me
ALLOWED_EMAILS=derkusch@gmail.com
```

### 5. Test Authentication

```bash
# Start the dev server
npm run dev

# Navigate to http://localhost:3001/webapp
# You should be redirected to Auth0 login
# After login, you'll be redirected back to /webapp
```

### 6. Test Logout

```bash
# After logging in, navigate to /not-authorized or any protected route
# Click the "Logout" button
# Verify:
#   - You're redirected to landing page
#   - Session is cleared
#   - Next login shows fresh login screen (not remembered account)
```

**Troubleshooting Logout:**

- If logout doesn't work, check that `http://localhost:3000` and `http://localhost:3001` are in "Allowed Logout URLs"
- If using Auth0 developer keys with social connections, federated logout won't work (see [AUTH0_LOGOUT_SETUP.md](../docs/AUTH0_LOGOUT_SETUP.md))

---

## Admin Panel Access

### Assigning Admin Role in Auth0

To access the admin panel (`/admin`), you need to assign an admin role to your user in Auth0:

1. Go to https://manage.auth0.com
2. Navigate to **User Management** > **Users**
3. Find your user (derkusch@gmail.com)
4. Click on the user to open their profile
5. Go to the **Roles** tab
6. Click **Assign Roles**
7. Select `admin` or `super_admin` role
8. Click **Assign**

### Configuring Auth0 Actions to Include Roles in Token (Recommended)

**This is the recommended approach** - it includes roles directly in the token, so no Management API calls are needed.

1. Go to https://manage.auth0.com
2. Navigate to **Actions** > **Flows**
3. Select **Login** flow
4. Click **+ Add Action** > **Build Custom**
5. Create a new action with this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://prepflow.org';

  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

6. Name it "Add Roles to Token"
7. Click **Deploy**
8. Drag the action into the Login flow (after the "Complete" step)
9. Click **Apply**
10. **Important**: After adding the action, you must **log out and log back in** for roles to appear in the token

**Verification:**

- Visit `/api/debug/token` after logging in again
- Check that `roles` array contains your roles (e.g., `["admin"]`)
- Check that `rolesSource` is `token`

### Development Bypass

For local development, you can bypass admin role checks:

```bash
# Add to .env.local
ADMIN_BYPASS=true
```

**⚠️ WARNING:** This bypass only works in development mode (`NODE_ENV=development`). It will NOT work in production.

### Feature Flag Access for Admin Emails

Emails in `ALLOWED_EMAILS` automatically get access to all feature flags:

- **Regular Feature Flags**: All flags return `true` for admin emails
- **Hidden Feature Flags**: All hidden/unlockable features are automatically unlocked and enabled

This means `derkusch@gmail.com` (if in `ALLOWED_EMAILS`) will see all flagged features without manual configuration.

**How it works:**

- `lib/feature-flags.ts` checks if user email is in `ALLOWED_EMAILS` before checking database flags
- `lib/hidden-feature-flags.ts` checks if user email is in `ALLOWED_EMAILS` before checking database flags
- If email matches, functions return `true` immediately (bypassing database checks)

**Debugging:**

- Visit `/api/debug/token` (development only) to inspect your session token
- Check console logs for token extraction details (development only)
- Verify roles are present in token payload

---

## Troubleshooting: Empty Roles

If you've assigned roles in Auth0 but they're showing as empty (`roles: []`) in the token, here's how to troubleshoot:

### Step 1: Verify Roles Are Assigned in Auth0

1. Go to https://manage.auth0.com
2. Navigate to **User Management** > **Users**
3. Find your user and click on them
4. Go to the **Roles** tab
5. Verify that `admin` or `super_admin` role is listed

### Step 2: Check Debug Endpoint

Visit `/api/debug/token` in your browser (development only) to see:

- **roles**: Array of roles found in token
- **rolesSource**: Where roles came from (`token` or `management-api`)
- **auth0UserId**: Your Auth0 user ID for Management API lookup
- **troubleshooting.recommendation**: Helpful message about what to check

### Step 3: Management API Fallback (Alternative to Auth0 Actions)

If roles aren't in the token, the app can automatically fetch them from Auth0 Management API. However, this requires setting up a **client grant** in Auth0.

**Setup Client Grant for Management API:**

1. Go to https://manage.auth0.com
2. Navigate to **Applications** > **APIs**
3. Find **Auth0 Management API** (should exist by default)
4. Click on it to open settings
5. Go to **Machine to Machine Applications** tab
6. Find your application (Client ID: `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL`)
7. Toggle it to **Authorized** (if not already)
8. Expand the scopes and enable:
   - `read:users` - Read user information
   - `read:roles` - Read role information
   - `read:role_members` - Read which users have which roles
9. Click **Update**

**How it works:**

- When roles are empty in token, the JWT callback fetches roles from Management API using your Auth0 credentials
- **Requirements**: `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, and `AUTH0_CLIENT_SECRET` must be configured
- **Caching**: Roles are cached in the token to avoid repeated API calls
- **Debugging**: Check console logs (development only) for `[Auth0 Management]` messages

**Note**: Auth0 Actions (Option 1) is recommended over Management API fallback because:

- Simpler setup (no client grant needed)
- Faster (roles in token, no API call)
- More reliable (no dependency on Management API availability)

### Step 4: Configure Auth0 Actions (Recommended)

While Management API fallback works, it's better to include roles in the token:

1. Go to https://manage.auth0.com
2. Navigate to **Actions** > **Flows**
3. Select **Login** flow
4. Click **+ Add Action** > **Build Custom**
5. Create a new action with this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://prepflow.org';

  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

6. Name it "Add Roles to Token"
7. Click **Deploy**
8. Drag the action into the Login flow (after the "Complete" step)
9. Click **Apply**
10. **Important**: After adding the action, you need to **log out and log back in** for roles to appear in the token

### Step 5: Verify After Fix

1. Log out completely
2. Log back in
3. Visit `/api/debug/token` again
4. Check that `roles` array contains your roles
5. Check that `rolesSource` is `token` (if Auth0 Actions configured) or `management-api` (if using fallback)

### Common Issues

**Issue**: Roles still empty after configuring Auth0 Actions

- **Solution**: Make sure you logged out and logged back in after adding the action
- **Solution**: Check that the action is deployed and added to the Login flow
- **Solution**: Verify the action code matches exactly (namespace must be `https://prepflow.org`)

**Issue**: Management API fallback not working

- **Solution**: Check that `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, and `AUTH0_CLIENT_SECRET` are set correctly
- **Solution**: Check console logs for `[Auth0 Management]` error messages
- **Solution**: Verify your Auth0 application has Management API access (should work by default)

**Issue**: Admin panel still redirects to `/not-authorized`

- **Solution**: Check `/api/debug/token` to see if roles are present
- **Solution**: Verify roles include `admin` or `super_admin` (case-sensitive)
- **Solution**: Use `ADMIN_BYPASS=true` in development for testing (see Development Bypass section)

---

## Alternative: Development Mode Bypass

If you want to bypass authentication for local testing, you can use `ADMIN_BYPASS=true` in development mode. However, this is **NOT recommended for production** and should only be used for rapid development.
