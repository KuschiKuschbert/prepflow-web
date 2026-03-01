# Vercel API Setup Guide

**Purpose:** Guide for setting up Vercel API access to manage environment variables programmatically.

## Why Vercel API?

The Vercel REST API allows you to:

- ✅ **Set** environment variables programmatically (`set-vercel-env.js`)
- ✅ **Update** environment variables without manual dashboard changes
- ✅ **Sync** environment variables across environments
- ✅ **Automate** environment variable management in CI/CD pipelines

## Quick Start

### Step 1: Get Vercel API Token

1. Go to: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name: `PrepFlow Management` (or similar)
4. Scope: **Full Account** (or **Project** if you prefer)
5. Click **"Create Token"**
6. **Copy the token** (you won't see it again!)

### Step 2: Set Environment Variables

```bash
# Set Vercel token
export VERCEL_TOKEN=your-vercel-token-here

# Optional: Set project ID (or script will prompt)
export VERCEL_PROJECT_ID=your-project-id

# Optional: Set team ID (only if using team account)
export VERCEL_TEAM_ID=your-team-id

# Run the script
npm run vercel:set-env
```

The script will:

1. Fetch current Vercel environment variables
2. Compare with required variables
3. Prompt for production values (for secrets)
4. Create or update variables in Vercel Production environment

## Available Scripts

### `npm run vercel:check-env`

**Purpose:** Check which environment variables need to be set in Vercel

**What it does:**

- Reads `.env.local` for reference
- Lists all required variables
- Shows which ones are set locally
- Generates checklist for Vercel Dashboard

**Does NOT require:** Vercel API access

### `npm run vercel:set-env`

**Purpose:** Set environment variables in Vercel via REST API

**What it does:**

- Fetches current Vercel environment variables
- Compares with required variables
- Prompts for production values (for secrets)
- Creates or updates variables in Vercel Production environment

**Requires:**

- `VERCEL_TOKEN` environment variable
- `VERCEL_PROJECT_ID` (or will prompt)
- `VERCEL_TEAM_ID` (optional, for team accounts)

**Example output:**

```
🚀 Setting Vercel Environment Variables via API...
📋 Project ID: prj_abc123...
📥 Fetching current Vercel environment variables...
✅ Found 5 existing environment variables
📋 Preparing environment variables to set...
➕ Creating NEXTAUTH_URL...
✅ Created NEXTAUTH_URL
🔄 Updating AUTH0_CLIENT_SECRET...
✅ Updated AUTH0_CLIENT_SECRET
✅ Environment variables set successfully!
```

## Getting Your Vercel Project ID

### Option 1: From Vercel Dashboard

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **General**
2. Find **"Project ID"** (starts with `prj_...`)
3. Copy it

### Option 2: From `.vercel` Directory

If you've linked your project with `vercel link`, the project ID is stored in `.vercel/project.json`:

```bash
cat .vercel/project.json | grep projectId
```

### Option 3: Let Script Prompt

If you don't set `VERCEL_PROJECT_ID`, the script will prompt you for it.

## Getting Your Vercel Team ID (Optional)

Only needed if you're using a team account:

1. Go to: **Vercel Dashboard** → **Team Settings** → **General**
2. Find **"Team ID"** (starts with `team_...`)
3. Copy it

## Setting Environment Variables

### Interactive Mode (Recommended)

```bash
export VERCEL_TOKEN=your-token
npm run vercel:set-env
```

The script will:

- Prompt for production values for secrets
- Use predefined values for non-secrets (like `NEXTAUTH_URL=https://www.prepflow.org`)
- Show validation warnings (e.g., if `NEXTAUTH_URL` doesn't have www)
- Ask for confirmation before making changes

### Non-Interactive Mode (Advanced)

You can also set values directly in the script by modifying `REQUIRED_VARS` in `scripts/set-vercel-env.js`:

```javascript
NEXTAUTH_URL: {
  // ...
  productionValue: 'https://www.prepflow.org', // Will use this automatically
  prompt: false, // Won't prompt
},
```

## Security Best Practices

1. **Never commit VERCEL_TOKEN** to git
   - Use environment variables: `export VERCEL_TOKEN=...`
   - Or add to `.env.local` (gitignored)

2. **Use minimal token scope**
   - **Full Account:** Can manage all projects
   - **Project:** Can only manage specific project (more secure)

3. **Rotate tokens regularly**
   - Update tokens every 90 days
   - Revoke old tokens after creating new ones

4. **Use different tokens for different environments**
   - Development: Local token
   - CI/CD: GitHub Secrets token
   - Production: Separate production token

## Troubleshooting

### Error: "Authentication failed"

**Cause:** Invalid or expired VERCEL_TOKEN

**Solution:**

1. Go to: https://vercel.com/account/tokens
2. Verify token exists and is not expired
3. Create new token if needed
4. Update `VERCEL_TOKEN` environment variable

### Error: "Project not found"

**Cause:** Invalid VERCEL_PROJECT_ID

**Solution:**

1. Go to: Vercel Dashboard → Project → Settings → General
2. Copy the correct Project ID (starts with `prj_...`)
3. Set `VERCEL_PROJECT_ID` environment variable
4. Or let script prompt for it

### Error: "Insufficient permissions"

**Cause:** Token doesn't have required permissions

**Solution:**

1. Go to: https://vercel.com/account/tokens
2. Create new token with **Full Account** scope
3. Or grant token access to specific project

### Error: "Variable already exists"

**Cause:** Variable exists but script tried to create it

**Solution:**

- Script automatically handles this by updating existing variables
- If error persists, check Vercel Dashboard manually

## API Reference

### Vercel REST API Endpoints Used

- **List Environment Variables:** `GET /v9/projects/{projectId}/env`
- **Create Environment Variable:** `POST /v9/projects/{projectId}/env`
- **Update Environment Variable:** `PATCH /v9/projects/{projectId}/env/{envId}`
- **Delete Environment Variable:** `DELETE /v9/projects/{projectId}/env/{envId}`

**Documentation:** https://vercel.com/docs/rest-api

## Workflow Example

### Complete Setup Workflow

```bash
# 1. Get Vercel token
export VERCEL_TOKEN=your-token-here

# 2. Check what needs to be set
npm run vercel:check-env

# 3. Set environment variables (will prompt for secrets)
npm run vercel:set-env

# 4. Verify Auth0 configuration
npm run auth0:check-config

# 5. Update Auth0 configuration if needed
npm run auth0:update-config

# 6. Test sign-in
# Go to: https://www.prepflow.org
```

## Benefits of API Management

✅ **Speed:** Set all variables in seconds
✅ **Consistency:** Same variables across all environments
✅ **Automation:** Can be integrated into CI/CD pipelines
✅ **Version Control:** Variable changes tracked in git (via script)
✅ **Reproducibility:** Easy to replicate configuration on new projects
✅ **Error Prevention:** Validation before setting variables

## Next Steps

After setting environment variables:

1. **Redeploy application** in Vercel Dashboard
2. **Wait 1-2 minutes** for changes to propagate
3. **Test sign-in:** https://www.prepflow.org
4. **Verify Auth0:** `npm run auth0:check-config`
5. **Update Auth0 config:** `npm run auth0:update-config` (if needed)

## Related Documentation

- **Vercel Env Setup:** `docs/VERCEL_ENV_SETUP.md`
- **Vercel Checklist:** `docs/VERCEL_ENV_CHECKLIST.md`
- **Auth0 Setup:** `docs/AUTH0_PRODUCTION_SETUP.md`
- **Auth0 CLI:** `docs/AUTH0_CLI_SETUP.md`
