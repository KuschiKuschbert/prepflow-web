---
description: Naming conventions, file conventions, import ordering, comment style for PrepFlow code
globs: app/**, lib/**, components/**
---

# Style — Naming, File Conventions, Import Ordering & Comment Style

## File Naming

| Type                | Convention                | Example                             |
| ------------------- | ------------------------- | ----------------------------------- |
| React components    | PascalCase.tsx            | `RecipeCard.tsx`                    |
| Hooks               | camelCase prefixed `use`  | `useIngredientForm.ts`              |
| Utilities / helpers | kebab-case.ts             | `build-query.ts` or `buildQuery.ts` |
| API routes          | always `route.ts`         | `app/api/ingredients/route.ts`      |
| Test files          | same name + `.test.ts`    | `buildQuery.test.ts`                |
| Type files          | `types.ts` or `.types.ts` | `ingredient.types.ts`               |
| Constant files      | kebab-case                | `allergen-codes.ts`                 |
| Page files          | always `page.tsx`         | `app/webapp/recipes/page.tsx`       |
| Layout files        | always `layout.tsx`       | `app/webapp/layout.tsx`             |

**Note:** Helper files under API routes (`helpers/`) follow camelCase for files that export a single function (`processRestore.ts`) and kebab-case for multi-export utilities.

## Symbol Naming

| Symbol                      | Convention                    | Example                                               |
| --------------------------- | ----------------------------- | ----------------------------------------------------- |
| React components            | PascalCase                    | `RecipeCard`, `IngredientForm`                        |
| Functions                   | camelCase + verb              | `fetchIngredients`, `buildQuery`, `handleDelete`      |
| Constants                   | UPPER_SNAKE_CASE              | `MAX_BATCH_SIZE`, `DEFAULT_PAGE_SIZE`                 |
| Types / interfaces          | PascalCase                    | `IngredientRow`, `ApiResponse<T>`                     |
| Enum values                 | UPPER_SNAKE_CASE              | `SubscriptionTier.STARTER`                            |
| CSS classes                 | Tailwind utilities only       | no custom class names unless in `globals.css`         |
| React context               | PascalCase + `Context` suffix | `NotificationContext`                                 |
| React hooks (return values) | camelCase                     | `const { showConfirm, ConfirmDialog } = useConfirm()` |

## Import Ordering

Imports MUST follow this order (Prettier + ESLint enforce this):

```typescript
// 1. React / Next.js core
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 2. Third-party libraries
import { z } from 'zod';
import { supabase } from '@supabase/supabase-js';

// 3. Internal lib/ utilities (absolute paths with @/ alias)
import { logger } from '@/lib/logger';
import { ApiErrorHandler } from '@/lib/api-error-handler';

// 4. Internal components (absolute paths)
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// 5. Internal hooks
import { useConfirm } from '@/hooks/useConfirm';
import { useNotification } from '@/contexts/NotificationContext';

// 6. Relative imports (same directory or subdirectory)
import { buildQuery } from './helpers/buildQuery';
import type { IngredientRow } from './types';
```

## Comment Style

**Do not add comments that narrate what the code does.** Comments explain non-obvious intent, constraints, or trade-offs only.

```typescript
// ❌ Bad — narrates the code
// Increment the counter
count++;

// ❌ Bad — states the obvious
// Return the result
return data;

// ✅ Good — explains a non-obvious constraint
// Supabase query builders are not Promises until awaited — never chain .catch()
const { data, error } = await supabase.from('table').select();

// ✅ Good — explains a trade-off
// Using sessionStorage (not localStorage) so cache clears on tab close,
// preventing stale data across login sessions
sessionStorage.setItem(key, JSON.stringify(value));
```

## JSDoc Rules

All exported functions, components, and hooks MUST have JSDoc. Internal helpers are encouraged but not required.

```typescript
/**
 * Fetches a paginated list of ingredients for the current user.
 *
 * @param page - 1-indexed page number
 * @param pageSize - number of items per page (default 20, max 100)
 * @returns paginated list with total count
 */
export async function fetchIngredients(page: number, pageSize = 20) { ... }
```

Required fields: description, `@param` for all parameters, `@returns` for return values.
Optional: `@throws`, `@example`, `@see`, `@deprecated`.

## TypeScript Rules

- **Strict mode** is on — no implicit `any`
- If `any` is genuinely necessary: add a comment explaining why
- **Ref types in interfaces:** always `RefObject<HTMLElement | null>`, never `RefObject<HTMLElement>`
- **Params in API routes:** always `context: { params: Promise<{ id: string }> }` and `await context.params`
- **Zod validation:** required for all POST/PUT/PATCH route bodies
- Prefer explicit return types on exported functions

## `"use client"` Directive

Add `"use client"` to any file that:

- Uses React hooks (`useState`, `useEffect`, `useRef`, etc.)
- Uses browser APIs (`window`, `localStorage`, `document`)
- Uses event handlers in JSX

Server components (no directive) can fetch data directly but cannot use hooks.

## Prettier Settings (enforced on save and commit)

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## Tailwind Class Ordering

Managed automatically by `prettier-plugin-tailwindcss`. Never manually reorder Tailwind classes.

## "use client" / Server Component Split

Default to **server components** (no directive). Only add `"use client"` when the component needs interactivity or browser APIs. This optimizes bundle size.

## Barrel Exports

Use `index.ts` barrel exports only when a directory has 3+ exported items that are consumed together. Don't create barrels for single-export directories — import directly.
