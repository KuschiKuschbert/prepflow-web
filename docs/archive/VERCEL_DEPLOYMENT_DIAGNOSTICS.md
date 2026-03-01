# Vercel Deployment Diagnostics Guide

## Problem: Deployments Not Triggering

If Vercel deployments aren't being triggered, follow this diagnostic checklist.

## Step 1: Verify Vercel GitHub Integration

### Check Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `prepflow-web`

2. **Check Project Settings → Git**
   - Path: Project Settings → Git
   - Verify repository is connected: `KuschiKuschbert/prepflow-web`
   - Check if "Auto-deploy" is **enabled**
   - Verify production branch is set to `main`

3. **Check Git Integration Status**
   - Look for any error messages or warnings
   - Verify webhook is active (should show "Connected" status)

### If Not Connected

1. Click "Connect Git Repository"
2. Select GitHub
3. Authorize Vercel to access your repositories
4. Select `KuschiKuschbert/prepflow-web`
5. Enable "Auto-deploy" for production branch
6. Set production branch to `main`

## Step 2: Verify GitHub Actions Secrets

### Check GitHub Repository Secrets

1. **Go to GitHub Repository**
   - Navigate to: https://github.com/KuschiKuschbert/prepflow-web
   - Go to: Settings → Secrets and variables → Actions

2. **Verify Required Secrets Exist**

   Required secrets:
   - `VERCEL_TOKEN` - Vercel API token
   - `VERCEL_ORG_ID` - Vercel organization/team ID
   - `VERCEL_PROJECT_ID` - Vercel project ID

### How to Get These Values

#### VERCEL_TOKEN

1. Go to Vercel Dashboard → Settings → Tokens
2. Click "Create Token"
3. Name it: `github-actions-deploy`
4. Set expiration (recommended: 1 year)
5. Copy the token value
6. Add to GitHub Secrets as `VERCEL_TOKEN`

#### VERCEL_ORG_ID

1. Go to Vercel Dashboard → Settings → General
2. Look for "Team ID" or "Organization ID"
3. Copy the ID (format: `team_xxxxx` or `org_xxxxx`)
4. Add to GitHub Secrets as `VERCEL_ORG_ID`

**Alternative method:**

- If using personal account, use your username
- If using team, use team slug

#### VERCEL_PROJECT_ID

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Look for "Project ID" (format: `prj_xxxxx`)
3. Copy the ID
4. Add to GitHub Secrets as `VERCEL_PROJECT_ID`

**Alternative method:**

- Check project URL: `https://vercel.com/[org]/[project]`
- Project ID is in the API responses

### Add Missing Secrets

If any secrets are missing:

1. Get the value using methods above
2. Go to GitHub → Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add name and value
5. Click "Add secret"

## Step 3: Check GitHub Actions Workflow Status

### Verify Workflow is Running

1. **Go to GitHub Actions Tab**
   - Navigate to: https://github.com/KuschiKuschbert/prepflow-web/actions
   - Check if workflows are running on push to `main`

2. **Check Workflow Logs**
   - Click on latest workflow run
   - Check if "Deploy to Vercel" step is executing
   - Review logs for errors

### Common Workflow Issues

#### Workflow Not Triggering

- **Check branch**: Workflow only runs on `main` branch
- **Check workflow file**: Ensure `.github/workflows/ci-cd.yml` exists
- **Check syntax**: Verify YAML syntax is correct

#### Deploy Step Skipped

- **Check condition**: `if: github.ref == 'refs/heads/main'`
- **Verify branch**: Must be pushing to `main` branch
- **Check dependencies**: Previous jobs must succeed

#### Deploy Step Failing

- **Check secrets**: Verify all three Vercel secrets are configured
- **Check token**: Ensure `VERCEL_TOKEN` is valid and not expired
- **Check permissions**: Token must have deployment permissions
- **Review logs**: Check error messages in workflow logs

## Step 4: Enable Vercel Auto-Deploy (Alternative)

