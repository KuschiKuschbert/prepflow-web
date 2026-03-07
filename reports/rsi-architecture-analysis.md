# 🏗️ RSI Architecture Analysis Report

**Date:** 3/7/2026, 3:28:15 PM

**Detected Design Patterns:** 6
**Detected Anti-Patterns:** 472

## ⚠️ Anti-Patterns Detected

### Magic Numbers (MEDIUM)

**File:** `app/admin/billing/components/BillingHealthReport.tsx`
**Description:** Found 17 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/billing/components/SubscriptionsTable.tsx`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/components/dashboard/StatsGrid.tsx`
**Description:** Found 18 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/errors/components/ErrorLogsTable.tsx`
**Description:** Found 18 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/errors/constants.ts`
**Description:** Found 23 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/features/components/FeatureFlagsTable.tsx`
**Description:** Found 21 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/features/components/HiddenFeatureFlagsTable.tsx`
**Description:** Found 25 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/admin/hooks/useAdminBadges.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/admin/support-tickets/components/TicketDetailModal.tsx`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/support-tickets/components/TicketsTable.tsx`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/support-tickets/constants.ts`
**Description:** Found 31 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/system/page.tsx`
**Description:** Found 26 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/admin/users/components/UsersTable.tsx`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/admin/users/hooks/useUserDetail.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/admin/users/hooks/useUsers.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/admin/features/[flag]/controller.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/admin/support/reset-password/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/admin/support-tickets/[id]/link-error/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/admin/tiers/route.ts`
**Description:** Found 22 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/ai-specials/helpers/handlePostRequest.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/ai-specials/search/helpers/rankRecipes.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/backup/restore/helpers/processRestore.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/backup/restore/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/backup/schedule/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/backup/settings/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/billing/extend-subscription/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/billing/reactivate-subscription/route.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/cleaning-tasks/[id]/complete/route.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/cleaning-tasks/[id]/uncomplete/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/cleaning-tasks/helpers/createCleaningTaskHandler.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/cleaning-tasks/helpers/deleteCleaningTaskHandler.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/compliance/allergens/export/helpers/generateHTMLExport.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/compliance/allergens/export/helpers/htmlExportStyles.ts`
**Description:** Found 30 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/compliance-records/route.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/compliance-types/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/curbos/public-token/curbos/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/curbos/public-token/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/customers/[id]/route.ts`
**Description:** Found 18 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/customers/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/customers/upload-photo/route.ts`
**Description:** Found 18 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/db/diagnose-dishes/route.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/db/reset/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/dedupe/execute/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/dishes/[id]/allergen-sources/helpers/processIngredientAllergens.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/dishes/[id]/generate-image/helpers/batchFetchRecipeIngredients.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/dishes/[id]/helpers/enrichDishWithAllergens.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/dishes/[id]/helpers/put/handleRecipeUpdates.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/dishes/[id]/helpers/put/triggerSideEffects.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/dishes/[id]/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/dishes/bulk-delete/route.ts`
**Description:** Found 18 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/employees/[id]/qualifications/[qual_id]/route.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/employees/upload-photo/route.ts`
**Description:** Found 22 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/entitlements/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/equipment-maintenance/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/functions/[id]/route.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/functions/[id]/runsheet/[itemId]/route.ts`
**Description:** Found 17 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/functions/[id]/runsheet/route.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/functions/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/generate-sales-data/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/generate-sales-data/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/generate-test-temperature-logs/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/image-proxy/route.ts`
**Description:** Found 19 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/ingredients/add-consumables/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/ingredients/auto-categorize/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/ingredients/batch-ai-detect-allergens/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/ingredients/batch-ai-detect-allergens/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/ingredients/detect-missing-allergens/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/ingredients/helpers/createIngredient.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/ingredients/populate-all-allergens/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/ingredients/populate-all-allergens/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/allergen-matrix/export/helpers/allergenMatrixStyles.ts`
**Description:** Found 31 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/changes/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/export-combined/helpers/allergenMatrixStyles.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/items/[itemId]/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/menus/[id]/items/[itemId]/statistics/helpers/calculateRecommendedPrice.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/items/bulk/route.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/menus/[id]/lock/helpers/aiGeneration.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/menus/[id]/lock/helpers/generateRecipeCards/checkExistingCards.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/lock/helpers/lockOperations.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/menus/[id]/lock/helpers/subRecipeUtils.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/menus/[id]/lock/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/lock/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/recipe-cards/generate/route.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/menus/[id]/refresh-prices/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/menus/[id]/statistics/helpers/calculateDishCost.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/menus/[id]/statistics/helpers/calculateRecipeCost.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/navigation-optimization/patterns/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/navigation-optimization/preferences/route.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/order-lists/[id]/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/prep-lists/batch-create/helpers/processBatch.test.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/prep-lists/generate-from-menu/helpers/processMenuItem.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/qualification-types/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/recipes/[id]/dietary-suitability/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/recipes/[id]/generate-image/helpers/saveImages.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/recipes/[id]/helpers/validateRecipeUpdate.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/recipes/[id]/ingredients/helpers/fetchRecipeMetadata.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/recipes/[id]/ingredients/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/recipes/[id]/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/recipes/[id]/suggest-plating-methods/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/recipes/bulk-delete/route.ts`
**Description:** Found 20 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/roster/templates/[id]/apply/route.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/roster/templates/[id]/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/setup-user-avatar/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/special-days/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/square/config/route.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/square/sync/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/staff/availability/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/staff/employees/[id]/qualifications/[qual_id]/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/staff/employees/[id]/qualifications/route.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/staff/employees/[id]/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/staff/onboarding/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/temperature-equipment/[id]/helpers/deleteTemperatureEquipmentHandler.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/temperature-equipment/[id]/helpers/updateTemperatureEquipmentHandler.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/temperature-logs/generate-sample/route.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/test/auth0-callback-diagnostic/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/test/auth0-signin-flow/route.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/api/test/google-login-flow/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/time-attendance/clock-in/route.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/time-attendance/clock-out/route.ts`
**Description:** Found 17 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/user/data-usage/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/user/error-reporting-preferences/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/api/user/errors/auto-report/route.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/user/subscription/route.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/webhook/square/route.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/api/webhook/stripe/helpers/getUserEmail.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/api/webhook/stripe/route.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/auth/error/page.tsx`
**Description:** Found 25 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/components/landing/AnimatedBackground.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/components/landing/LandingBackground.tsx`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/components/landing/LandingHeader.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/components/landing/MobileBottomNav.tsx`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/components/landing/ModernMobileNav.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/components/landing/components/FeatureButton.tsx`
**Description:** Found 50 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/components/landing/components/FeatureImageContainer.tsx`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/components/landing/hooks/utils/animationEffects.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/components/landing/hooks/utils/imageTransitions.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/components/landing/hooks/utils/toggleHandler.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/components/landing/hooks/utils/widthMeasurement.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos/CurbOSLayoutClient.tsx`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/curbos/components/MenuItemCard.tsx`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos/components/PulsatingConcentricTriangles.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos/components/passport/PassportIdPage.tsx`
**Description:** Found 24 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/curbos/components/passport/PassportStampsPage.tsx`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/curbos/customers/CustomerCard.tsx`
**Description:** Found 18 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/curbos/display/page.tsx`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos/hooks/useCurbOSAuth.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/curbos/kitchen/components/KitchenOrderCard.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos/kitchen/components/KitchenOrderCard.tsx`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos/modifiers/page.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos/modifiers/page.tsx`
**Description:** Found 26 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/curbos/order/[id]/components/OrderStatusCard.tsx`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos/order/[id]/hooks/useOrderNotification.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/curbos/page.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos/page.tsx`
**Description:** Found 17 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos/quests/[id]/hooks/useQuestData.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos/quests/[id]/hooks/useQuestData.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos/settings/SettingsClient.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos/settings/components/PublicLinkSection.tsx`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/curbos/settings/components/ReleaseInfoSection.tsx`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos/stats/page.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos/stats/page.tsx`
**Description:** Found 24 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/curbos-import/admin/components/Background.tsx`
**Description:** Found 17 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos-import/admin/modifiers/page.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos-import/admin/modifiers/page.tsx`
**Description:** Found 21 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/curbos-import/admin/page.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/curbos-import/admin/page.tsx`
**Description:** Found 22 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/generate-background/page.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/generate-background/page.tsx`
**Description:** Found 40 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/privacy-policy/page.tsx`
**Description:** Found 30 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/providers.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/terms-of-service/TermsMobileTOC.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/terms-of-service/TermsTableOfContents.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/terms-of-service/sections/PaymentTerms.tsx`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/cleaning/components/CleaningGrid/helpers/mergeOptimisticTasks.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/cleaning/components/CleaningGrid/hooks/useOptimisticCompletions.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/cleaning/components/CleaningStats.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/cleaning/components/CleaningStats.tsx`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/cleaning/hooks/useCleaningExport.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/cleaning/utils/cleaningRecordPrintStyles.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/cleaning/utils/formatCleaningScheduleForPrint.ts`
**Description:** Found 61 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/cogs/components/COGSTableGrouped/components/COGSTableMobile.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/cogs/components/COGSTableGrouped/hooks/useRecipeGrouping.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/cogs/components/IngredientsList.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/cogs/hooks/useIngredientConversion.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/cogs/utils/exportCOGSAnalysis/htmlFormatting.ts`
**Description:** Found 75 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/cogs/utils/printCOGSAnalysis/formatCostTable.ts`
**Description:** Found 59 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/cogs/utils/printCOGSAnalysis/formatPricing.ts`
**Description:** Found 24 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/compliance/components/AllergenOverview/components/AllergenTable.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/compliance/components/AllergenOverview/hooks/useAllergenExport.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/compliance/utils/complianceReportPrintStyles.ts`
**Description:** Found 21 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/compliance/utils/exportComplianceRecords/formatRecords.ts`
**Description:** Found 37 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/compliance/utils/printComplianceReport/formatRecords.ts`
**Description:** Found 47 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/compliance/utils/printComplianceReport/formatSummary.ts`
**Description:** Found 17 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/components/RecipeReadiness.tsx`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/components/TemperatureStatus.tsx`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/UpcomingFunctionsWidget.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/hooks/useKeyboardShortcuts.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/hooks/useKitchenAlertsData/fetchStats.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/hooks/useKitchenAlertsHelpers.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/hooks/useKitchenChartsData/index.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/hooks/useKitchenStats.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/hooks/useNavigationActive.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/hooks/useRecipeReadiness.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/components/navigation/BottomNavBar.tsx`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/navigation/ExpandableCategorySection.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/navigation/FloatingActionButton.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/navigation/NewButton.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/navigation/PersistentSidebar/components/PrimaryItemsSection.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/navigation/PersistentSidebar/hooks/useCategoryExpansion.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/components/navigation/SearchModal.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/dish-builder/components/hooks/useRecipeLoading.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/dish-builder/components/hooks/useSaveHandler.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/equipment/[id]/page.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/functions/[id]/components/RunsheetAddForm.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/functions/[id]/components/RunsheetAddFormMealLink.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/functions/[id]/components/RunsheetItemRow.tsx`
**Description:** Found 20 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/functions/[id]/components/RunsheetItemRowEditForm.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/functions/components/MiniCalendarPanel.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/functions/page.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/guide/components/GuideNavigation.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/guide/components/formats/components/ScreenshotAnnotations.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/guide/components/formats/hooks/useOverlayPosition.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/guide/data/guides.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/guide/hooks/useGuideEngagementTracking.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/guide/page.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/components/FilterDropdown.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/ingredients/components/IngredientTableRow.tsx`
**Description:** Found 17 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/ingredients/components/IngredientWizard.tsx`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/components/IngredientWizardStep4.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/components/StorageCombobox.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/components/SupplierCombobox.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/components/hooks/useAllergenDetection.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/components/hooks/useBulkAllergenDetection.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/components/hooks/useCSVParser.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/hooks/helpers/handleIngredientInsert.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/hooks/useIngredientBulkUpdate/helpers/handleCategorizeAll.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/hooks/useIngredientBulkUpdateHandlers.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/hooks/useIngredientData.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/hooks/useIngredientDelete.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/hooks/useIngredientEditSave.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/hooks/useIngredientMigration.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/ingredients/hooks/useIngredientUpdate.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/CategoryHeader.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/IngredientPopover/hooks/useIngredientData/helpers/fetchDishIngredients.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/IngredientPopover/hooks/useIngredientData/helpers/fetchRecipeIngredients.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/IngredientPopover/hooks/useIngredientData.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuCard.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuCategoriesList.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuCategory.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuDisplayView.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuEditor/hooks/useMenuLockManagement/helpers/useLockStatusSync.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuItemHoverStatistics/hooks/useStatisticsLoading/helpers/fetchStatistics.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuLockedView/components/AllergenMatrixTable.tsx`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuLockedView/components/RecipeCardsView/RecipeCardsView.tsx`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuLockedView/components/RecipeCardsView/hooks/useRecipeCards/helpers/updateCards.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/menu-builder/components/MenuStatisticsPanel.tsx`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/MenuUnlockChangesDialog/hooks/useDialogFocusTrap.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/SortableMenuItem/hooks/useMenuItemStatistics.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/components/hooks/helpers/useCategoryRename.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/utils/formatMenuForPrint/helpers/generateAllergenMatrix.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/menu-builder/utils/generateDescriptions.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/menu-builder/utils/menuPrintStyles/customerVariant.ts`
**Description:** Found 20 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/menu-builder/utils/menuPrintStyles/defaultStyles.ts`
**Description:** Found 64 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/menu-builder/utils/menuPrintTemplate/styles/helpers/backgroundStyles.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/menu-builder/utils/menuPrintTemplate/styles/helpers/contentStyles.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/order-lists/components/MenuIngredientsTable.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/order-lists/utils/exportOrderLists/helpers/formatOrderListForExport.ts`
**Description:** Found 49 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/order-lists/utils/orderListPrintStyles.ts`
**Description:** Found 32 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/order-lists/utils/printOrderList/helpers/generateOrderHeader.ts`
**Description:** Found 28 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/order-lists/utils/printOrderList/helpers/generateOrderItemsTable.ts`
**Description:** Found 39 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/par-levels/utils/exportParLevels/helpers/formatParLevelsForExport.ts`
**Description:** Found 38 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/par-levels/utils/printParLevels.ts`
**Description:** Found 52 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/performance/components/PerformanceActions.tsx`
**Description:** Found 49 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/performance/components/PerformanceEmptyState.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/performance/components/PerformanceHeader.tsx`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/performance/components/PerformanceInsights.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/performance/hooks/usePerformanceData.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/performance/utils/formatPerformanceReportForPrint/helpers/generateItemsSection.ts`
**Description:** Found 62 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/performance/utils/formatPerformanceReportForPrint/helpers/generateSummarySection.ts`
**Description:** Found 27 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/performance/utils/printPerformanceReport/helpers/generateItemsSection.ts`
**Description:** Found 60 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/performance/utils/printPerformanceReport/helpers/generateSummarySection.ts`
**Description:** Found 23 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/prep-lists/components/PrepListAggregatedView.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/prep-lists/components/PrepListRecipeGroupedView.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/prep-lists/components/hooks/usePrepListPreview/prepDetailsLoading.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/prep-lists/utils/formatPrepList.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/AllergenFilterDropdown.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/recipes/components/DeleteConfirmationModal.tsx`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/DishIngredientCombobox.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/DishPreviewModal.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/DishesListView.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/KitchenTimer.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/RecipeIngredientsList.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/recipes/components/RecipeIngredientsList.tsx`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/recipes/components/RecipePreviewInstructions.tsx`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/recipes/components/RecipePreviewModal.tsx`
**Description:** Found 54 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/recipes/components/SuccessMessage.tsx`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/UnifiedRecipeModal.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/UnifiedRecipesDishes.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/hooks/useDishesClientData.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/hooks/useDishesClientRecipePricing.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/hooks/useDishesClientViewMode.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/hooks/usePriceCalculationEffect.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/components/hooks/useRecipeEditIngredientLoading.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/useAIInstructions.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/useDishCostCalculation.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/useDishFormData.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/useDishPreviewModalData.ts`
**Description:** Code has 9 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/useDishSidePanelData.ts`
**Description:** Code has 9 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/useRecipeMetadataSubscription.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/utils/calculateVisiblePricesBatch.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/utils/calculateVisiblePricesFallback.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/hooks/utils/updateVisiblePricesWithDebounce.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/recipes/utils/helpers/buildRecipePrintHTML.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/recipes/utils/helpers/formatRecipeForExport.ts`
**Description:** Found 15 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/recipes/utils/printRecipes.ts`
**Description:** Found 31 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/recipes/utils/recipePrintStyles.ts`
**Description:** Found 24 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/roster/components/RosterBuilder/components/RosterCell.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/backup/components/BackupList.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/backup/components/RestoreDialog.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/AdaptiveNavSettingsPanel.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/AvatarSelectionPanel.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/ConnectedAccountsPanel.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/ImportExportHistoryPanel.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/PersonalitySettingsPanel.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/RegionSelector.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/SettingsNavigation/components/NavigationSidebar.tsx`
**Description:** Code has 9 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/SettingsNavigation/hooks/useKeyboardNavigation.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/SystemInformationPanel.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/components/sections/FeatureFlagsSection.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/settings/page.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/setup/components/SetupProgress.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/specials/components/RecipeCard.tsx`
**Description:** Found 22 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/specials/hooks/useSpecialsData.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/square/components/sections/OverviewSection.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/square/page.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/staff/components/OnboardingWizard/hooks/useWizardSubmission.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/staff/components/StaffCard.tsx`
**Description:** Found 19 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/suppliers/hooks/useSupplierImportProcessor.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/suppliers/utils/helpers/formatSuppliersForExport.ts`
**Description:** Found 51 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/suppliers/utils/printSuppliers.ts`
**Description:** Found 61 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/temperature/components/EquipmentMobileCard.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/temperature/components/TemperatureAnalyticsTab.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/temperature/components/TemperatureLogsTab.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/temperature/components/utils.test.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/temperature/hooks/useEquipmentLogs.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/temperature/hooks/useSampleDataGeneration.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/temperature/hooks/useTemperatureLogHandlers.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/temperature/utils/chart-formatters.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `app/webapp/temperature/utils/helpers/buildTemperatureLogsPrintHTML.ts`
**Description:** Found 67 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/temperature/utils/helpers/formatTemperatureLogsForExport.ts`
**Description:** Found 39 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `app/webapp/temperature/utils/temperatureLogPrintStyles.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `app/webapp/time-attendance/components/hooks/useGeofence.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `app/webapp/time-attendance/page.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/admin-audit.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/ai/cache/ai-cache.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/ai/huggingface-client/helpers/generateImage.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/ai/huggingface-client/helpers/processImageResult.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/ai/prompts/performance-insights.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/allergens/allergen-aggregation/helpers/batchProcessRecipeAllergens.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/analytics/trackers/conversionTracker.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/analytics/trackers/helpers/clickHandler.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/analytics/trackers/helpers/scrollHandler.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/analytics/trackers/performanceTracker.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/api-error-handler/supabaseErrorParser.ts`
**Description:** Found 13 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/api-error-handler.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/auth0/helpers/createAuth0Client.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/autosave-storage.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/autosave-sync/databaseSync.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/backup/restore/helpers/insert-records.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/backup/restore/helpers/merge-records.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/billing-sync/helpers/processSingleSubscription.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/constants.ts`
**Description:** Found 21 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/css-optimization.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/csv/csv-utils/helpers/validateCSV.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/curbos/tier-access.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/data/ingredients.ts`
**Description:** Found 83 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/data/recipe-ingredients.ts`
**Description:** Found 73 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/data/recipes.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/data-retention/cleanup.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/data-transfer/country-detection.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/dietary/dietary-aggregation/dish-aggregation/helpers/fetchDishIngredients.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/dietary/dietary-aggregation/recipe-aggregation.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/error-learning/fix-storage.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/error-learning/rule-generator/synthesizeRule.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/error-learning/rule-generator.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/exports/components/ThemePreview.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/exports/pdf-template/helpers/getLogo.ts`
**Description:** Found 19 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/exports/template-styles/helpers/baseStyles/getBackgroundElementsCSS.ts`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/exports/template-styles/helpers/getThemeBackgroundCSS.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/exports/template-styles/helpers/variantStyles/data/matrixVariantCSS.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/exports/template-styles/helpers/variantStyles/data/recipeVariantCSS.ts`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/exports/themes.ts`
**Description:** Found 21 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/ingredients/migrate-to-standard-units.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/landing-styles.ts`
**Description:** Found 68 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/logger/logEntry/helpers/safeStringify.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/personality/footer-easter-egg.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/personality/hooks/helpers/useAchievementHooks/helpers/createAchievementHook.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/personality/hooks.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/personality/mise-en-place.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/populate-helpers/basic-data.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/populate-helpers/customers-data.ts`
**Description:** Found 36 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/populate-helpers/generate-sales-data.ts`
**Description:** Found 25 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/populate-helpers/index.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/populate-helpers/menus-data-helpers.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/populate-helpers/other-data.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/populate-helpers/populate-staff.ts`
**Description:** Found 31 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/populate-helpers/temperature-data.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/qr-codes/qr-print-template.ts`
**Description:** Found 11 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/recipes/config.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/recipes/parsers/schema-validator.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/recipes/utils/ai-extractor.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/recipes/utils/error-categorizer-rules.ts`
**Description:** Found 18 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/recipes/utils/sitemap-parser.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/architecture-analysis/anti-patterns.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/auto-fix/fix-orchestrator.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/auto-fix/providers/console-cleanup-provider.ts`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/auto-fix/providers/eslint-fix-provider.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/auto-refactoring/codemods/extract-function.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/auto-refactoring/codemods/zod-standardization.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/auto-refactoring/validation-suite.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/meta-learning/knowledge-synthesizer.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/meta-learning/learning-strategy.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/orchestrator.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/predictive-analysis/bug-predictor.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/predictive-analysis/index.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/rule-evolution/rule-generator.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/rsi/rule-evolution/rule-manager.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/sample-ingredients-updated.ts`
**Description:** Found 55 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/sample-recipes-clean.ts`
**Description:** Found 33 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/sample-suppliers-clean.ts`
**Description:** Found 81 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/services/roster/templateService.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/square/sync/catalog/helpers/mapping.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/square/sync/costs/helpers/updateSquareItem.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/square/sync/orders/helpers/fetchOrders.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/square/sync/orders/helpers/processOrders.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/supabase.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `lib/translations/de-DE.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/translations/en-AU.ts`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Magic Numbers (MEDIUM)

**File:** `lib/unit-conversion/unitMappings.ts`
**Description:** Found 58 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `lib/useTranslation.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `lib/weather/venue-coordinates.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/Arcade/WebAppBackground.tsx`
**Description:** Found 21 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/DevelopmentServiceWorkerCleanup.tsx`
**Description:** Code has 9 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/EasterEggs/TomatoToss.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/EasterEggs/useTomatoTossGame.ts`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ErrorGame/useKitchenFireGame.ts`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/ExitIntentPopup.tsx`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/GlobalWarning.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/GlobalWarning.tsx`
**Description:** Found 32 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/Loading/CatchTheDocketOverlay.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/PageTransitions.tsx`
**Description:** Found 12 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/ScrollTracker.tsx`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/pricing/CurbOSPricing.tsx`
**Description:** Found 30 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/ui/ActionButtonGroup.tsx`
**Description:** Code has 8 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/ui/ApiErrorDisplay.tsx`
**Description:** Found 45 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/ui/ConfirmDialog.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/EditDrawer.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/ErrorBoundary.tsx`
**Description:** Code has 7 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/ExportButton.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/ExportOptionsModal.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/FloatingParticles.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/FoodImageDisplay.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/LightweightChart.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/ui/LightweightChart.tsx`
**Description:** Found 14 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/ui/ResponsiveCardActions.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/ui/ResponsiveCardActions.tsx`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/ui/ResponsiveCardActionsMenu.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/ShareButton.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Spaghetti Code (HIGH)

**File:** `components/ui/SubscriptionStatusBanner.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/ui/Toast.tsx`
**Description:** Found 16 magic numbers
**Suggestion:** Extract magic numbers to named constants

### Spaghetti Code (HIGH)

**File:** `components/ui/WebappBackground.tsx`
**Description:** Code has 6 levels of nesting
**Suggestion:** Extract nested logic into separate functions

### Magic Numbers (MEDIUM)

**File:** `components/ui/WebappBackground.tsx`
**Description:** Found 24 magic numbers
**Suggestion:** Extract magic numbers to named constants

## 🧩 Design Patterns Usage

**lib/css-optimization.ts**

- **Singleton** (creational): Ensures a class has only one instance

**lib/gamification/events.ts**

- **Observer** (behavioral): One-to-many dependency between objects

**lib/personality/footer-easter-egg.ts**

- **Observer** (behavioral): One-to-many dependency between objects

**lib/personality/mise-en-place.ts**

- **Observer** (behavioral): One-to-many dependency between objects

**lib/rsi/meta-learning/learning-strategy.ts**

- **Strategy** (behavioral): Defines family of algorithms, makes them interchangeable

**lib/types/cogs.ts**

- **Strategy** (behavioral): Defines family of algorithms, makes them interchangeable

## 🏗️ Structural Integrity

✅ **Structural Checks Passed**

```

> curbos@0.6.7 check:architecture
> tsx scripts/check-architecture.ts

🏗️  The Architect: Starting Architectural Scan...

🔄 Checking for Circular Dependencies...
✅ No circular dependencies found.

🛡️  Checking Client/Server Boundaries...
Scanning 2755 files for boundaries...
✅ Client/Server boundaries respected.

📚 Checking Lib vs Components Boundaries...

📡 Checking API Boundaries...
✅ API boundaries respected.

🧩 Checking Feature Isolation in webapp...

✅ The Architect approves this code.

```
