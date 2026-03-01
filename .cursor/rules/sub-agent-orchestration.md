---
description: Multi-agent orchestration patterns for complex tasks requiring parallel subagents
globs: scripts/**
---

# Sub-Agent Orchestration — When to Spawn, How to Hand Off

## When to Spawn Sub-Agents

**Spawn sub-agents when:**

- Changes span 4+ unrelated domains with clear independent contracts
- A domain has 50+ files to process and can be fully isolated
- Parallel read-only exploration of multiple directories speeds up discovery
- A specific technical task has a well-defined input and output (e.g., "generate SKILL.md for Square domain")

**Never split tasks that:**

- Share mutable state (two agents writing to the same file)
- Have sequential dependencies (agent B needs agent A's output)
- Require human approval at intermediate steps
- Involve git operations (only one agent should commit at a time)

## Sub-Agent Prompt Template

When spawning a sub-agent, always include:

```
## TASK: [specific task]
## BRANCH: improvement/skill-audit (already checked out)
## CONTEXT:
[Paste the relevant checkpoint block from context-hygiene.md]

## YOUR JOB:
[Specific files or directories to process]
[Specific improvements to apply]
[Commit message to use when done]

## OUTPUT REQUIRED:
[What to return — checkpoint block, list of files modified, TECH_DEBT items]

## CONSTRAINTS:
- Never modify app/curbos/ or app/curbos-import/ without ALLOW_CURBOS_MODIFY=1
- Never modify migrations/ or package-lock.json
- Follow all rules in .cursor/rules/
- If unsure about a change, add to TECH_DEBT.md instead
```

## Domain SKILL.md Template

Every domain that gets a skill file follows this structure:

```markdown
# [DOMAIN] SKILL

## PURPOSE

When to load this skill. One sentence: "Load when working on [domain] features,
which covers [what it includes]."

## HOW IT WORKS IN THIS CODEBASE

- Key files and their roles (reference real paths)
- Data flow / request lifecycle
- Key patterns specific to this domain

## STEP-BY-STEP

Numbered steps for the most common task in this domain.
Reference real file paths and patterns.

## GOTCHAS

Known bugs, edge cases, non-obvious constraints.
Format:
[YYYY-MM-DD] BUG: description → ROOT CAUSE: ... → FIX: ...

## REFERENCE FILES

3-5 real examples that demonstrate the correct pattern for this domain.

- `path/to/file.ts` — what it demonstrates

## RETROFIT LOG

Files that have been updated to match this skill's standards.
Format: `[YYYY-MM-DD] path/to/file.ts — what was changed`

## LAST UPDATED

[YYYY-MM-DD]
```

## Parallel Discovery Pattern

For large-scale codebase exploration (like Phase 1 of the skill audit):

```
Agent A: Explore app/api/ + app/webapp/ (routes, patterns)
Agent B: Explore lib/ (utilities, integrations)
Agent C: Explore hooks/ + components/ (shared code patterns)
Agent D: Explore scripts/ + e2e/ (tooling, tests)
```

All four run simultaneously, each returns their findings. Parent agent synthesizes.

## Sequential Domain Processing Pattern

For Phase 3 (retroactive improvements), process one domain at a time:

```
1. Load domain SKILL.md
2. List all files in domain
3. Process each file (apply improvements from style.md, forbidden.md)
4. Update RETROFIT LOG in SKILL.md
5. Commit: refactor(domain): apply skill standards
6. Produce checkpoint
7. Move to next domain
```

Never jump to domain N+2 without committing domain N+1.

## Context Budget Management

| Task Type                | Recommended Agent Count   | Why                       |
| ------------------------ | ------------------------- | ------------------------- |
| Single file fix          | 1 (parent)                | Simple, no need to spawn  |
| Domain SKILL.md creation | 1 (fast sub-agent)        | Well-scoped               |
| Phase 1 discovery        | 4 parallel                | Large read-only task      |
| Phase 3 domain retrofit  | 1 per domain (sequential) | Needs git commits between |
| Full test run            | 1 shell agent             | Sequential by nature      |

## Output Standards for Sub-Agents

Sub-agents MUST return:

1. Checkpoint block (from `context-hygiene.md` template)
2. List of files modified
3. List of TECH_DEBT items added (if any)
4. Commit hash (if they made a commit)
5. Any patterns discovered that differ from existing rules
