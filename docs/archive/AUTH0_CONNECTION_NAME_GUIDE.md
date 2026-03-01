# Auth0 Connection Name Guide

**Date:** 2025-12-13
**Issue:** Apple and Microsoft login flows return "connection not found" error

## Problem

When testing Apple and Microsoft login flows, we get:

```
error=invalid_request&error_description=the%20connection%20was%20not%20found
```

## Root Cause

The `connection` parameter in the login URL must match the **connection NAME** (not the strategy) exactly as configured in Auth0 Dashboard.

## Finding Connection Names

### Method 1: Auth0 Dashboard

1. Go to: https://manage.auth0.com
2. Navigate to: **Authentication** → **Social**
3. Find your Apple and Microsoft connections
4. **Click on each connection** to see its details
5. **Note the exact connection NAME** (shown at the top of the connection settings)

### Method 2: Test Endpoint (When Deployed)

Once `/api/test/list-all-connections` is deployed, you can check:

```bash
curl https://www.prepflow.org/api/test/list-all-connections | jq '.allConnections[] | {name, strategy, enabled}'
```

This will show all connections with their exact names.

## Connection Name Examples

Auth0 connections can have various names:

**Apple:**

- `apple`
- `apple-signin`
- `Sign in with Apple`
- `Apple ID`
- Custom names you set

**Microsoft:**

- `windowslive`
- `microsoft-account`
- `Microsoft Account`
- `Windows Live`
- Custom names you set

## Testing Login Flows

Once you know the exact connection names, test with:

```bash
# Apple (replace CONNECTION_NAME with actual name from Dashboard)
curl "https://www.prepflow.org/api/auth/login?connection=CONNECTION_NAME&returnTo=/webapp"

# Microsoft (replace CONNECTION_NAME with actual name from Dashboard)
curl "https://www.prepflow.org/api/auth/login?connection=CONNECTION_NAME&returnTo=/webapp"
```

## Common Issues

1. **Connection exists but not enabled for application**
   - Go to connection → **Applications** tab
   - Enable for your PrepFlow application
   - Click **Save**

2. **Connection name mismatch**
   - The `connection` parameter must match the connection NAME exactly
   - Connection names are case-sensitive
   - Check for spaces, hyphens, or special characters

3. **Connection not created**
   - If connection doesn't exist, create it in Auth0 Dashboard
   - Configure OAuth credentials (Client ID, Client Secret)
   - Enable for your application

## Next Steps

1. ✅ Check Auth0 Dashboard for exact connection names
2. ✅ Verify connections are enabled for PrepFlow application
3. ✅ Test login flows with correct connection names
4. ✅ Update code to use correct connection names
