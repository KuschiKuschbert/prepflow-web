# Auth0 Production Setup Guide

**Purpose:** Complete guide for configuring Auth0 in production to prevent authentication errors.

## Critical Production Configuration

### 1. Auth0 Dashboard Configuration

**Location:** https://manage.auth0.com → Applications → Your Application → Settings

#### Allowed Callback URLs (REQUIRED)

Add **ALL** of these URLs (both www and non-www):

```
https://prepflow.org/api/auth/callback/auth0
https://www.prepflow.org/api/auth/callback/auth0
http://localhost:3000/api/auth/callback/auth0
http://localhost:3001/api/auth/callback/auth0
```

**⚠️ CRITICAL:** Both `prepflow.org` and `www.prepflow.org` must be included, or users will get `error=autho` or `error=Callback` errors.

#### Allowed Logout URLs (REQUIRED)

Add **ALL** of these URLs (both www and non-www, with and without trailing slash):

```
https://prepflow.org
https://prepflow.org/
https://www.prepflow.org
https://www.prepflow.org/
http://localhost:3000
http://localhost:3000/
http://localhost:3001
http://localhost:3001/
```

**⚠️ CRITICAL:** Logout URLs MUST include both www and non-www versions, or logout will fail.

#### Allowed Web Origins (REQUIRED)

Add **ALL** of these origins:

```
https://prepflow.org
https://www.prepflow.org
http://localhost:3000
http://localhost:3001
```

#### Application Login URI (OPTIONAL but Recommended)

**Purpose:** Used for password reset and email verification redirects. Not required for standard OAuth flow, but improves UX.

**Set to:**

```
https://www.prepflow.org/api/auth/signin
```

**Why:** When users reset passwords or verify emails, Auth0 redirects them back to this URL to complete the authentication flow.

**Note:** This is optional - your OAuth flow will work without it, but it's recommended for better user experience.

### 2. Environment Variables (Production)

**Vercel Environment Variables:**

```bash
# Auth0 Configuration
AUTH0_ISSUER_BASE_URL=https://dev-7myakdl4itf644km.us.auth0.com
AUTH0_CLIENT_ID=CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL
AUTH0_CLIENT_SECRET=your-production-secret

# NextAuth Configuration
NEXTAUTH_SECRET=your-production-secret-min-32-chars
NEXTAUTH_URL=https://www.prepflow.org
NEXTAUTH_SESSION_MAX_AGE=14400

# Access Control
ALLOWED_EMAILS=email1@example.com,email2@example.com
# OR disable allowlist for testing:
DISABLE_ALLOWLIST=true
```

**⚠️ IMPORTANT:**

- `NEXTAUTH_URL` should be `https://www.prepflow.org` (with www) to match your primary domain
- Both www and non-www domains must be configured in Auth0 callback URLs
- Use strong secrets (minimum 32 characters)

### 3. Domain Configuration

**Vercel Domain Settings:**

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Ensure both `prepflow.org` and `www.prepflow.org` are configured
3. Set `www.prepflow.org` as the primary domain (redirects non-www to www)

**DNS Configuration:**

- `prepflow.org` → CNAME to Vercel
- `www.prepflow.org` → CNAME to Vercel

### 4. Common Production Errors

#### Error: `error=autho` or `error=Callback`

**Cause:** Callback URL not properly configured in Auth0

**Solution:**

1. Check Auth0 Dashboard → Applications → Settings → Allowed Callback URLs
2. Ensure both `https://prepflow.org/api/auth/callback/auth0` and `https://www.prepflow.org/api/auth/callback/auth0` are included
3. Save changes and wait 1-2 minutes for propagation
4. Clear browser cookies and try again

#### Error: `redirect_uri_mismatch`

**Cause:** Callback URL doesn't match exactly what's configured in Auth0

**Solution:**

1. Verify callback URL in Auth0 matches exactly: `https://www.prepflow.org/api/auth/callback/auth0`
2. Check for trailing slashes, protocol (https vs http), and www vs non-www
3. Ensure `NEXTAUTH_URL` environment variable matches your primary domain

#### Error: `AccessDenied`

**Cause:** User not in allowlist (if allowlist enabled)

**Solution:**

1. Check `ALLOWED_EMAILS` environment variable includes user's email
2. Or set `DISABLE_ALLOWLIST=true` to allow all authenticated users
3. Verify email matches exactly (case-sensitive)

### 5. Validate Configuration via API

**Three validation scripts are available:**

#### Script 1: Environment Variables Validation

```bash
# Validate environment variables format and values
node scripts/validate-auth0-env.js
```

**What it checks:**

- ✅ All required environment variables are present
- ✅ URL formats are correct (protocol, trailing slashes)
- ✅ Secret lengths meet requirements
- ✅ No placeholder values
- ✅ Callback URL consistency with NEXTAUTH_URL

**Example output:**

```
✅ All required environment variables are present
✅ AUTH0_ISSUER_BASE_URL uses HTTPS
✅ NEXTAUTH_URL has protocol
✅ NEXTAUTH_SECRET length OK (37 chars)
🎉 All Auth0 environment variables are valid!
```

#### Script 2: Auth0 Dashboard Configuration Validation

