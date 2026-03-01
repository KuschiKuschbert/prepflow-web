---
name: prepflow-leave-better
description: Ensures each change slightly improves the codebase. Use for every edit, refactor, or fix.
---

# PrepFlow Leave-Better Protocol

Every touch should leave the codebase slightly better than before.

## When to use this skill

- Every edit
- Every refactor
- Every fix

## Habits

- **Clean up while changing**: Remove unused imports, fix nearby minor issues in touched files
- **Improve names**: If you touch code with unclear variable/function names, clarify them
- **Document**: Add JSDoc to public functions you modify if missing
- **Extract over inline**: Prefer extracting a small helper over leaving complex inline logic
- **Consolidate while touching**: When touching an API route, check if it has a local `safeParseBody` -- replace with shared module
- **Check for duplicate hooks**: When touching a hook, check if a similar hook already exists
- **Check docs placement**: When creating docs, check if similar doc already exists in `docs/archive/`

## Style Guide

- Low-effort improvements in the same file are expected
- Don't scope creep; stay within the changed area
