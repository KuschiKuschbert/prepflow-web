# Auth0 CLI Setup Guide

**Purpose:** Complete guide for setting up Auth0 CLI tools for programmatic configuration management.

## Overview

This guide helps you set up Auth0 Management API access to manage your Auth0 configuration programmatically, eliminating the need for manual dashboard changes.

## Quick Start

### Step 1: Create M2M Application (Recommended)

1. **Go to Auth0 Dashboard:**
   - Visit: https://manage.auth0.com
   - Navigate to: **Applications** → **Applications**
   - Click **Create Application**

2. **Configure M2M Application:**
   - **Name:** `PrepFlow Management API`
   - **Type:** **Machine to Machine Applications**
   - Click **Create**

3. **Authorize Management API:**
   - In the **APIs** section, select **Auth0 Management API**
   - Toggle **Authorize** to ON
   - Under **Permissions**, select:
     - ✅ `read:clients` (read application settings)
     - ✅ `update:clients` (update application settings)
   - Click **Authorize**

4. **Get Credentials:**
   - Copy the **Client ID**
   - Copy the **Client Secret**

5. **Add to `.env.local`:**
   ```bash
   # M2M Credentials (for Management API access)
   AUTH0_M2M_CLIENT_ID=your-m2m-client-id-here
   AUTH0_M2M_CLIENT_SECRET=your-m2m-client-secret-here
   ```

### Step 2: Test Configuration

```bash
# Check current configuration
npm run auth0:check-config

# Update configuration programmatically
npm run auth0:update-config
```

## Available Scripts

### `npm run auth0:check-config`

**Purpose:** Validate current Auth0 configuration

**What it does:**

- Fetches current application settings via Management API
- Validates web origins, callback URLs, logout URLs
- Reports missing or incorrect URLs
- Shows detailed validation report

**Requirements:**

- `read:clients` scope

**Example output:**

```
✅ All 4 required web origins are configured correctly
✅ All 4 required callback URLs are configured correctly
✅ All 8 required logout URLs are configured correctly
🎉 All Auth0 configuration checks passed!
```

### `npm run auth0:update-config`

**Purpose:** Update Auth0 configuration programmatically

**What it does:**

- Fetches current application settings
- Compares with expected configuration
- Updates web origins, callback URLs, logout URLs
- Sets Application Login URI
- Removes placeholder URLs automatically
- Shows before/after comparison

**Requirements:**

- `read:clients` scope
- `update:clients` scope

**Example output:**

```
🔧 Updating Auth0 Application Configuration...
✅ Successfully authenticated
✅ Retrieved settings for: Prepflow
📊 Configuration Summary:
   🌐 Web Origins: 4 URLs
   🔗 Callback URLs: 4 URLs
   🚪 Logout URLs: 8 URLs
💾 Updating Auth0 application settings...
✅ Successfully updated Auth0 application settings!
```

### `npm run auth0:show-urls`

**Purpose:** Display current Auth0 configuration

**What it does:**

- Fetches and displays all configured URLs
- Shows web origins, callback URLs, logout URLs
- Useful for debugging configuration issues

**Requirements:**

- `read:clients` scope

### `npm run auth0:validate-env`

**Purpose:** Validate Auth0 environment variables

**What it does:**

- Checks for required environment variables
- Validates format and length
- Detects placeholder values
- Does NOT require Management API access

### `npm run auth0:check-issues`

**Purpose:** Check for common Auth0 integration issues

**What it does:**

- Performs static code analysis
- Checks for hardcoded URLs
- Validates callback/logout URL construction
- Checks error handling patterns

### `npm run auth0:validate`

**Purpose:** Run all validation checks

**What it does:**

- Runs `auth0:validate-env`
- Runs `auth0:check-config`
- Runs `auth0:check-issues`
- Comprehensive validation report

## Configuration Management Workflow

### Initial Setup

1. **Create M2M Application** (see Step 1 above)
2. **Grant scopes:** `read:clients`, `update:clients`
3. **Add credentials to `.env.local`**
4. **Test:** `npm run auth0:check-config`

### Updating Configuration

1. **Check current state:**

   ```bash
   npm run auth0:check-config
   ```

2. **Update configuration:**

   ```bash
   npm run auth0:update-config
   ```

3. **Verify changes:**

   ```bash
   npm run auth0:check-config
   ```

4. **Wait 1-2 minutes** for Auth0 to propagate changes

5. **Test sign-in:**
   - Production: https://www.prepflow.org
   - Localhost: http://localhost:3000

## Fixing Production Login Issues

### Step 1: Update Configuration Programmatically

```bash
npm run auth0:update-config
```

This will:

- ✅ Set all required web origins
- ✅ Set all required callback URLs
- ✅ Set all required logout URLs
- ✅ Set Application Login URI
- ✅ Remove placeholder URLs

### Step 2: Verify Configuration

```bash
npm run auth0:check-config
```

Should show all checks passing.

### Step 3: Verify Vercel Environment Variables

**Critical:** Ensure `NEXTAUTH_URL` is set correctly in Vercel:

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify **Production** has:
   ```bash
   NEXTAUTH_URL=https://www.prepflow.org
   ```
3. **Redeploy** if you changed any variables

### Step 4: Test Sign-In

1. Clear browser cookies for both domains
2. Go to: https://www.prepflow.org
3. Try signing in
4. Should work without `error=auth0`

## Troubleshooting

### Error: "Insufficient scope"

**When running `update-auth0-config.js`:**

```
❌ Update Failed: Insufficient Permissions
The credentials used do not have the "update:clients" scope.
```

**Solution:**

1. Go to Auth0 Dashboard → APIs → Auth0 Management API
2. Find your M2M application
3. Grant `update:clients` scope
4. Wait 1-2 minutes
5. Run script again

### Error: "No valid credentials found"

**Solution:**

1. Check `.env.local` has M2M credentials:
   ```bash
   AUTH0_M2M_CLIENT_ID=...
   AUTH0_M2M_CLIENT_SECRET=...
   ```
2. Verify credentials are correct (no typos)
3. Ensure M2M application exists in Auth0 Dashboard

### Error: "HTTP 403: Forbidden"

**Solution:**

1. Verify M2M application is authorized for Management API
2. Verify `read:clients` and `update:clients` scopes are granted
3. Wait 1-2 minutes after granting scopes (propagation delay)

## Benefits of CLI Management

✅ **Speed:** Update configuration in seconds
✅ **Consistency:** Same configuration across environments
✅ **Automation:** Can be integrated into CI/CD
✅ **Version Control:** Configuration changes tracked in git
✅ **Error Prevention:** Removes placeholder URLs automatically
✅ **Reproducibility:** Easy to replicate on new tenants

## Next Steps

After setting up CLI access:

1. **Update production configuration:**

   ```bash
   npm run auth0:update-config
   ```

2. **Verify everything is correct:**

   ```bash
   npm run auth0:validate
   ```

3. **Test sign-in in production:**
   - Go to: https://www.prepflow.org
   - Try signing in
   - Should work without errors

## Related Documentation

- **Management API Setup:** `docs/AUTH0_MANAGEMENT_API_SETUP.md`
- **Production Setup:** `docs/AUTH0_PRODUCTION_SETUP.md`
- **Troubleshooting:** `docs/AUTH0_TROUBLESHOOTING.md`
- **Quick Setup:** `docs/AUTH0_QUICK_SETUP.md`
