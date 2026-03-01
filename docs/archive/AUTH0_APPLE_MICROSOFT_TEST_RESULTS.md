# Auth0 Apple and Microsoft Login Test Results

**Date:** 2025-12-13
**Test Environment:** Production (www.prepflow.org)
**Status:** ⚠️ **Connections Not Configured**

## Test Summary

### Apple Connection Test

**Test:** Navigate to `/api/auth/login?connection=apple&returnTo=/webapp`

**Result:** ⚠️ **CONNECTION NOT FOUND**

- Apple connection not found in Auth0 Dashboard
- Connection needs to be created and configured

**Status:** ⚠️ **NOT CONFIGURED** - Connection does not exist

### Microsoft Connection Test

**Test:** Navigate to `/api/auth/login?connection=windowslive&returnTo=/webapp`

**Result:** ⚠️ **CONNECTION NOT FOUND**

- Microsoft connection not found in Auth0 Dashboard
- Connection needs to be created and configured

**Status:** ⚠️ **NOT CONFIGURED** - Connection does not exist

## Connection Status Check

**Endpoint:** `GET /api/test/apple-microsoft-connections`

**Results:**

- Apple: Not found (connection does not exist)
- Microsoft: Not found (connection does not exist)

## Setup Requirements

### Apple Connection Setup

**Steps to Enable Apple Login:**

1. **Go to Auth0 Dashboard:**
   - Navigate to: https://manage.auth0.com
   - Go to: **Authentication** → **Social** → **Apple**

2. **Create Apple Connection:**
   - Click **Create Connection**
   - Select **Apple**
   - Configure Apple OAuth credentials:
     - **Client ID** (from Apple Developer)
     - **Client Secret** (from Apple Developer)
     - **Key ID** (from Apple Developer)
     - **Team ID** (from Apple Developer)
     - **Private Key** (from Apple Developer)

3. **Enable for PrepFlow Application:**
   - Scroll down to **Applications** tab
   - Find your PrepFlow application
   - Toggle it **ON** to enable Apple login for this app
   - Click **Save**

4. **Test Connection:**
   - Run: `GET /api/test/apple-microsoft-connections` to verify status
   - Navigate to: `/api/auth/login?connection=apple&returnTo=/webapp`

### Microsoft Connection Setup

**Steps to Enable Microsoft Login:**

1. **Go to Auth0 Dashboard:**
   - Navigate to: https://manage.auth0.com
   - Go to: **Authentication** → **Social** → **Microsoft**

2. **Create Microsoft Connection:**
   - Click **Create Connection**
   - Select **Microsoft Account** (or **Windows Live**)
   - Configure Microsoft OAuth credentials:
     - **Client ID** (from Azure Portal)
     - **Client Secret** (from Azure Portal)

3. **Enable for PrepFlow Application:**
   - Scroll down to **Applications** tab
   - Find your PrepFlow application
   - Toggle it **ON** to enable Microsoft login for this app
   - Click **Save**

4. **Test Connection:**
   - Run: `GET /api/test/apple-microsoft-connections` to verify status
   - Navigate to: `/api/auth/login?connection=windowslive&returnTo=/webapp`

## Implementation Details

### Code Changes

1. **`lib/auth0-apple-microsoft-connection.ts`** (new file)
   - `verifyAppleConnection()` - Check if Apple connection is enabled
   - `verifyMicrosoftConnection()` - Check if Microsoft connection is enabled
   - `enableAppleConnectionForApp()` - Enable Apple connection for application
   - `enableMicrosoftConnectionForApp()` - Enable Microsoft connection for application

2. **`app/api/test/apple-microsoft-connections/route.ts`** (new file)
   - `GET` - Check connection status
   - `POST` - Enable connections (with optional body: `{ enableApple?: boolean, enableMicrosoft?: boolean }`)

3. **`lib/auth0-management.ts`** (updated)
   - Updated `getSocialConnections()` filter to include `windowslive` and `waad` strategies

## Testing URLs

**Apple Login:**

```
https://www.prepflow.org/api/auth/login?connection=apple&returnTo=/webapp
```

**Microsoft Login:**

```
https://www.prepflow.org/api/auth/login?connection=windowslive&returnTo=/webapp
```

**Connection Status Check:**

```
https://www.prepflow.org/api/test/apple-microsoft-connections
```

## Next Steps

1. **Create Apple Connection** in Auth0 Dashboard
   - Requires Apple Developer account
   - Configure OAuth credentials
   - Enable for PrepFlow application

2. **Create Microsoft Connection** in Auth0 Dashboard
   - Requires Azure Portal account
   - Configure OAuth credentials
   - Enable for PrepFlow application

3. **Test Login Flows**
   - Test Apple login after connection is created
   - Test Microsoft login after connection is created
   - Verify callback URLs work correctly

4. **Document Results**
   - Update test results after connections are configured
   - Document any issues or errors encountered

## Current Status

| Connection | Status            | Notes                                             |
| ---------- | ----------------- | ------------------------------------------------- |
| Apple      | ⚠️ NOT CONFIGURED | Connection does not exist - needs to be created   |
| Microsoft  | ⚠️ NOT CONFIGURED | Connection does not exist - needs to be created   |
| Google     | ⚠️ NOT ENABLED    | Connection exists but not enabled for application |

## Conclusion

Apple and Microsoft connections are **not configured** in Auth0 Dashboard. Both connections need to be created and configured before testing can proceed. The testing utilities are in place and ready to use once the connections are created.
