---
inclusion: always
---

# AI Context — Always Read First

All context for this codebase lives in `ai-context/` at the repo root.

## Read these every session
- `ai-context/AGENT_INDEX.md` — routing rules, which files to load for which task
- `ai-context/CONTEXT.md` — what the product does, stack, domain vocab, business rules
- `ai-context/LANDMINES.md` — code hazards that cause silent failures
- `ai-context/coding-standards/correct-patterns.md` — patterns to follow
- `ai-context/coding-standards/anti-patterns.md` — patterns to avoid

## Before writing any code
1. Summarize what you understand about the task. Wait for confirmation.
2. Read the files relevant to the task (AGENT_INDEX.md has the routing table).
3. Check LANDMINES.md before touching existing code.
4. Propose your approach in one sentence (small task) or a short plan (anything touching multiple files or the database). Wait for a go-ahead.
5. Work one layer at a time. Don't change things that don't need changing.

## After finishing
Check if anything you learned belongs in a concept file under `ai-context/concepts/`. If yes, update it so the next session starts smarter.