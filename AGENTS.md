<INSTRUCTIONS>
## Purpose
This file is a table of contents for agents. Keep it short and point to deeper docs.

## Project Overview

- Vite + React single-page game.
- Core gameplay logic: `src/engine` and `src/game`.
- UI components: `src/components`.
- Shared styling: `src/styles/global.css`.

## Commands

- `npm run dev`
- `npm run build`
- `npm test`

## Start Here (Progressive Disclosure)

1. `docs/project/plan.md` (scope and milestones)
2. `docs/project/progress.md` (current state + generated snapshot)
3. `docs/project/tech-debt.md` (known cleanup targets)
4. `docs/architecture.md` (system constraints and state flow)
5. `docs/decisions/README.md` (architecture decisions that must live in-repo)

## Codex Agents

Use these guides when the task matches the area.

- `docs/codex/agents/frontend.md` (UI + layout)
- `docs/codex/agents/engine.md` (gameplay logic)
- `docs/codex/agents/qa.md` (tests + repro)
- `docs/codex/agents/release.md` (build + deploy sanity)

## Codex Assets

Reusable templates and checklists live in `docs/codex/assets`.

- `docs/codex/assets/bug-report.md`
- `docs/codex/assets/test-plan.md`
- `docs/codex/assets/ui-checklist.md`
- `docs/codex/assets/engine-checklist.md`
- `docs/codex/assets/capability-gap.md`

## If A Task Fails Twice

Answer using `docs/codex/assets/capability-gap.md`:

- What capability is missing?
- How should it be made visible in this repo?
- What check or automation should enforce it?

## Guardrails

- Keep engine logic deterministic and UI-free.
- Prefer small, testable helpers over large rewrites.
- Keep CSS changes in `src/styles/global.css` unless a component truly needs local styling.
  </INSTRUCTIONS>
