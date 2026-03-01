# Vercel Build TypeScript Errors

**Date:** January 2025
**Status:** ⚠️ TypeScript errors found that will cause Vercel build failures

## Summary

Running `npm run type-check` revealed **28 TypeScript errors** that will cause Vercel builds to fail. These errors must be fixed before deployment.

## Error Categories

### 1. Missing Function Definitions (2 errors)

**File:** `app/webapp/menu-builder/utils/formatMenuForPrint.ts`

- Line 62: `Cannot find name 'formatCategorySection'`
- Line 65: `Cannot find name 'generateAllergenMatrix'`

**Fix:** Import or define these functions.

### 2. Module Resolution Errors (6 errors)

**Files:**

- `app/webapp/order-lists/utils/printOrderList/helpers/generateOrderHeader.ts` - Cannot find module '../printOrderList'
- `app/webapp/order-lists/utils/printOrderList/helpers/generateOrderItemsTable.ts` - Cannot find module '../printOrderList'
- `app/webapp/performance/hooks/usePerformanceInsights/helpers/fetchAIInsights.ts` - Cannot find module '../usePerformanceInsights'
- `app/webapp/recipes/components/hooks/useRecipeDishIngredientLoading/helpers/loadIngredientsForItem.ts` - Cannot find module '../useRecipeDishEditorData'
- `app/webapp/recipes/components/hooks/useRecipeEditIngredientLoading/helpers/processRecipeIngredients.ts` - Cannot find module '../../../../cogs/hooks/utils/createCalculation'
- `hooks/useEntitlements/helpers/entitlementHelpers.ts` - Cannot find module '../useEntitlements'
- `hooks/useEntitlements/helpers/fetchEntitlements.ts` - Cannot find module '../useEntitlements'

**Fix:** Correct import paths or create missing files.

### 3. Missing Type Exports (8 errors)

**Files:**

- `app/webapp/performance/components/PerformanceHeader/PerformanceScoreTooltip.tsx` - Module has no exported member 'ReturnType'
- `app/webapp/performance/utils/generatePerformanceTips/tipCategories/helpers/generateCleanupTips.ts` - No exported member 'PerformanceTip'
- `app/webapp/performance/utils/generatePerformanceTips/tipCategories/helpers/generateDataQualityTips.ts` - No exported member 'PerformanceTip'
- `app/webapp/performance/utils/generatePerformanceTips/tipCategories/helpers/generateGrowthTips.ts` - No exported member 'PerformanceTip'
- `app/webapp/performance/utils/generatePerformanceTips/tipCategories/helpers/generateMarketingTips.ts` - No exported member 'PerformanceTip'
- `app/webapp/performance/utils/generatePerformanceTips/tipCategories/helpers/generatePricingTips.ts` - No exported member 'PerformanceTip'
- `app/webapp/recipes/components/hooks/useRecipeDishSave/helpers/saveDishIngredients.ts` - No exported member 'RecipeDishItem'
- `app/webapp/recipes/components/hooks/useRecipeDishSave/helpers/saveRecipeIngredients.ts` - No exported member 'RecipeDishItem'

**Fix:** Export missing types or use correct type names.

### 4. Type Incompatibilities (3 errors)

**File:** `app/webapp/recipes/components/hooks/useRecipeDishSave.ts`

- Lines 42, 45: `COGSCalculation[]` type incompatibility
  - `id` property: `string | undefined` vs `string`
  - Type from `app/webapp/cogs/types` vs `app/webapp/recipes/types`

**Fix:** Align type definitions or add type conversions.

### 5. Implicit Any Types (5 errors)

**File:** `app/webapp/performance/components/PerformanceHeader/PerformanceScoreTooltip.tsx`

- Line 36: Parameter 'tip' implicitly has 'any' type
- Line 36: Parameter 'index' implicitly has 'any' type
- Line 39: Element implicitly has 'any' type (2 instances)

**Fix:** Add explicit type annotations.

### 6. Missing Type Names (4 errors)

**Files:**

- `app/webapp/performance/components/PerformanceHeader.tsx` - Cannot find name 'generatePerformanceTips' (should be 'fetchPerformanceTips')
- `app/webapp/recipes/hooks/useRecipeActions.ts` - Cannot find name 'RecipeIngredientWithDetails'
- `app/webapp/suppliers/hooks/useSuppliersForms.ts` - Cannot find name 'Supplier' (2 instances)
- `app/webapp/suppliers/hooks/useSuppliersForms.ts` - Cannot find name 'SupplierPriceList' (2 instances)

**Fix:** Import missing types or correct function names.

### 7. Argument Type Mismatch (1 error)

**File:** `components/ui/FoodImageGenerator.tsx`

- Line 85: Argument type mismatch - callback function vs string | null

**Fix:** Correct function signature or argument type.

## Impact on Vercel Builds

**All of these errors will cause Vercel builds to fail** because:

1. TypeScript compilation is part of the build process
2. `tsc --noEmit` runs during `npm run build`
3. Vercel uses strict TypeScript checking
4. Build fails if any TypeScript errors exist

## Fix Priority

### High Priority (Blocks Build)

- All module resolution errors (6 errors)
- Missing type exports (8 errors)
- Type incompatibilities (3 errors)

### Medium Priority (Causes Runtime Issues)

- Missing function definitions (2 errors)
- Missing type names (4 errors)
- Argument type mismatches (1 error)

### Low Priority (Code Quality)

- Implicit any types (5 errors)

## Quick Fix Commands

```bash
# Check all TypeScript errors
npm run type-check

# Fix formatting first (may help with some issues)
npm run format

# Then fix errors file by file
```

## Next Steps

1. **Fix Module Resolution Errors** - Correct import paths
2. **Export Missing Types** - Add missing type exports
3. **Align Type Definitions** - Fix COGSCalculation type mismatch
4. **Add Type Annotations** - Fix implicit any types
5. **Import Missing Types** - Add missing imports
6. **Re-run Type Check** - Verify all errors fixed
7. **Test Build** - Run `npm run build` locally
8. **Deploy** - Push to Vercel after all errors fixed

## Related Files

- `tsconfig.json` - TypeScript configuration
- `.github/workflows/ci.yml` - CI runs type-check
- `scripts/pre-deploy-check.sh` - Pre-deployment validation includes type-check
