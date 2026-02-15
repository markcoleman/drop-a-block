# Project Plan

## Product Goal

Deliver a deterministic, browser-based block-dropping game with polished controls, mobile support, and stable release quality.

## Current Scope

- Deterministic gameplay engine and reducer loop.
- Responsive React UI with keyboard and touch controls.
- Local persistence for settings, unlocks, and high scores.
- CI-backed quality checks (lint, typecheck, tests, build).

## Done

- Core gameplay loop, piece queue/hold, and collision/lock flow.
- Game modes (Normal, Sprint, Ultra) and unlock progression.
- HUD, overlays, settings panel, and high-score entry UX.
- Unit-test coverage for engine, game, and UI components.

## Next Milestones

- Keep docs and code structure synchronized through doc-gardening automation.
- Expand focused tests when gameplay or scoring rules change.
- Keep release checks fast and deterministic in CI.

## Out Of Scope (For Now)

- Multiplayer/networked gameplay.
- Backend persistence.
- Large framework or tooling rewrites.
