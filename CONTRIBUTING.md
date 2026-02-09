# Contributing

Thanks for helping improve Drop-a-Block!

## Setup
```bash
npm i
npm run dev
```

## Project Conventions
- Engine logic is deterministic and UI-free (`src/engine`).
- UI changes should keep styles in `src/styles/global.css`.
- Add or update tests in `src/engine/__tests__/engine.test.ts` when changing core logic.

## Commit and PR Tips
- Keep PRs focused and small.
- Include reproduction steps and screenshots for UI changes.
- Note any skipped tests and why.

## Running Tests
```bash
npm test
```

## Optional Checks
```bash
npm run build
```
