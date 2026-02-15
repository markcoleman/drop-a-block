# Architecture Notes

## UI Composition

- `src/App.tsx` orchestrates game state, input, and top-level layout.
- `src/components/HudBar.tsx` renders the top HUD stats and quick actions.
- `src/components/StartOverlay.tsx`, `src/components/PauseOverlay.tsx`, and `src/components/GameOverOverlay.tsx` handle the three board overlays.
- `src/components/StatsPanel.tsx` and `src/components/QueuePanel.tsx` populate the left/right side panels.
- `src/components/MenuModal.tsx` hosts settings/help/scores/secret/about.
- `src/components/ScoreEntryModal.tsx` handles high-score entry.

## State Flow

- `src/game/useGame.ts` owns the deterministic tick loop and exposes `state`, `dispatch`, and `applyState`.
- `src/game/input.ts` maps keyboard/touch actions to `dispatch`, respecting DAS/ARR and hold settings.
- `src/engine` remains UI-free and deterministic. UI components derive view data from `GameState`.

## Config And Helpers

- `src/game/modes.ts` centralizes mode labels, unlock rules, and secret modifiers.
- `src/game/cheats.ts` centralizes cheat code parsing and tap thresholds.
- `src/utils/dom.ts` exposes DOM helpers shared between input and UI.

## Extending Safely

- Prefer adding new UI pieces as components in `src/components` and pass in derived data instead of reading globals.
- Keep engine changes in `src/engine` and cover new logic with tests in `src/engine/__tests__`.
