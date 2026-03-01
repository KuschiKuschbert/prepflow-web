# Skill Learning System

Skills can evolve automatically from error-learning and RSI (Recursive Self-Improvement) insights.

## Overview

- **Evolvable skills**: Skills with `evolvable: true` in frontmatter can receive proposed updates.
- **Sources**: `docs/errors/knowledge-base.json` (error patterns) and `docs/rsi/improvements.json` (RSI history).
- **Mapping**: `docs/skill-learning/skill-mapping.json` maps pattern IDs and RSI types to skill names.
- **Staging**: Proposals are written to `docs/skill-learning/proposed/{skill-name}.md` for review before merging.

## Current State

_Auto-generated at 2026-03-01T06:15:23.236Z_

**Evolvable skills:** 5

- prepflow-craft
- prepflow-error-recovery
- prepflow-guardian
- prepflow-kitchen-domain
- prepflow-self-improve

**Pending proposals:** 0

- (none)

**Mapping:** 5 error patterns, 6 RSI types

## When Evolution Runs

- **Error-learning workflow**: After CI succeeds (errors were fixed), rule generation runs and proposes skill updates for mapped patterns.
- **RSI nightly**: `npm run rsi:run` includes `skill:evolve`, which processes both error-learning and RSI insights.
- **Manual**: Run `npm run skill:evolve` to process learnings and generate proposals.

## Commands

| Command                              | Description                                                      |
| ------------------------------------ | ---------------------------------------------------------------- |
| `npm run skill:evolve`               | Process error-learning + RSI, generate skill proposals           |
| `npm run skill:status`               | List evolvable skills, pending proposals, mapping stats          |
| `npm run skill:review`               | Show proposed changes and paths for manual review                |
| `npm run skill:merge`                | Merge proposal(s) into live skills (`<name>` or `--all`)         |
| `npm run skill:map-suggest`          | Suggest skill-mapping.json entries for unmapped patterns         |
| `npm run skill:map-apply`            | Apply suggestions to skill-mapping.json (`--dry-run` to preview) |
| `npm run skill:evolve -- --auto-map` | Evolve and auto-apply mapping suggestions                        |

## Review and Merge

1. Run `npm run skill:review` to see proposed files.
2. Diff proposed vs current: `diff .agent/skills/prepflow-error-recovery/SKILL.md docs/skill-learning/proposed/prepflow-error-recovery.md`
3. Merge: `npm run skill:merge prepflow-error-recovery` or `npm run skill:merge --all` (copies proposal to live skill and removes proposal).

The system will not re-propose patterns that are already present in the skill (checks for existing "## Learned:" section).

## Configuration

- **docs/skill-learning/config.json**: `minFixCount` (default 3), `minRsiConfidence` (default 0.8).
- **docs/skill-learning/skill-mapping.json**: Add `errorPatterns` (patternId -> skill) and `rsiTypes` (RSI type -> skill).

Non-evolvable skills (standards, say-no, merge-ready, leave-better) are never auto-updated.
