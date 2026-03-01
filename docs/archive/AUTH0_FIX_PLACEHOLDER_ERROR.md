# Fix Auth0 Placeholder URL Error (`web_origins[4]`)

## Problem

Auth0 dashboard shows error:

```
Payload validation error: 'Object didn't pass validation for format url-with-placeholders: '
on property web_origins[4].
```

This prevents saving the configuration, even though the API shows only 4 valid URLs.

## Root Cause

There's a **hidden 5th entry** (`web_origins[4]`) in the Auth0 dashboard that contains a placeholder URL like:

- `https://yourdomain.com`
- `https://example.com`
- `https://{tenant}.auth0.com`
- Or an empty/invalid URL

This entry might not be visible in the UI but is preventing the save operation.

## Solution: Manual Fix in Auth0 Dashboard

### Step 1: Open Auth0 Dashboard

1. Go to: https://manage.auth0.com
2. Navigate to: **Applications** → **Applications** → **Prepflow**
3. Click on **Settings** tab

### Step 2: Check All Web Origins

1. Scroll to **Application URIs** section
2. Find **Allowed Web Origins** text area
3. **Click inside the text area** and check for:
   - Empty lines
   - Placeholder URLs
   - Invalid URLs
   - Extra whitespace

### Step 3: Remove Placeholder URLs

**Current valid URLs (keep these):**

```
https://prepflow.org
https://www.prepflow.org
http://localhost:3000
http://localhost:3001
```

**Remove any of these (placeholders):**

- `https://yourdomain.com`
- `https://example.com`
- `https://{tenant}.auth0.com`
- Empty lines
- Any URL with "placeholder" or "yourdomain" in it

### Step 4: Clean Up the Text Area

1. **Select all** text in the "Allowed Web Origins" field (`Cmd+A` or `Ctrl+A`)
2. **Delete** everything
3. **Paste** only these 4 URLs (one per line, no empty lines):
   ```
   https://prepflow.org
   https://www.prepflow.org
   http://localhost:3000
   http://localhost:3001
   ```

### Step 5: Verify Other Fields

**Allowed Callback URLs** (should have exactly 4):

```
https://prepflow.org/api/auth/callback/auth0
https://www.prepflow.org/api/auth/callback/auth0
http://localhost:3000/api/auth/callback/auth0
http://localhost:3001/api/auth/callback/auth0
```

**Allowed Logout URLs** (should have exactly 8):

```
http://localhost:3000
http://localhost:3000/
http://localhost:3001
http://localhost:3001/
https://prepflow.org
https://prepflow.org/
https://www.prepflow.org
https://www.prepflow.org/
```

### Step 6: Save Changes

1. Scroll to bottom of page
2. Click **Save Changes** button
3. Wait for confirmation message
4. **If error persists**, try:
   - Refresh the page (`Cmd+R` or `Ctrl+R`)
   - Clear browser cache
   - Try in incognito/private window

### Step 7: Verify Fix

After saving, run:

```bash
npm run auth0:check-config
```

Should show:

```
✅ All 4 required web origins are configured correctly
✅ All 4 required callback URLs are configured correctly
✅ All 8 required logout URLs are configured correctly
🎉 All Auth0 configuration checks passed!
```

## Alternative: Use Auth0 Management API (Requires M2M Setup)

If you have M2M credentials with `update:clients` scope:

1. **Set up M2M application** (see `docs/AUTH0_MANAGEMENT_API_SETUP.md`)
2. **Grant `update:clients` scope** to M2M application
3. **Run fix script:**
   ```bash
   node scripts/fix-auth0-placeholder.js
   ```

## Why This Happens

Auth0 dashboard sometimes:

- Adds placeholder URLs during initial setup
- Doesn't show all entries in the UI
- Has UI bugs that hide invalid entries
- Requires manual cleanup of hidden entries

## Prevention

After fixing:

1. **Always verify** URLs before saving
2. **Remove empty lines** from text areas
3. **Don't copy-paste** placeholder examples
4. **Use validation script** to check: `npm run auth0:check-config`

## Still Not Working?

If the error persists after manual cleanup:

1. **Try removing all URLs**, save, then add them back one by one
2. **Check browser console** for JavaScript errors
3. **Try different browser** (Chrome, Firefox, Safari)
4. **Contact Auth0 support** with:
   - Client ID: `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL`
   - Error message: `web_origins[4]` placeholder validation error
   - Screenshot of the error
