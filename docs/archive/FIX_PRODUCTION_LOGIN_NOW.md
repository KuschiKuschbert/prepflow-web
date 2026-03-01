# Fix Production Login - Step by Step

**Time Required:** 5 minutes
**Status:** Ready to Execute

## Quick Summary

Two issues found:

1. ✅ **Logout URLs missing** - Can be fixed automatically after granting permissions
2. ⚠️ **Authorization flow failing** - Requires NEXTAUTH_URL verification

## Step 1: Grant Management API Access (2 minutes)

**This enables the auto-fix endpoint to work.**

1. **Open Auth0 Dashboard:**
   - Go to: https://manage.auth0.com
   - Navigate to: **APIs** → **Auth0 Management API**

2. **Authorize Your Application:**
   - Click **Machine to Machine Applications** tab
   - Find: `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL` (Prepflow)
   - If not listed:
     - Click **+ Authorize**
     - Select "Prepflow"
   - Toggle **Authorize** to **ON**

3. **Grant Permissions:**
   - Scroll to **Permissions** section
   - Check these boxes:
     - ✅ `read:clients`
     - ✅ `update:clients`
   - Click **Update**

4. **Wait 1-2 minutes** for changes to propagate

## Step 2: Run Auto-Fix (30 seconds)

After granting permissions, run this command:

```bash
curl -X POST https://www.prepflow.org/api/fix/auth0-callback-urls | jq '.'
```

**Expected:** Should return `"success": true` and show logout URLs were added

**If you get "Insufficient scope":**

- Wait another minute and try again
- Double-check Step 1 - ensure both scopes are checked

## Step 3: Verify NEXTAUTH_URL in Vercel (2 minutes)

**This fixes the authorization flow issue.**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Check NEXTAUTH_URL:**
   - Find: `NEXTAUTH_URL`
   - Verify value is: `https://www.prepflow.org` (exactly, no trailing slash)
   - Verify it's set for **Production** environment (not just Preview)

3. **If incorrect or missing:**
   - Click **Edit** or **Add**
   - Set value to: `https://www.prepflow.org`
   - Ensure **Production** is selected
   - Click **Save**

4. **Redeploy:**
   - Go to: **Deployments** tab
   - Click **Redeploy** on latest deployment
   - Or push a commit to trigger automatic deployment

## Step 4: Verify Fixes (1 minute)

Run these commands to verify everything is fixed:

```bash
# Check comprehensive test
curl -s https://www.prepflow.org/api/test/auth0-comprehensive | jq '.summary'

# Check logout URLs
curl -s https://www.prepflow.org/api/test/auth0-comprehensive | jq '.tests[] | select(.name | contains("Logout"))'

# Test authorization flow
curl -s "https://www.prepflow.org/api/test/auth0-flow?callbackUrl=/webapp" | jq '.success'
```

**Expected Results:**

- Summary: `passed: 15+`, `failed: 0`
- Logout test: `status: "pass"`
- Authorization flow: `success: true`

## Step 5: Test in Browser (2 minutes)

1. **Clear browser data:**
   - Open DevTools (F12)
   - Application → Cookies
   - Delete all cookies for `prepflow.org` and `www.prepflow.org`
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

2. **Navigate to:**

   ```
   https://www.prepflow.org/webapp
   ```

3. **Expected Flow:**
   - ✅ Redirects to `/api/auth/signin`
   - ✅ Click "Sign in with Auth0"
   - ✅ Redirects to Auth0 login page
   - ✅ After login, redirects back to `/webapp`
   - ✅ No `error=auth0` in URL

## Troubleshooting

### Auto-Fix Still Shows "Insufficient scope"

**Check:**

1. Both `read:clients` and `update:clients` are checked in Auth0
2. Waited 2+ minutes after granting permissions
3. Application shows as "Authorized" in Auth0 Management API

**Try:**

- Toggle authorization OFF and back ON
- Re-check both permission boxes
- Wait another minute and retry

### Authorization Flow Still Fails

**Check:**

1. NEXTAUTH_URL is exactly `https://www.prepflow.org` (no trailing slash)
2. Set for **Production** environment in Vercel
3. Application was redeployed after setting/changing

**Verify:**

```bash
curl -s https://www.prepflow.org/api/debug/auth | jq '.isCorrectProductionUrl'
```

Should return `true`

### Still Having Issues?

1. **Check Vercel Logs:**
   - Deployments → Latest → Logs
   - Look for `[Auth0 Config]` entries
   - Check for errors

2. **Check Auth0 Logs:**
   - Auth0 Dashboard → Monitoring → Logs
   - Filter for your application
   - Look for failed login attempts

3. **Run Full Diagnostic:**
   ```bash
   node scripts/verify-production-auth0-env.js
   ```

## Alternative: Manual Logout URL Configuration

If you prefer not to grant Management API access:

1. Go to: https://manage.auth0.com → Applications → Prepflow → Settings
2. Find: **Allowed Logout URLs**
3. Add (one per line):
   ```
   https://www.prepflow.org
   https://www.prepflow.org/
   https://prepflow.org
   https://prepflow.org/
   ```
4. Click **Save Changes**

Then proceed with Steps 3-5 above.

## Success Checklist

After completing all steps:

- [ ] Management API access granted (or logout URLs added manually)
- [ ] Auto-fix endpoint ran successfully (or manual configuration saved)
- [ ] NEXTAUTH_URL verified in Vercel
- [ ] Application redeployed (if NEXTAUTH_URL was changed)
- [ ] Comprehensive test shows all tests passing
- [ ] Authorization flow test shows `success: true`
- [ ] Browser login works without `error=auth0`

## Next Steps

Once login is working:

1. Test logout functionality
2. Test with different browsers
3. Monitor Auth0 logs for any issues
4. Document any additional configuration needed
