<INSTRUCTIONS>
## Project Overview
- Vite + React single-page game.
- Core gameplay logic lives in `src/engine` and `src/game`.
- UI components live in `src/components`.
- Styling is centralized in `src/styles/global.css`.

## Commands
- `npm run dev`
- `npm run build`
- `npm test`

## Codex Agents
Use these guides when the task matches the area. They live in `docs/codex/agents`.
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

## Guardrails
- Keep engine logic deterministic and UI-free.
- Prefer small, testable helpers over large rewrites.
- Keep CSS changes in `src/styles/global.css` unless a component truly needs local styling.
</INSTRUCTIONS>