```bash
# Validate Auth0 dashboard settings via Management API
node scripts/check-auth0-config.js
```

**What it checks:**

- ✅ All required web origins are configured
- ✅ All required callback URLs are configured
- ✅ All required logout URLs are configured
- ✅ No placeholder URLs (e.g., `https://yourdomain.com`)
- ✅ No malformed URLs (invalid format, trailing slashes in web origins)
- ✅ URLs match expected values exactly

**Requirements:**

- `AUTH0_ISSUER_BASE_URL` - Your Auth0 domain
- `AUTH0_CLIENT_ID` - Your application's Client ID
- `AUTH0_CLIENT_SECRET` - Your application's Client Secret

**Optional (recommended for better security):**

- `AUTH0_M2M_CLIENT_ID` - Machine-to-Machine application Client ID
- `AUTH0_M2M_CLIENT_SECRET` - Machine-to-Machine application Client Secret

**Note:** This script requires Management API access with `read:clients` scope. If you get a 403 error, see the script output for setup instructions.

**Example output:**

```
✅ All 4 required web origins are configured correctly
✅ All 4 required callback URLs are configured correctly
✅ All 8 required logout URLs are configured correctly
🎉 All Auth0 configuration checks passed!
```

#### Script 3: Comprehensive Issues Checker

```bash
# Check for common Auth0 code and configuration issues
node scripts/check-auth0-issues.js
```

**What it checks:**

- ✅ Environment variable usage and validation
- ✅ Hardcoded URLs in code
- ✅ Callback URL construction
- ✅ Logout URL validation
- ✅ Error handling patterns
- ✅ Common configuration issues

**Example output:**

```
✅ All required environment variables are set
✅ No problematic hardcoded URLs found
✅ Logout returnTo URL is validated
🎉 No critical issues found!
```

#### Running All Validation Scripts

```bash
# Run all three validation scripts
node scripts/validate-auth0-env.js && \
node scripts/check-auth0-config.js && \
node scripts/check-auth0-issues.js

# Or use npm scripts
npm run auth0:validate
```

#### Management API Setup

To use `check-auth0-config.js`, you need Management API access. See `docs/AUTH0_MANAGEMENT_API_SETUP.md` for complete setup instructions.

**Quick Setup:**

1. Create M2M application in Auth0 Dashboard
2. Grant it `read:clients` scope for Auth0 Management API
3. Set `AUTH0_M2M_CLIENT_ID` and `AUTH0_M2M_CLIENT_SECRET` in `.env.local`
4. Run `npm run auth0:check-config`

### 6. Testing Production Setup

**Step 1: Verify Environment Variables**

```bash
# Option 1: Check Vercel environment variables are set
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables

# Option 2: Run validation scripts (recommended)
npm run auth0:validate-env    # Validates env var format and values
npm run auth0:check-issues     # Checks for code and config issues
npm run auth0:check-config     # Validates Auth0 dashboard settings (requires Management API)
```

**Step 2: Test Callback URL**

1. Navigate to `https://www.prepflow.org/api/auth/signin`
2. Click "Sign in with Auth0"
3. Complete authentication
4. Should redirect back to `/webapp` without errors

**Step 3: Test Logout**

1. After logging in, click logout
2. Should redirect to landing page
3. Should clear session (next login shows fresh login screen)

**Step 4: Test Both Domains**

1. Test `https://prepflow.org` (non-www)
2. Test `https://www.prepflow.org` (www)
3. Both should work identically

### 7. Troubleshooting Checklist

- [ ] Both `prepflow.org` and `www.prepflow.org` in Auth0 callback URLs
- [ ] Both domains in Auth0 logout URLs
- [ ] Both domains in Auth0 web origins
- [ ] `NEXTAUTH_URL` set to `https://www.prepflow.org`
- [ ] `AUTH0_ISSUER_BASE_URL` correct (no trailing slash)
- [ ] `AUTH0_CLIENT_ID` matches Auth0 dashboard
- [ ] `AUTH0_CLIENT_SECRET` matches Auth0 dashboard
- [ ] `NEXTAUTH_SECRET` is strong (32+ characters)
- [ ] Vercel environment variables are set for production
- [ ] DNS configured correctly (both domains point to Vercel)
- [ ] Vercel domain settings configured (both domains)

### 8. Quick Fix for `error=autho`

If you're seeing `error=autho` in production:

1. **Immediate Fix:**
   - Go to Auth0 Dashboard → Applications → Settings
   - Add `https://www.prepflow.org/api/auth/callback/auth0` to Allowed Callback URLs
   - Add `https://prepflow.org/api/auth/callback/auth0` to Allowed Callback URLs
   - Save changes
   - Wait 1-2 minutes
   - Clear browser cookies and try again

2. **Verify Environment Variables:**
   - Check `NEXTAUTH_URL` is set to `https://www.prepflow.org`
   - Verify all Auth0 env vars are correct

3. **Test:**
   - Navigate to `https://www.prepflow.org/api/auth/signin`
   - Try signing in
   - Should work without errors

## Additional Resources

- [Auth0 Application Settings](https://auth0.com/docs/get-started/applications/application-settings)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
