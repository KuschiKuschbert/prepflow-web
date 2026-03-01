# Quick Fix: Production Login Issues

**Time Required:** 5-10 minutes
**Difficulty:** Easy

## Step 1: Grant Your Existing App Management API Access (2 minutes)

This is the fastest way to enable the auto-fix endpoint.

1. **Go to Auth0 Dashboard:**
   - Visit: https://manage.auth0.com
   - Navigate to: **APIs** → **Auth0 Management API**

2. **Authorize Your Application:**
   - Click the **Machine to Machine Applications** tab
   - Find your application: `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL` (Prepflow)
   - If it's not listed:
     - Click **+ Authorize**
     - Select your application
   - Toggle **Authorize** to ON

3. **Grant Required Scopes:**
   - Under **Permissions**, find and check:
     - ✅ `read:clients` (to read application settings)
     - ✅ `update:clients` (to update application settings)
   - Click **Update**

4. **Wait 1-2 minutes** for changes to propagate

## Step 2: Run Auto-Fix Endpoint (30 seconds)

After granting permissions, run:

```bash
curl -X POST https://www.prepflow.org/api/fix/auth0-callback-urls | jq '.'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Auth0 configuration updated successfully",
  "changes": {
    "logoutUrls": {
      "added": [
        "https://www.prepflow.org",
        "https://www.prepflow.org/",
        "https://prepflow.org",
        "https://prepflow.org/"
      ]
    }
  }
}
```

## Step 3: Verify Fix (30 seconds)

```bash
# Check if logout URLs are now configured
curl -s https://www.prepflow.org/api/test/auth0-comprehensive | jq '.tests[] | select(.name | contains("Logout"))'

# Test authorization flow
curl -s "https://www.prepflow.org/api/test/auth0-flow?callbackUrl=/webapp" | jq '.success'
```

**Expected:** Logout test should show `status: "pass"` and authorization flow should show `success: true`

## Step 4: Test Login in Browser (2 minutes)

1. **Clear browser data:**
   - Clear cookies for `prepflow.org` and `www.prepflow.org`
   - Clear cache (hard refresh: Cmd+Shift+R)

2. **Navigate to:**

   ```
   https://www.prepflow.org/webapp
   ```

3. **Expected:**
   - Should redirect to Auth0 login
   - After login, should redirect back to `/webapp`
   - Should NOT have `error=auth0` in URL

## If Authorization Flow Still Fails

If Step 3 shows `success: false`, check:

1. **Verify NEXTAUTH_URL in Vercel:**
   - Go to: Vercel Dashboard → Project → Settings → Environment Variables
   - Verify `NEXTAUTH_URL` is: `https://www.prepflow.org` (no trailing slash)
   - Ensure it's set for **Production** environment
   - Redeploy if changed

2. **Check Vercel Logs:**
   - Go to: Vercel Dashboard → Deployments → Latest → Logs
   - Look for `[Auth0 Config]` entries
   - Check for any errors

3. **Re-test:**
   ```bash
   curl -s "https://www.prepflow.org/api/test/auth0-flow?callbackUrl=/webapp" | jq '.success'
   ```

## Alternative: Manual Configuration

If you prefer not to grant Management API access:

1. Go to: https://manage.auth0.com → Applications → Prepflow → Settings
2. Add to "Allowed Logout URLs":
   ```
   https://www.prepflow.org
   https://www.prepflow.org/
   https://prepflow.org
   https://prepflow.org/
   ```
3. Save changes

## Troubleshooting

### "Insufficient scope" Error

**Cause:** Application doesn't have `update:clients` scope

**Fix:** Follow Step 1 above to grant the scope

### Auto-Fix Still Fails

**Check:**

1. Application is authorized for Auth0 Management API
2. `update:clients` scope is enabled
3. Waited 1-2 minutes after granting permissions
4. Application was redeployed (if environment variables changed)

## Related Documentation

- `docs/PRODUCTION_LOGIN_FIX_GUIDE.md` - Detailed fix guide
- `docs/AUTH0_MANAGEMENT_API_SETUP.md` - Management API setup
- `docs/PRODUCTION_LOGIN_DIAGNOSTIC_RESULTS.md` - Diagnostic results
