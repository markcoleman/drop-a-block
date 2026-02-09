# Engine Change Checklist

- New state has defaults in `createInitialState` and `resetGame`.
- Drop interval or scoring changes have tests.
- Play mode logic respects win/lose conditions.
- No UI dependencies introduced in engine code.
- Any modifier is applied in both initialization and per-tick updates.
