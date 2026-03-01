# Auth0 Management API Quick Setup

## Current Situation

Your regular Auth0 application client ID: `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL`

This is your **regular application** (used for user authentication), not a Machine-to-Machine (M2M) application.

## Quick Fix: Grant Your Existing App Management API Access

**This is the fastest way to get validation working.**

### Steps:

1. **Go to Auth0 Dashboard:**
   - Visit: https://manage.auth0.com
   - Navigate to: **APIs** → **Auth0 Management API**

2. **Authorize Your Application:**
   - Click the **Machine to Machine Applications** tab
   - Find your application: `CO3Vl37SuZ4e9wke1PitgWvAUyMR2HfL`
   - If it's not listed, click **+ Authorize** and select it
   - Toggle **Authorize** to ON

3. **Grant Required Scope:**
   - Under **Permissions**, find `read:clients`
   - Check the box ✅
   - Click **Update**

4. **Wait 1-2 minutes** (for changes to propagate)

5. **Test:**
   ```bash
   npm run auth0:check-config
   ```

**No environment variable changes needed!** The script will automatically use your existing `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET`.

## Alternative: Create Separate M2M Application (More Secure)

If you prefer a dedicated M2M application (recommended for production):

### Steps:

1. **Create M2M Application:**
   - Go to: https://manage.auth0.com → **Applications** → **Applications**
   - Click **Create Application**
   - Name: `PrepFlow Management API`
   - Type: **Machine to Machine Applications**
   - Click **Create**

2. **Authorize Management API:**
   - In the **APIs** section, select **Auth0 Management API**
   - Toggle **Authorize**
   - Under **Permissions**, select:
     - ✅ `read:clients`
   - Click **Authorize**

3. **Get Credentials:**
   - Copy the **Client ID** (different from your regular app)
   - Copy the **Client Secret**

4. **Add to `.env.local`:**

   ```bash
   AUTH0_M2M_CLIENT_ID=your-new-m2m-client-id-here
   AUTH0_M2M_CLIENT_SECRET=your-new-m2m-client-secret-here
   ```

5. **Test:**
   ```bash
   npm run auth0:check-config
   ```

## Which Option Should You Choose?

- **Option 1 (Grant existing app):** Faster, simpler, works immediately
- **Option 2 (M2M app):** More secure, better separation of concerns, recommended for production

Both work! Option 1 is fine for development/testing. Option 2 is better for production.

## Verification

After setup, run:

```bash
# Should show successful authentication and configuration validation
npm run auth0:check-config
```

You should see:

```
✅ Successfully authenticated
✅ Retrieved settings for application: PrepFlow
✅ All required web origins are configured correctly
✅ All required callback URLs are configured correctly
✅ All required logout URLs are configured correctly
```

## Troubleshooting

### Still getting "Insufficient scope"?

- Wait 2-3 minutes after granting scope (propagation delay)
- Verify scope is checked: Dashboard → APIs → Auth0 Management API → Your App → Permissions
- Check you're using the correct Client ID

### Getting "Invalid credentials"?

- Verify `AUTH0_CLIENT_SECRET` is correct (for Option 1)
- Or verify `AUTH0_M2M_CLIENT_SECRET` is correct (for Option 2)
- Check for typos or extra spaces in `.env.local`
