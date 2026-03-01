# Auth0 Management API Setup for Auto-Fix

**Purpose:** Configure Auth0 Management API access to enable automatic configuration fixes via `/api/fix/auth0-callback-urls`

## Why This Is Needed

The auto-fix endpoint (`/api/fix/auth0-callback-urls`) requires Management API permissions to update Auth0 application settings. Without this, you'll need to manually configure logout URLs in the Auth0 dashboard.

## Setup Steps

### Step 1: Create Machine-to-Machine (M2M) Application

1. **Go to Auth0 Dashboard:**
   - Navigate to: https://manage.auth0.com
   - Go to: **Applications** → **Applications**

2. **Create New Application:**
   - Click **"Create Application"**
   - Name: `PrepFlow Management API` (or any name you prefer)
   - Type: **Machine to Machine Applications**
   - Click **Create**

3. **Authorize API:**
   - Select: **Auth0 Management API**
   - Click **Authorize**

4. **Grant Permissions:**
   - Find: **update:clients** scope
   - Check the box to enable it
   - Click **Authorize**

5. **Copy Credentials:**
   - Copy the **Client ID** (starts with a long string)
   - Copy the **Client Secret** (starts with a long string)
   - **Save these securely** - you'll need them for Step 2

### Step 2: Configure Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - Navigate to: Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add New Variables:**
   - **Variable Name:** `AUTH0_M2M_CLIENT_ID`
   - **Value:** The Client ID from Step 1
   - **Environment:** Production (and Preview if desired)
   - Click **Save**

   - **Variable Name:** `AUTH0_M2M_CLIENT_SECRET`
   - **Value:** The Client Secret from Step 1
   - **Environment:** Production (and Preview if desired)
   - Click **Save**

3. **Redeploy:**
   - After adding variables, trigger a new deployment
   - Or push a commit to trigger automatic deployment

### Step 3: Update Auto-Fix Endpoint (If Needed)

The auto-fix endpoint (`app/api/fix/auth0-callback-urls/route.ts`) may need to be updated to use M2M credentials if they're different from the main Auth0 credentials.

**Current Implementation:**

- Uses `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` (main application credentials)
- These may not have `update:clients` scope

**If M2M credentials are needed:**

- Update the endpoint to check for `AUTH0_M2M_CLIENT_ID` and `AUTH0_M2M_CLIENT_SECRET` first
- Fall back to main credentials if M2M credentials aren't available

### Step 4: Test Auto-Fix Endpoint

After configuring Management API access:

```bash
curl -X POST https://www.prepflow.org/api/fix/auth0-callback-urls | jq '.'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Auth0 configuration updated successfully",
  "changes": {
    "callbacks": { ... },
    "logoutUrls": { ... },
    "webOrigins": { ... }
  }
}
```

## Alternative: Manual Configuration

If you prefer not to set up Management API access, you can manually configure logout URLs:

1. Go to: https://manage.auth0.com → Applications → Prepflow → Settings
2. Add to "Allowed Logout URLs":
   ```
   https://www.prepflow.org
   https://www.prepflow.org/
   https://prepflow.org
   https://prepflow.org/
   ```
3. Save changes

## Security Notes

- **M2M credentials are sensitive** - Never commit them to git
- **Store in Vercel environment variables** - Secure and encrypted
- **Use minimal scopes** - Only grant `update:clients` scope (not `read:clients` or others unless needed)
- **Rotate regularly** - Change M2M credentials every 90 days

## Troubleshooting

### "Insufficient scope" Error

**Cause:** M2M application doesn't have `update:clients` scope

**Fix:**

1. Go to Auth0 Dashboard → Applications → Your M2M App
2. Go to **APIs** tab
3. Select **Auth0 Management API**
4. Enable **update:clients** scope
5. Save changes

### "Invalid credentials" Error

**Cause:** M2M Client ID or Secret is incorrect

**Fix:**

1. Verify credentials in Vercel environment variables
2. Check for typos or extra spaces
3. Regenerate credentials in Auth0 if needed

### Auto-Fix Still Not Working

**Check:**

1. M2M application exists and is authorized
2. `update:clients` scope is enabled
3. Environment variables are set in Vercel
4. Application was redeployed after adding variables

## Related Documentation

- `docs/AUTH0_STRIPE_REFERENCE.md` - Complete Auth0 reference
- `docs/PRODUCTION_LOGIN_FIX_GUIDE.md` - Production login fix guide
- `app/api/fix/auth0-callback-urls/route.ts` - Auto-fix endpoint implementation
