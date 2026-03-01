# Auth0 API Testing & Fix Guide

## Overview

This guide documents the comprehensive API endpoints created to test and fix Auth0 configuration issues, specifically the `error=auth0` problem.

## API Endpoints Created

### 1. Comprehensive Test Endpoint

**Endpoint:** `GET /api/test/auth0-comprehensive`

**Purpose:** Tests all aspects of Auth0 configuration and NextAuth integration.

**What It Tests:**

- ✅ Environment variables (NEXTAUTH_URL, Auth0 credentials, secrets)
- ✅ Callback URL construction
- ✅ Provider configuration
- ✅ Auth0 Management API connection
- ✅ Callback URLs in Auth0 dashboard
- ✅ Logout URLs in Auth0 dashboard
- ✅ Web Origins in Auth0 dashboard
- ✅ Request origin validation
- ✅ URL consistency checks

**Usage:**

```bash
curl https://www.prepflow.org/api/test/auth0-comprehensive
```

**Response Format:**

```json
{
  "timestamp": "2025-12-10T14:38:14.000Z",
  "environment": "production",
  "tests": [
    {
      "name": "NEXTAUTH_URL",
      "status": "pass",
      "message": "Set to: https://www.prepflow.org",
      "details": { "url": "https://www.prepflow.org" }
    }
    // ... more tests
  ],
  "summary": {
    "total": 15,
    "passed": 12,
    "failed": 0,
    "warnings": 3
  }
}
```

### 2. Auth0 Flow Test Endpoint

**Endpoint:** `GET /api/test/auth0-flow?callbackUrl=/webapp`

**Purpose:** Tests the actual NextAuth authorization flow to see if it redirects to Auth0 correctly.

**What It Tests:**

- ✅ Signin endpoint response
- ✅ Redirect behavior
- ✅ Error detection (`error=auth0`)
- ✅ Auth0 redirect validation

**Usage:**

```bash
curl "https://www.prepflow.org/api/test/auth0-flow?callbackUrl=/webapp"
```

**Response Format:**

```json
{
  "success": true,
  "test": {
    "signinUrl": "https://www.prepflow.org/api/auth/signin/auth0?callbackUrl=/webapp",
    "status": 302,
    "location": "https://dev-xxx.us.auth0.com/authorize?...",
    "hasError": false,
    "redirectsToAuth0": true,
    "expectedBehavior": {
      "shouldRedirectToAuth0": true,
      "shouldNotHaveError": true
    },
    "actualBehavior": {
      "redirectsToAuth0": true,
      "hasError": false
    },
    "diagnosis": "NextAuth is correctly redirecting to Auth0"
  }
}
```

### 3. Fix Auth0 Callback URLs Endpoint

**Endpoint:** `POST /api/fix/auth0-callback-urls`

**Purpose:** Automatically fixes Auth0 configuration by adding missing callback URLs, logout URLs, and web origins via Auth0 Management API.

**What It Does:**

- ✅ Connects to Auth0 Management API
- ✅ Retrieves current application configuration
- ✅ Adds missing callback URLs (www and non-www)
- ✅ Adds missing logout URLs
- ✅ Adds missing web origins
- ✅ Updates Auth0 application configuration

**Usage:**

```bash
curl -X POST https://www.prepflow.org/api/fix/auth0-callback-urls
```

**Response Format:**

```json
{
  "success": true,
  "message": "Auth0 configuration updated successfully",
  "changes": {
    "callbacks": {
      "before": ["https://www.prepflow.org/api/auth/callback/auth0"],
      "after": [
        "https://www.prepflow.org/api/auth/callback/auth0",
        "https://prepflow.org/api/auth/callback/auth0"
      ],
      "added": ["https://prepflow.org/api/auth/callback/auth0"]
    },
    "logoutUrls": {
      "before": ["https://www.prepflow.org"],
      "after": [
        "https://www.prepflow.org",
        "https://www.prepflow.org/",
        "https://prepflow.org",
        "https://prepflow.org/"
      ],
      "added": ["https://www.prepflow.org/", "https://prepflow.org", "https://prepflow.org/"]
    },
    "webOrigins": {
      "before": ["https://www.prepflow.org"],
      "after": ["https://www.prepflow.org", "https://prepflow.org"],
      "added": ["https://prepflow.org"]
    }
  }
}
```

## Code Changes Made

### 1. NextAuth Configuration Fix

**File:** `lib/auth-options.ts`

**Change:** Added explicit `url` option to `authOptions` to force NextAuth to use `NEXTAUTH_URL` for all URL construction.

```typescript
export const authOptions: NextAuthOptions = {
  // CRITICAL: Set url explicitly to force NextAuth to use NEXTAUTH_URL for all URL construction
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
  // ... rest of config
};
```

