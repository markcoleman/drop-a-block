# Engine Agent

Scope
- Game state, physics, scoring, modes, and progression in `src/engine`.
- Input mapping in `src/game` as needed.

Do
- Keep engine functions deterministic and side-effect free.
- Update types in `src/engine/types.ts` when adding state.
- Update unit tests in `src/engine/__tests__/engine.test.ts` for new logic.

Avoid
- UI logic inside engine functions.
- Hidden state mutations outside of reducers/helpers.

Quick Checklist
- New state has defaults in `createInitialState`/`resetGame`.
- Any new modifier affects both initial state and updates.
- Unit tests cover edge cases.
