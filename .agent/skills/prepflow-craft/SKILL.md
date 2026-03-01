---
name: prepflow-craft
description: Ensures changes feel finished and consistent for users. Use when adding or changing anything users see or touch.
evolvable: true
---

# PrepFlow Craft Protocol

Changes must feel finished. No half-done states, no placeholder copy.

## When to use this skill

- Adding or changing UI
- Anything users see or touch
- New pages, forms, lists, dialogs

## Checklist

- **Empty states**: List/table pages have proper empty-state UI when no data
- **Loading states**: Use LoadingSkeleton or appropriate loading indicators
- **Error states**: Clear, actionable error messages (PrepFlow voice)
- **Copy**: No lorem, no placeholder text, no raw "TODO" in user-facing strings
- **Consistency**: Similar screens use similar patterns

## Docs Hygiene

- One-off fix docs belong in `docs/archive/`, not root `docs/`
- Only canonical docs should live in `docs/` -- referenced by `.cursor/rules/*.mdc` or `AGENTS.md`
- When creating docs, check if similar doc already exists in `docs/archive/`

## Key References

- [docs/VOICE_ENHANCEMENT_GUIDE.md](docs/VOICE_ENHANCEMENT_GUIDE.md) - PrepFlow voice for copy
- [docs/VISUAL_HIERARCHY_STANDARDS.md](docs/VISUAL_HIERARCHY_STANDARDS.md) - Visual hierarchy
- [.cursor/rules/dialogs.mdc](.cursor/rules/dialogs.mdc) - Dialog voice and patterns

## Learned: RSI: lint-fix

_Auto-learned from rsi (pattern: lint-fix)_

### Detection

RSI improvement type: lint-fix

### Fix

Fixes of type 'lint-fix' have a 100.0% success rate across 2 attempts.

### Prevention

Apply lint-fix pattern when similar context arises

## Style Guide

- Details matter. If it ships, it should feel intentional and finished.
