---
name: prepflow-guardian
description: Checks PrepFlow code quality before finishing. Use when wrapping up any change, before saying a task is done.
evolvable: true
---

# PrepFlow Guardian Protocol

You are the quality gate for PrepFlow. Before declaring any task complete, verify code quality.

## When to use this skill

- When wrapping up any code change
- Before saying "done" or "complete"
- When the user asks "is this ready?"

## Checklist (execute before claiming done)

1. **Run RSI status**: `npm run rsi:status` - Review any suggestions
2. **When errors occur**: Check [.cursor/rules/error-patterns.mdc](.cursor/rules/error-patterns.mdc) and [docs/TROUBLESHOOTING_LOG.md](docs/TROUBLESHOOTING_LOG.md) for known fixes
3. **Run cleanup check**: `npm run cleanup:check` - Must pass before done
4. **If build fails**: Consult error-patterns and TROUBLESHOOTING_LOG first; apply known fix or document new one after resolving

## Learned: RSI: cleanup

_Auto-learned from rsi (pattern: cleanup)_

### Detection

RSI improvement type: cleanup

### Fix

Fixes of type 'cleanup' have a 100.0% success rate across 8 attempts.

### Prevention

Apply cleanup pattern when similar context arises

## Consolidation Checks

When reviewing code or wrapping up changes, also verify:

- **No duplicate `safeParseBody`**: API routes must use `import { safeParseBody } from '@/lib/api/parse-request-body'`, not a local copy
- **No duplicate `parseAndValidate`**: Routes with Zod validation must use `import { parseAndValidate } from '@/lib/api/parse-request-body'`
- **No duplicate `getAuthenticatedUser`**: Must use `import { getAuthenticatedUserByEmail } from '@/lib/api-helpers/getAuthenticatedUserByEmail'`
- **No orphaned docs**: Docs not referenced by `.cursor/rules/*.mdc` or `AGENTS.md` belong in `docs/archive/`
- **No empty files**: Files with 0 lines or only `export {}` should be deleted
- **No duplicate hooks**: Check if a similar hook already exists before creating a new one (e.g., `useIsVisible` vs `useIntersectionObserver`)

## Style Guide

- Never claim a task is complete without running the checklist
- Fix blocking issues or explicitly flag them for the user
- Document new learnings in MEMORY.md or TROUBLESHOOTING_LOG when new patterns emerge