If GitHub Actions deployment isn't working, enable Vercel's native auto-deploy:

### Enable Auto-Deploy

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to: Settings → Git

2. **Enable Auto-Deploy**
   - Toggle "Auto-deploy" to **ON**
   - Select production branch: `main`
   - Save settings

3. **Test Deployment**
   - Make a small change (e.g., update README)
   - Push to `main` branch
   - Check Vercel dashboard for new deployment

### Benefits of Vercel Auto-Deploy

- ✅ Simpler setup (no GitHub Actions secrets needed)
- ✅ Automatic deployments on push
- ✅ Preview deployments for PRs
- ✅ Built-in build logs and error handling

### Hybrid Approach

You can use both:

- **GitHub Actions**: For CI/CD pipeline (linting, testing, building)
- **Vercel Auto-Deploy**: For actual deployments

This gives you:

- ✅ Full CI/CD pipeline with quality checks
- ✅ Reliable deployments via Vercel
- ✅ Best of both worlds

## Step 5: Test Deployment Trigger

### Test with Small Change

1. **Make a test commit**

   ```bash
   echo "# Test deployment" >> .deploy-test
   git add .deploy-test
   git commit -m "test: trigger deployment"
   git push origin main
   ```

2. **Monitor Deployment**
   - Check GitHub Actions: https://github.com/KuschiKuschbert/prepflow-web/actions
   - Check Vercel Dashboard: https://vercel.com/dashboard
   - Both should show new deployment

3. **Verify Success**
   - GitHub Actions: Deploy step should complete successfully
   - Vercel Dashboard: New deployment should appear
   - Production site: Should update with changes

## Troubleshooting Checklist

- [ ] Vercel project is connected to GitHub repo
- [ ] Auto-deploy is enabled in Vercel settings
- [ ] Production branch is set to `main`
- [ ] `VERCEL_TOKEN` secret exists in GitHub
- [ ] `VERCEL_ORG_ID` secret exists in GitHub
- [ ] `VERCEL_PROJECT_ID` secret exists in GitHub
- [ ] GitHub Actions workflow runs on push to `main`
- [ ] Deploy step executes (not skipped)
- [ ] No errors in workflow logs
- [ ] Vercel dashboard shows deployments

## Quick Fixes

### Fix 1: Enable Vercel Auto-Deploy (Simplest)

1. Vercel Dashboard → Project Settings → Git
2. Enable "Auto-deploy"
3. Set production branch to `main`
4. Push to `main` to test

### Fix 2: Configure GitHub Actions Secrets

1. Get Vercel credentials (see Step 2)
2. Add secrets to GitHub repository
3. Push to `main` to trigger workflow
4. Check Actions tab for deployment

### Fix 3: Check Workflow Configuration

1. Verify `.github/workflows/ci-cd.yml` exists
2. Check YAML syntax is valid
3. Verify branch condition: `if: github.ref == 'refs/heads/main'`
4. Ensure workflow triggers on push

## Still Not Working?

If deployments still aren't triggering:

1. **Check Vercel Support**
   - Review Vercel documentation
   - Check Vercel status page
   - Contact Vercel support if needed

2. **Check GitHub Status**
   - Verify GitHub Actions is operational
   - Check GitHub status page
   - Review repository settings

3. **Review Logs**
   - GitHub Actions logs: Check for error messages
   - Vercel logs: Check deployment logs
   - Browser console: Check for runtime errors

4. **Manual Deployment**
   - Use Vercel CLI: `vercel --prod`
   - Or trigger deployment from Vercel dashboard

## Next Steps

Once deployments are working:

1. ✅ Set up monitoring and alerts
2. ✅ Configure preview deployments for PRs
3. ✅ Set up deployment notifications
4. ✅ Review deployment performance
5. ✅ Optimize build times

---

**Last Updated**: January 2025
**Status**: Diagnostic guide for deployment trigger issues
