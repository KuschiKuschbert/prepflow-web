# Fix All Auth0 Issues - Complete Guide

**Status:** Based on validation results, here are all Auth0 issues and how to fix them.

## Current Status Summary

✅ **Working:**

- Environment variables: All valid
- Code implementation: No critical issues
- Logout URLs: 8/8 configured correctly
- Management API access: Working

❌ **Needs Fixing:**

- Web Origins: 0/4 configured (4 missing)
- Callback URLs: 0/4 configured (4 missing)

## Issue #1: Missing Web Origins (4 URLs)

**Impact:** Causes `error=autho` and CORS errors in production

**Fix:**

1. Go to: https://manage.auth0.com
2. Navigate to: **Applications** → **Prepflow** → **Settings**
3. Scroll to: **Allowed Web Origins**
4. Add these 4 URLs (one per line, no trailing slashes):

```
https://prepflow.org
https://www.prepflow.org
http://localhost:3000
http://localhost:3001
```

5. Click **Save Changes**

**Why:** Web origins are required for CORS requests from your frontend to Auth0.

## Issue #2: Missing Callback URLs (4 URLs)

**Impact:** Causes `error=Callback` and `error=autho` errors during sign-in

**Fix:**

1. Go to: https://manage.auth0.com
2. Navigate to: **Applications** → **Prepflow** → **Settings**
3. Scroll to: **Allowed Callback URLs**
4. Add these 4 URLs (one per line):

```
https://prepflow.org/api/auth/callback/auth0
https://www.prepflow.org/api/auth/callback/auth0
http://localhost:3000/api/auth/callback/auth0
http://localhost:3001/api/auth/callback/auth0
```

5. Click **Save Changes**

**Why:** After users authenticate, Auth0 redirects back to these URLs. If the URL isn't whitelisted, authentication fails.

## Issue #3: Verify Logout URLs (Already Fixed ✅)

**Status:** Already configured correctly (8/8 URLs)

**Current Configuration:**

- ✅ `http://localhost:3000`
- ✅ `http://localhost:3000/`
- ✅ `http://localhost:3001`
- ✅ `http://localhost:3001/`
- ✅ `https://prepflow.org`
- ✅ `https://prepflow.org/`
- ✅ `https://www.prepflow.org`
- ✅ `https://www.prepflow.org/`

**No action needed** - logout URLs are already correct!

## Quick Fix Checklist

**Step-by-step:**

1. ✅ Open Auth0 Dashboard: https://manage.auth0.com
2. ✅ Go to: Applications → Prepflow → Settings
3. ✅ Add 4 Web Origins (see Issue #1 above)
4. ✅ Add 4 Callback URLs (see Issue #2 above)
5. ✅ Click **Save Changes**
6. ✅ Wait 1-2 minutes for changes to propagate
7. ✅ Run validation: `npm run auth0:check-config`

## Verification

After fixing, run:

```bash
# Should show all checks passing
npm run auth0:check-config
```

**Expected Output:**

```
✅ All 4 required web origins are configured correctly
✅ All 4 required callback URLs are configured correctly
✅ All 8 required logout URLs are configured correctly
🎉 All Auth0 application settings are configured correctly!
```

## Common Mistakes to Avoid

### ❌ Don't Add Trailing Slashes to Web Origins

**Wrong:**

```
https://prepflow.org/
https://www.prepflow.org/
```

**Correct:**

```
https://prepflow.org
https://www.prepflow.org
```

### ❌ Don't Forget Both www and non-www Versions

**Wrong:**

```
https://prepflow.org/api/auth/callback/auth0
```

**Correct:**

```
https://prepflow.org/api/auth/callback/auth0
https://www.prepflow.org/api/auth/callback/auth0
```

### ❌ Don't Use Placeholder URLs

**Wrong:**

```
https://yourdomain.com/api/auth/callback/auth0
```

**Correct:**

```
https://prepflow.org/api/auth/callback/auth0
```

## Production vs Development URLs

**Production URLs (HTTPS):**

- `https://prepflow.org`
- `https://www.prepflow.org`
- `https://prepflow.org/api/auth/callback/auth0`
- `https://www.prepflow.org/api/auth/callback/auth0`

**Development URLs (HTTP):**

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3000/api/auth/callback/auth0`
- `http://localhost:3001/api/auth/callback/auth0`

**Important:** Always include both production AND development URLs so you can test locally.

## Troubleshooting

### Still Getting Errors After Fixing?

1. **Wait 2-3 minutes** - Auth0 changes can take time to propagate
2. **Clear browser cache** - Old errors might be cached
3. **Check exact URLs** - Must match exactly (no typos, correct protocol)
4. **Verify environment variables** - Run `npm run auth0:validate-env`
5. **Check Vercel environment variables** - Production uses Vercel env vars, not `.env.local`

### Error: "redirect_uri_mismatch"

**Cause:** Callback URL not in Allowed Callback URLs list

**Fix:** Add the exact callback URL to Auth0 Dashboard → Applications → Settings → Allowed Callback URLs

### Error: "error=autho" or "error=Callback"

**Cause:** Missing callback URL or web origin

**Fix:** Add both callback URLs and web origins (see Issues #1 and #2 above)

### Error: "CORS policy blocked"

**Cause:** Missing web origin

**Fix:** Add the domain to Allowed Web Origins (see Issue #1 above)

## Automated Validation

After fixing, use these commands to verify:

```bash
# Check environment variables
npm run auth0:validate-env

# Check Auth0 dashboard configuration (requires Management API access)
npm run auth0:check-config

# Check code issues
npm run auth0:check-issues

# Run all checks
npm run auth0:validate
```

## Next Steps

After fixing all issues:

1. ✅ Test sign-in on production: https://prepflow.org
2. ✅ Test sign-in on localhost: http://localhost:3000
3. ✅ Test logout functionality
4. ✅ Monitor for any remaining errors
5. ✅ Set up automated validation in CI/CD (optional)

## Related Documentation

- `docs/AUTH0_PRODUCTION_SETUP.md` - Complete production setup guide
- `docs/AUTH0_MANAGEMENT_API_SETUP.md` - Management API setup
- `docs/AUTH0_QUICK_SETUP.md` - Quick setup guide
- `docs/AUTH0_LOGOUT_SETUP.md` - Logout configuration guide
