# Vercel Build Failure Checklist

**Last Updated:** January 2025
**Purpose:** Quick reference checklist for debugging Vercel build failures

## Pre-Deployment Checklist

Run these checks before deploying:

```bash
# 1. Run comprehensive diagnostic
npm run diagnose:build

# 2. Run pre-deployment checks (simulates Vercel)
npm run pre-deploy

# 3. Check TypeScript errors
npm run type-check

# 4. Test production build locally
NODE_ENV=production npm run build
```

## Critical Issues Found

### ✅ Route Handlers

**Status:** All route handlers use correct Next.js 16 pattern

- All handlers use `await context.params`
- All handlers have correct type signature: `context: { params: Promise<{ id: string }> }`

### ❌ TypeScript Errors

**Status:** **28 TypeScript errors found** - **BLOCKS BUILD**

See `docs/VERCEL_BUILD_TYPESCRIPT_ERRORS.md` for complete list.

**Critical Errors:**

- 6 module resolution errors
- 8 missing type exports
- 3 type incompatibilities
- 2 missing function definitions
- 4 missing type names
- 5 implicit any types
- 1 argument type mismatch

**Action Required:** Fix all TypeScript errors before deploying.

### ✅ next.config.ts

**Status:** Configuration looks correct

- `compress: false` ✅ (required for Vercel)
- No explicit Content-Encoding headers ✅
- Redirects configured correctly ✅
- Headers configured correctly ✅
- Experimental features valid ✅

## Common Issues to Check

### Environment Variables

- [ ] All variables set in Vercel Production environment (not just Preview)
- [ ] `NEXT_PUBLIC_` prefix for client-side variables
- [ ] No typos or extra spaces
- [ ] All Auth0 variables set
- [ ] All Supabase variables set
- [ ] All Stripe variables set (if using billing)

### Node.js Version

- [ ] Vercel settings → General → Node.js version set to **22.x**
- [ ] Matches `package.json` engines (`>=22.0.0`)
- [ ] `.nvmrc` file exists with `22` (optional but recommended)

### Dependencies

- [ ] `npm ci` works (clean install)
- [ ] No missing dependencies
- [ ] No peer dependency warnings
- [ ] Build-time dependencies in `dependencies` (not `devDependencies`)

### Build Configuration

- [ ] `next.config.ts` syntax valid
- [ ] No deprecated options
- [ ] `compress: false` set
- [ ] No explicit compression headers
- [ ] Redirects/rewrites valid

### Code Quality

- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format:check`)
- [ ] All route handlers use Next.js 16 pattern
- [ ] No server-only code in client components

## Debugging Workflow

### Step 1: Identify Error Type

Check Vercel build logs for:

- TypeScript compilation errors
- Module not found errors
- Environment variable errors
- Build timeout errors
- Memory errors

### Step 2: Run Diagnostic Script

```bash
npm run diagnose:build
```

This checks:

- Node version
- TypeScript config
- Route handlers
- Server-only code
- next.config.ts
- Environment variables
- Dependencies

### Step 3: Fix Issues

1. Fix TypeScript errors (highest priority)
2. Fix module resolution errors
3. Fix missing type exports
4. Fix type incompatibilities
5. Add missing imports
6. Fix implicit any types

### Step 4: Verify Locally

```bash
# Clean install
rm -rf node_modules .next
npm ci

# Production build
NODE_ENV=production npm run build
```

### Step 5: Deploy

After all checks pass:

1. Commit fixes
2. Push to main
3. Monitor Vercel build logs
4. Verify deployment success

## Quick Fixes

### Fix TypeScript Errors

```bash
# See all errors
npm run type-check

# Fix formatting (may help)
npm run format

# Fix errors file by file
```

### Clear Build Cache

```bash
# Local
rm -rf .next

# Vercel
# Dashboard → Project → Settings → General → Clear Build Cache
```

### Verify Environment Variables

```bash
# Check Vercel dashboard
# Project → Settings → Environment Variables
# Ensure all set for Production environment
```

## Related Documentation

- `docs/VERCEL_BUILD_DEBUGGING.md` - Comprehensive debugging guide
- `docs/VERCEL_BUILD_TYPESCRIPT_ERRORS.md` - TypeScript errors found
- `DEPLOYMENT_TROUBLESHOOTING.md` - General deployment issues
- `scripts/diagnose-vercel-build.js` - Diagnostic script

## Next Steps

1. **Fix TypeScript Errors** - Address all 28 errors
2. **Run Diagnostic** - `npm run diagnose:build`
3. **Test Build** - `NODE_ENV=production npm run build`
4. **Deploy** - Push to Vercel after fixes
