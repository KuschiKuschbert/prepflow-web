---
description: AI self-improvement protocol - context handoff, skill updates, bug memory, decision logging, session-end checklist
alwaysApply: true
---

# AI Self-Improvement & Context Hygiene

Context Hygiene — Mid-Task Handoff Without Losing Thread

## When to Summarize

Summarize your context when:

- Approaching context limit (>80% of token window used)
- Switching from one domain to another during a multi-domain task
- Pausing a long-running task (user says "continue later")
- Handing off to a sub-agent

## Handoff Checkpoint Template

When you need to pause or hand off, produce a checkpoint block:

```
## CHECKPOINT: [Task Name]
**Branch:** improvement/task-name
**Last Commit:** [commit hash + message]
**Phase:** [current phase]
**Domain Completed:** [list of domains fully done]
**Current Domain:** [domain being worked on]
**Current File:** [last file modified]
**Files Modified This Domain:** [list]
**Files Remaining This Domain:** [list or "unknown — search needed"]
**Known Issues / Blockers:** [anything that went wrong or needs human input]
**Next Step:** [exact first action to take on resume]
**TECH_DEBT Items Added:** [any new items logged to TECH_DEBT.md]
```

## Resume Protocol

When resuming a paused task:

1. Read the checkpoint block above
2. Run `git log --oneline -10` to confirm last commit
3. Run `git status` to confirm clean tree
4. Verify the current branch: `git branch --show-current`
5. Continue from "Next Step" in the checkpoint

## Sub-Agent Handoff

When spawning a sub-agent for a specific domain:

- Pass the checkpoint block in the prompt
- Specify exactly which files to touch
- Specify the commit message format
- Ask the sub-agent to produce a checkpoint on completion

Never split tasks that share mutable state (e.g., a single file being modified by two agents simultaneously).

## Context Compression Rules

When summarizing long context, preserve:

1. The branch name and last commit
2. The list of completed domains
3. The exact next file/action
4. Any TECH_DEBT items identified
5. Any patterns discovered that differ from the rules

Drop from context:

- Full file contents already committed
- Error messages that were resolved
- Intermediate reasoning steps

## Domain Completion Checklist

Before marking a domain as complete:

- [ ] All files in domain reviewed
- [ ] Improvements applied (or skipped with reason in TECH_DEBT.md)
- [ ] RETROFIT LOG in domain's SKILL.md updated
- [ ] Committed: `refactor(domain): apply skill standards`
- [ ] No lint errors introduced (run `npm run lint` on changed files)

## Context Window Warning Signs

Stop and produce a checkpoint if:

- You notice you're repeating yourself
- You can't recall what was done 10+ steps ago
- The response is getting very long without a commit
- You're unsure if a file was already processed

---

Meta-Skill — Self-Improvement Protocol

After every non-trivial task, execute this protocol before closing the session.

## 1. SKILL UPDATE CHECK

Did this task reveal an undocumented pattern, constraint, or workflow?

- If yes: open the relevant `.cursor/rules/` file or domain `SKILL.md` and append it
- If it's a new domain with no skill file: create one following the SKILL.md template in `sub-agent-orchestration.md`
- If it's a cross-cutting concern: add to `decisions.md`

**Trigger:** Any time you say "I noticed that..." or "turns out..." — that's a skill update.

## 2. BUG MEMORY

If a fix took 2+ iterations (you tried something, it failed, you tried again):

Append to the relevant `SKILL.md` under `## GOTCHAS`:

```
[YYYY-MM-DD] BUG: [brief description]
ROOT CAUSE: [what was actually wrong]
FIX: [what resolved it]
PREVENTION: [what rule prevents this in future]
```

Also check `docs/TROUBLESHOOTING_LOG.md` — if it's a new error, document it there too.

## 3. DECISION LOG

If you made an architectural choice (chose approach A over B, decided to skip something, picked a library):

Append to `.cursor/rules/decisions.md`:

```
## [YYYY-MM-DD] Brief Decision Title
**Decision:** What was chosen
**Reasoning:** Why
**Consequence:** What this means going forward
```

## 4. NEVER REPEAT

Before starting any task:

1. Check `forbidden.md` — is any part of the task in the forbidden list?
2. Check `error-patterns.mdc` — has this error been seen before?
3. Check the domain SKILL.md `## GOTCHAS` section — any known traps?

If a known issue exists: apply the documented fix immediately, don't rediscover it.

## 5. NEW SKILL TRIGGER

If you perform the same type of task 3+ times without a skill file for it:

- Create a SKILL.md for that task type
- Add it to `.cursor/SKILLS_INDEX.md`
- Location: in the most relevant directory (e.g., `lib/square/SKILL.md` for Square sync tasks)

## 6. FILE RETROFIT

If you edit an existing file and notice it violates `style.md` or `forbidden.md`:

- Fix the violation in the same commit
- Add the file to the domain SKILL.md's `## RETROFIT LOG`

Exception: if the fix would be large enough to obscure the original change, create a separate commit: `refactor(domain): apply style standards to [filename]`

## 7. SESSION END CHECKLIST

Before ending any session where files were modified:

```bash
git status          # Confirm nothing uncommitted
git log --oneline -5  # Confirm commits look right
npm run lint        # No new lint errors
npm run type-check  # No new TypeScript errors
```

If lint or type-check fail on files you modified: fix before ending the session.

## 8. TECH DEBT LOGGING

If you found an issue but couldn't safely fix it:

- Add to `.cursor/TECH_DEBT.md` immediately
- Format: `| File | Issue | Why Not Auto-Fixed | Effort | Priority |`
- Never leave "I noticed but didn't fix" undocumented

## Self-Improvement Metrics

Track these in `docs/DEV_LOG.md` at session end:

- Files modified
- Domains covered
- Skills updated
- New GOTCHAS documented
- Tech debt items added
