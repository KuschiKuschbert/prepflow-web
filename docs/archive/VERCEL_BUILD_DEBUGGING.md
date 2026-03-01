# Vercel Build Failure Debugging Guide

**Last Updated:** January 2025
**Status:** Comprehensive debugging guide for Vercel build failures

## Quick Start

Run the diagnostic script to identify common issues:

```bash
npm run diagnose:build
```

This will check:

- Node version compatibility
- TypeScript configuration
- Route handler patterns (Next.js 16)
- Server-only code in client components
- next.config.ts issues
- Environment variables
- Dependencies

## Common Build Failure Causes

### 1. Environment Variables Missing

**Symptoms:**

- Build succeeds but runtime errors occur
- "Environment variable not found" errors
- Database connection failures

**Solution:**

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify ALL variables are set for **Production** environment (not just Preview)
3. Check for typos and missing `NEXT_PUBLIC_` prefixes
4. Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH0_SECRET`
   - `AUTH0_BASE_URL`
   - `AUTH0_ISSUER_BASE_URL`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`

### 2. Node.js Version Mismatch

**Symptoms:**

- Build fails with "Unsupported Node version" errors
- Syntax errors that work locally
- Module resolution failures

**Solution:**

1. Check Vercel Dashboard → Project → Settings → General
2. Verify Node.js version is set to **22.x** (matches `package.json` engines)
3. If not set, Vercel defaults to Node 20.x
4. Add `.nvmrc` file with `22` to ensure consistency

### 3. TypeScript Errors

**Symptoms:**

- Build fails during TypeScript compilation
- Type errors in build logs
- Missing type definitions

**Solution:**

1. Run locally: `npm run type-check`
2. Fix all TypeScript errors before deploying
3. Common issues:
   - Missing type imports
   - Incorrect ref types (`RefObject<HTMLElement | null>`)
   - Implicit `any` types

### 4. Route Handler Parameter Issues (Next.js 16)

**Symptoms:**

- Build succeeds but route handlers fail at runtime
- "Cannot read property of undefined" errors
- Parameter access errors

**Solution:**
All route handlers must use Next.js 16 pattern:

```typescript
// ✅ Correct (Next.js 16)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // ...
}

// ❌ Wrong (Next.js 15 - will fail)
export async function GET(req: NextRequest, context) {
  const { id } = context.params; // Missing await and Promise type
  // ...
}
```

**Check all route handlers:**

```bash
find app/api -name "route.ts" -exec grep -l "context.params" {} \;
```

### 5. Server-Only Code in Client Components

**Symptoms:**

- Build fails with "Module not found" errors
- "fs is not defined" errors
- "process.env is not defined" errors

**Solution:**

1. Check all `"use client"` components
2. Ensure no server-only APIs are used:
   - `fs`, `path`, `os` modules
   - `process.env` without `NEXT_PUBLIC_` prefix
   - Server-only Supabase client

**Find issues:**

```bash
grep -r "use client" app --include="*.tsx" -A 20 | grep -E "(fs|path|os|process\.env[^NEXT_PUBLIC])"
```

### 6. Build Timeout or Memory Issues

**Symptoms:**

- Build exceeds maximum duration
- "JavaScript heap out of memory" errors
- Build fails after long wait

**Solution:**

1. Check build logs for timeout errors
2. Analyze bundle size: `npm run analyze`
3. Optimize webpack configuration in `next.config.ts`
4. Consider upgrading Vercel plan for more resources

### 7. Missing Dependencies

**Symptoms:**

- "Module not found" errors
- Import errors for packages that work locally
- Peer dependency warnings

**Solution:**

1. Clean install like Vercel:
   ```bash
   rm -rf node_modules package-lock.json
   npm ci
   npm run build
   ```
2. Check if `devDependencies` are imported in production code
3. Move build-time dependencies to `dependencies` if needed

### 8. next.config.ts Issues

**Symptoms:**

- Build fails during configuration loading
- Invalid redirect/rewrite rules
- Webpack configuration errors

**Solution:**

1. Validate syntax: `node -e "require('./next.config.ts')"`
2. Check for deprecated options
3. Verify `compress: false` (required for Vercel)
4. Remove explicit `Content-Encoding` headers

### 9. Import Path Resolution Issues

**Symptoms:**

- "Cannot find module" errors
- Case-sensitive import failures
- Path alias resolution errors

