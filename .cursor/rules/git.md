---
description: Git workflow - branch naming, commit format (Conventional Commits), safe-merge, pre-deploy checks
globs: .github/**, .husky/**, scripts/safe-merge.sh
---

# Git — Commit Format, Branch Naming, PR Conventions & Safe Merge

## Branch Naming

| Prefix         | Use for                              | Example                          |
| -------------- | ------------------------------------ | -------------------------------- |
| `improvement/` | New features, enhancements           | `improvement/recipe-bulk-delete` |
| `fix/`         | Bug fixes                            | `fix/auth-callback-loop`         |
| `refactor/`    | Code cleanup without behavior change | `refactor/ingredients-helpers`   |
| `chore/`       | Tooling, deps, config                | `chore/update-playwright`        |
| `docs/`        | Documentation only                   | `docs/api-reference`             |

**Never work directly on `main`.** Never push directly to `main`.

## Commit Message Format

Uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type       | Use for                            |
| ---------- | ---------------------------------- |
| `feat`     | New feature                        |
| `fix`      | Bug fix                            |
| `refactor` | Code change without feature or fix |
| `chore`    | Tooling, dependencies, config      |
| `docs`     | Documentation only                 |
| `perf`     | Performance improvement            |
| `test`     | Test additions or changes          |
| `ci`       | CI/CD changes                      |
| `build`    | Build system changes               |
| `revert`   | Reverted commit                    |

### Examples

```
feat(recipes): add bulk delete with optimistic updates
fix(auth): handle Auth0 callback URL redirect loop
refactor(ingredients): extract allergen detection to helpers
chore: update playwright to 1.58.2
docs: add API route reference for menus
```

### Scope (optional but recommended)

Use the domain name: `recipes`, `ingredients`, `menus`, `auth`, `billing`, `square`, `ai`, `backup`, etc.

## Merging

**Always use the safe-merge script:**

```bash
bash scripts/safe-merge.sh
```

This runs all pre-deploy checks (lint, type-check, format, build) before merging to main.

**Never use `git merge` directly to merge feature branches to main** without running safe-merge.

## Pre-commit Hooks (Husky)

The pre-commit hook (`.husky/pre-commit`) runs automatically and checks:

1. Merge conflicts
2. Curbos area protection (blocks modifications to `app/curbos/`)
3. File size limits (`scripts/check-file-sizes.js`)
4. `lint-staged` (Prettier formatting on staged files)

**To bypass in emergencies only:**

```bash
ALLOW_CURBOS_MODIFY=1 git commit --no-verify  # Use sparingly — snapshot commits only
```

## Pre-deployment Checks

Before pushing to `main`, run:

```bash
npm run pre-deploy
```

This runs (in order):

1. `npm run lint`
2. `npm run type-check`
3. `npm run format:check`
4. `npm run audit:scripts`
5. `npm audit --audit-level=moderate`
6. `npm run build`
7. `npm run check:bundle`

All must pass. Fix failures before pushing.

## Commit Checklist

Before committing:

- [ ] Branch created (not on `main`)
- [ ] `npm run format` run (Prettier formats everything)
- [ ] No `console.log` in production code
- [ ] No `any` types without justification
- [ ] File size limits respected
- [ ] Tests pass (`npm test`)
- [ ] No secrets in code

## Useful Commands

```bash
# Check current branch
git branch --show-current

# Stage all changes
git add -A

# Commit with message
git commit -m "feat(ingredients): add unit migration helper"

# Push feature branch and set upstream
git push -u origin HEAD

# Create PR (GitHub CLI)
gh pr create --title "feat(ingredients): add unit migration helper"

# Generate changelog entry
npm run changelog
```

## Protected Files (Never Commit Changes To)

- `package-lock.json` — only npm updates this
- `migrations/*.sql` — existing migrations are immutable
- `.next/` — build output (gitignored)
- `app/curbos/`, `app/curbos-import/` — see CurbOS protection rules in `development.mdc`

## Commit Frequency

Commit often. Small, focused commits are preferred over large omnibus commits:

- One domain per commit during retroactive improvements
- Feature work: commit at logical checkpoints (helper done, component done, tests done)
- Never accumulate more than one domain of changes in a single uncommitted session

## Audit Branch Pattern

For large multi-domain changes (like this skill audit):

1. Commit all in-progress work on current branch
2. `git checkout -b improvement/task-name`
3. Commit domain by domain: `refactor(ingredients): apply skill standards`
4. Review the full diff before merging
5. Merge via `scripts/safe-merge.sh`
