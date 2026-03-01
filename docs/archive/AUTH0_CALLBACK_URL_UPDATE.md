# Auth0 Callback URL Update - Manual Steps

**Date:** 2025-12-13
**Issue:** Callback URL mismatch - Auth0 receiving preview URL instead of production URL

## Current Error

```
unauthorized_client: Callback URL mismatch.
http://prepflow-web-n2tnkbc1y-derkusch-gmailcom-projects.vercel.app/api/auth/callback
is not in the list of allowed callback URLs
```

## Root Cause

The `AUTH0_BASE_URL` environment variable was set in Vercel, but the deployment hasn't picked it up yet, or `getBaseUrl()` is still prioritizing `VERCEL_URL` over `AUTH0_BASE_URL`.

## Immediate Fix: Add Callback URLs to Auth0 Dashboard

**Go to:** https://manage.auth0.com → Applications → Prepflow → Settings

### Add to "Allowed Callback URLs":

```
https://www.prepflow.org/api/auth/callback
https://prepflow.org/api/auth/callback
http://localhost:3000/api/auth/callback
http://localhost:3001/api/auth/callback
```

**Note:** The old NextAuth URLs (`/api/auth/callback/auth0`) can remain, but the new Auth0 SDK URLs (`/api/auth/callback`) must be added.

### Verify "Allowed Logout URLs" includes:

```
https://www.prepflow.org
https://www.prepflow.org/
https://prepflow.org
https://prepflow.org/
http://localhost:3000
http://localhost:3000/
http://localhost:3001
http://localhost:3001/
```

### Verify "Allowed Web Origins" includes:

```
https://www.prepflow.org
https://prepflow.org
http://localhost:3000
http://localhost:3001
```

## After Adding URLs

1. Click "Save Changes" in Auth0 Dashboard
2. Test login flow again
3. Verify `AUTH0_BASE_URL` is set correctly in Vercel Production environment

## Long-term Fix

Once `AUTH0_BASE_URL` is properly deployed and working, the preview URLs won't be used, and only the production URLs will be needed.