**Solution:**

1. Check for case-sensitive file paths (Linux vs macOS)
2. Verify `tsconfig.json` path aliases (`@/*`)
3. Ensure all imports use correct paths
4. Check for missing file extensions

### 10. Build Cache Issues

**Symptoms:**

- Inconsistent builds
- Old code appearing in builds
- Build succeeds but wrong code deployed

**Solution:**

1. Clear Vercel build cache:
   - Vercel Dashboard → Project → Settings → General
   - Click "Clear Build Cache"
   - Redeploy
2. Clear local cache:
   ```bash
   rm -rf .next
   npm run build
   ```

## Systematic Debugging Workflow

### Step 1: Check Environment Variables (Tier 1)

Before diving into code, **ALWAYS** check for missing or invalid secrets:

1.  **Local Check**: Look at `.env.local` or run `grep "VAR_NAME" .env.local` to see if the secret is already known in the workspace.
2.  **Dashboard Check**: Go to Vercel Dashboard → Project → Settings → Environment Variables.
3.  **Log Check**: Look for "is required but missing or empty" errors in Runtime Logs.

### Step 2: Run Diagnostic Script

```bash
npm run diagnose:build
```

This will identify most common issues automatically.

### Step 2: Run Pre-Deployment Checks

```bash
npm run pre-deploy
```

This simulates what Vercel runs:

- Node version check
- Dependency installation (`npm ci`)
- Security audit
- Lint check
- Type check
- Format check
- Build check (most important)

### Step 3: Check Vercel Build Logs

1. Go to Vercel Dashboard → Project → Deployments
2. Click on failed deployment
3. Review build logs section by section
4. Look for:
   - TypeScript errors (with file paths and line numbers)
   - Module not found errors
   - Environment variable errors
   - Build timeout errors
   - Memory errors

### Step 4: Compare Local vs Vercel Environment

```bash
# Clean install like Vercel
rm -rf node_modules .next
npm ci

# Production build
NODE_ENV=production npm run build
```

Compare:

- Node version
- npm version
- Environment variables
- Build output

### Step 5: Check Specific Error Types

#### TypeScript Errors

```bash
npm run type-check
```

#### Route Handler Issues

```bash
# Find all route handlers using context.params
find app/api -name "route.ts" -exec grep -l "context.params" {} \;

# Check for missing await
grep -r "context\.params[^)]" app/api --include="*.ts"
```

#### Server-Only Code in Client

```bash
grep -r "use client" app --include="*.tsx" -A 20 | grep -E "(fs|path|os|process\.env[^NEXT_PUBLIC])"
```

## Quick Fix Checklist

Before debugging, verify these common fixes:

- [ ] `compress: false` in `next.config.ts` (prevents compression conflicts)
- [ ] All environment variables set in Vercel Production environment
- [ ] Node.js version matches in Vercel settings (22.x)
- [ ] `npm run build` passes locally
- [ ] `npm run type-check` passes locally
- [ ] All route handlers use `await context.params` (Next.js 16)
- [ ] No server-only code in client components
- [ ] Build cache cleared in Vercel
- [ ] Dependencies installed with `npm ci` (not `npm install`)

## Diagnostic Tools

### Built-in Scripts

- `npm run diagnose:build` - Comprehensive build diagnostic
- `npm run pre-deploy` - Pre-deployment validation
- `npm run type-check` - TypeScript error checking
- `npm run lint` - ESLint checking
- `npm run build` - Full production build test

### Manual Checks

- Check Vercel build logs for specific errors
- Compare local vs Vercel environment
- Verify environment variables in Vercel dashboard
- Check Node.js version in Vercel settings

## Getting Help

If build failures persist:

1. **Check Vercel Status:** https://vercel-status.com
2. **Review Build Logs:** Full error messages in Vercel dashboard
3. **Compare Environments:** Run production build locally
4. **Check Documentation:** Next.js 16 migration guide
5. **Contact Support:** Vercel support or Next.js GitHub issues

## Related Documentation

- `DEPLOYMENT_TROUBLESHOOTING.md` - General deployment issues
- `docs/VERCEL_BUILD_FIX_SUMMARY.md` - Previous build fixes
- `scripts/pre-deploy-check.sh` - Pre-deployment validation script
- `.github/workflows/ci.yml` - CI checks (should match Vercel)
