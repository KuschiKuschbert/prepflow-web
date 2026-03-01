# Auth0 Configuration Troubleshooting

## Issue: URLs Still Showing as Missing After Adding

If you've added the URLs but validation still shows them as missing, try these steps:

### Step 1: Verify You're Editing the Correct Application

1. Go to: https://manage.auth0.com → **Applications** → **Applications**
2. Find your application with Client ID: `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL`
3. Click on it to open Settings
4. **Verify** you're editing the correct application

### Step 2: Check URL Formatting

**Common Mistakes:**

❌ **Wrong - Trailing slashes on web origins:**

```
https://prepflow.org/
https://www.prepflow.org/
```

✅ **Correct - No trailing slashes on web origins:**

```
https://prepflow.org
https://www.prepflow.org
```

❌ **Wrong - Missing protocol:**

```
prepflow.org
www.prepflow.org
```

✅ **Correct - Full URL with protocol:**

```
https://prepflow.org
https://www.prepflow.org
```

❌ **Wrong - Wrong path for callback:**

```
https://prepflow.org/callback/auth0
```

✅ **Correct - Exact callback path:**

```
https://prepflow.org/api/auth/callback/auth0
```

### Step 3: Verify URLs Are Saved

1. After adding URLs, scroll to bottom of Settings page
2. Click **Save Changes** button
3. Wait for confirmation message
4. **Important:** Don't navigate away before saving!

### Step 4: Wait for Propagation

Auth0 changes can take **1-3 minutes** to propagate:

1. After saving, wait 2-3 minutes
2. Run validation again: `npm run auth0:check-config`
3. If still showing as missing, continue to Step 5

### Step 5: Check Current Configuration

The validation script shows what URLs are currently configured. Compare:

**What You Added:**

- Check the exact URLs you entered

**What Script Expects:**

- Web Origins (4 URLs):
  - `https://prepflow.org`
  - `https://www.prepflow.org`
  - `http://localhost:3000`
  - `http://localhost:3001`

- Callback URLs (4 URLs):
  - `https://prepflow.org/api/auth/callback/auth0`
  - `https://www.prepflow.org/api/auth/callback/auth0`
  - `http://localhost:3000/api/auth/callback/auth0`
  - `http://localhost:3001/api/auth/callback/auth0`

### Step 6: Manual Verification

1. Go to Auth0 Dashboard → Applications → Prepflow → Settings
2. Scroll to **Allowed Web Origins**
3. **Copy** all URLs listed there
4. Compare with expected URLs above
5. Do the same for **Allowed Callback URLs**

### Step 7: Check for Placeholder URLs

If you see URLs like:

- `https://yourdomain.com`
- `https://example.com`
- `https://{tenant}.auth0.com`

**Remove them** - these are placeholders and will cause validation errors.

### Step 8: Verify Application Type

1. Go to Auth0 Dashboard → Applications → Prepflow → Settings
2. Check **Application Type**
3. Should be: **Regular Web Application** (not Single Page Application or Native)
4. If wrong type, you may need to recreate the application

### Step 9: Clear Browser Cache

Sometimes browser cache can show old values:

1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Or open Auth0 Dashboard in incognito/private window
3. Check URLs again

### Step 10: Check Multiple Applications

If you have multiple Auth0 applications:

1. List all applications in Auth0 Dashboard
2. Check each one's Client ID
3. Verify you're editing the one with ID: `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL`

## Still Not Working?

If URLs are still showing as missing after all steps:

1. **Double-check exact URLs** - Must match exactly (case-sensitive, no extra spaces)
2. **Try removing and re-adding** - Sometimes Auth0 UI has issues
3. **Check Auth0 status page** - https://status.auth0.com (for service issues)
4. **Wait 5 minutes** - Sometimes propagation takes longer
5. **Contact Auth0 support** - If issue persists

## Quick Test

After adding URLs, test authentication:

1. **Production:** Go to https://prepflow.org and try to sign in
2. **Localhost:** Go to http://localhost:3000 and try to sign in

If authentication works, the URLs are configured correctly (even if validation script shows them as missing - this could be a script issue).

## Validation Script Debugging

To see what the script is actually fetching:

```bash
# The script shows "Configured: X | Expected: Y"
# If Configured is 0, it means no URLs are being returned by Auth0 API
# This could mean:
# 1. URLs weren't saved
# 2. Wrong application is being checked
# 3. Auth0 API hasn't updated yet
```

## Expected Final Result

After fixing, validation should show:

```
✅ All 4 required web origins are configured correctly
✅ All 4 required callback URLs are configured correctly
✅ All 8 required logout URLs are configured correctly
🎉 All Auth0 application settings are configured correctly!
```