**Why:** NextAuth v4 validates callback URLs against the base URL. By explicitly setting `url`, we ensure NextAuth uses `NEXTAUTH_URL` instead of the request origin.

### 2. Comprehensive Test Endpoint

**File:** `app/api/test/auth0-comprehensive/route.ts`

**Features:**

- Tests all environment variables
- Verifies Auth0 Management API connection
- Checks Auth0 dashboard configuration
- Validates URL consistency

### 3. Flow Test Endpoint

**File:** `app/api/test/auth0-flow/route.ts`

**Features:**

- Tests actual NextAuth signin flow
- Detects `error=auth0` issues
- Validates redirect behavior

### 4. Auto-Fix Endpoint

**File:** `app/api/fix/auth0-callback-urls/route.ts`

**Features:**

- Uses Auth0 Management API to update configuration
- Automatically adds missing URLs
- Preserves existing configuration

## Testing Workflow

### Step 1: Run Comprehensive Test

```bash
curl https://www.prepflow.org/api/test/auth0-comprehensive | jq
```

**Check:**

- All tests should pass or have warnings (not failures)
- Verify callback URLs are configured in Auth0
- Check URL consistency

### Step 2: Test Authorization Flow

```bash
curl "https://www.prepflow.org/api/test/auth0-flow?callbackUrl=/webapp" | jq
```

**Check:**

- `success` should be `true`
- `hasError` should be `false`
- `redirectsToAuth0` should be `true`

### Step 3: Fix Configuration (if needed)

If tests show missing URLs in Auth0:

```bash
curl -X POST https://www.prepflow.org/api/fix/auth0-callback-urls | jq
```

**Check:**

- `success` should be `true`
- Review `changes` to see what was added

### Step 4: Re-test After Fix

```bash
# Re-run comprehensive test
curl https://www.prepflow.org/api/test/auth0-comprehensive | jq

# Re-test flow
curl "https://www.prepflow.org/api/test/auth0-flow?callbackUrl=/webapp" | jq
```

## Expected Results

### After Fix Applied

1. **Comprehensive Test:**
   - ✅ All environment variables pass
   - ✅ Auth0 Management API connects successfully
   - ✅ Callback URLs found in Auth0
   - ✅ Logout URLs found in Auth0
   - ✅ Web Origins found in Auth0

2. **Flow Test:**
   - ✅ `success: true`
   - ✅ `hasError: false`
   - ✅ `redirectsToAuth0: true`
   - ✅ Location header points to Auth0 authorization URL

3. **Manual Browser Test:**
   - ✅ Navigate to `https://www.prepflow.org/api/auth/signin`
   - ✅ Click "Sign in with Auth0"
   - ✅ Should redirect to Auth0 login page
   - ✅ After login, should redirect back to `/webapp` without `error=auth0`

## Troubleshooting

### If Comprehensive Test Fails

1. **Check Environment Variables:**
   - Verify `NEXTAUTH_URL` is set correctly
   - Verify Auth0 credentials are set
   - Check Vercel environment variables

2. **Check Auth0 Management API:**
   - Verify `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` are correct
   - Check if Management API access is enabled in Auth0

### If Flow Test Shows `error=auth0`

1. **Run Fix Endpoint:**

   ```bash
   curl -X POST https://www.prepflow.org/api/fix/auth0-callback-urls
   ```

2. **Verify Callback URLs:**
   - Check Auth0 Dashboard → Applications → Prepflow → Settings
   - Ensure callback URLs match exactly

3. **Check NextAuth Configuration:**
   - Verify `url` option is set in `authOptions`
   - Check Vercel logs for `[Auth0 Config]` entries

### If Fix Endpoint Fails

1. **Check Auth0 Credentials:**
   - Verify `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` are correct
   - Ensure Management API access is enabled

2. **Check Permissions:**
   - Verify the Auth0 application has Management API permissions
   - Check if the client secret is valid

## Next Steps

After running tests and fixes:

1. **Deploy Changes:**
   - The `url` option fix is already deployed
   - Test endpoints are available for ongoing monitoring

2. **Monitor:**
   - Run comprehensive test weekly
   - Check Vercel logs for `[Auth0 Config]` entries
   - Monitor login success rate

3. **Maintain:**
   - Keep Auth0 callback URLs updated
   - Ensure `NEXTAUTH_URL` matches production domain
   - Update test endpoints as needed

## Related Documentation

- `docs/AUTH0_ERROR_AUTH0_DIAGNOSIS.md` - Detailed diagnosis of `error=auth0` issue
- `docs/AUTH0_CALLBACK_URL_FIX.md` - Callback URL fix documentation
- `docs/AUTH0_STRIPE_REFERENCE.md` - Complete Auth0 setup guide
