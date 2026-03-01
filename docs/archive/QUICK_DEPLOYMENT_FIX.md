# Quick Fix: Vercel Deployment Not Triggering

## 🚨 Quick Diagnosis

If deployments aren't triggering, check these in order:

### 1. Check GitHub Actions (2 minutes)

Go to: https://github.com/KuschiKuschbert/prepflow-web/actions

- [ ] Are workflows running when you push to `main`?
- [ ] Is the "Deploy to Vercel" step executing?
- [ ] Are there any error messages in the logs?

**If workflows aren't running:**

- Check if `.github/workflows/ci-cd.yml` exists
- Verify you're pushing to `main` branch (not `master` or other branches)

### 2. Check GitHub Secrets (3 minutes)

Go to: https://github.com/KuschiKuschbert/prepflow-web/settings/secrets/actions

- [ ] `VERCEL_TOKEN` exists
- [ ] `VERCEL_ORG_ID` exists
- [ ] `VERCEL_PROJECT_ID` exists

**If secrets are missing:**

1. **Get VERCEL_TOKEN:**
   - Vercel Dashboard → Settings → Tokens → Create Token
   - Copy token and add to GitHub Secrets

2. **Get VERCEL_ORG_ID:**
   - Vercel Dashboard → Settings → General → Team ID
   - Copy ID and add to GitHub Secrets

3. **Get VERCEL_PROJECT_ID:**
   - Vercel Dashboard → Your Project → Settings → General → Project ID
   - Copy ID and add to GitHub Secrets

### 3. Check Vercel Dashboard (2 minutes)

Go to: https://vercel.com/dashboard → Your Project → Settings → Git

- [ ] Repository connected: `KuschiKuschbert/prepflow-web`
- [ ] Auto-deploy enabled: **ON**
- [ ] Production branch: `main`

**If not connected:**

- Click "Connect Git Repository"
- Select GitHub → Authorize → Select repo
- Enable "Auto-deploy"

## ✅ Quick Fix Options

### Option A: Enable Vercel Auto-Deploy (Easiest - 2 minutes)

1. Vercel Dashboard → Project Settings → Git
2. Enable "Auto-deploy"
3. Set production branch to `main`
4. Push to `main` → Deployment triggers automatically

**This bypasses GitHub Actions and uses Vercel's native deployment.**

### Option B: Fix GitHub Actions (5 minutes)

1. Add missing secrets (see Step 2 above)
2. Push to `main` branch
3. Check GitHub Actions tab for deployment

**This keeps your CI/CD pipeline intact.**

### Option C: Use Both (Recommended)

- Keep GitHub Actions for CI/testing
- Enable Vercel auto-deploy for deployments
- Best of both worlds

## 🔧 Run Verification Script

```bash
./scripts/verify-vercel-setup.sh
```

This will check your local setup and show what needs to be verified manually.

## 📚 Detailed Guide

For comprehensive troubleshooting, see: `docs/VERCEL_DEPLOYMENT_DIAGNOSTICS.md`

## 🆘 Still Not Working?

1. Check Vercel status: https://www.vercel-status.com
2. Check GitHub status: https://www.githubstatus.com
3. Review workflow logs in GitHub Actions
4. Check Vercel deployment logs in dashboard
5. Contact support if needed

---

**Most Common Issue**: Missing GitHub Secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)

**Quickest Fix**: Enable Vercel Auto-Deploy in dashboard
