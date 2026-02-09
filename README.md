# Drop-a-Block

A modern, mobile-first Tetris-inspired game built with React + TypeScript + Vite. It runs entirely in the browser, works offline after the first load, and is ready for GitHub Pages.

## Features
- 10x20 board with 2 hidden spawn rows.
- 7-bag RNG and SRS-like rotation with wall kicks.
- Hold piece (one swap per drop) and next queue (3 previews).
- Ghost piece, soft drop, hard drop, lock delay, and DAS/ARR controls.
- Local high scores (top 10) + settings stored in `localStorage`.
- Touch-friendly on-screen controls + keyboard support.
- Offline support via Vite PWA plugin.
- Game modes: Normal (default), Sprint, Ultra.
- Unlocks and secret modifiers stored locally per device.

## Quick Start
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages Deployment
1. Push to GitHub.
2. Ensure the workflow is enabled under **Actions**.
3. In **Settings → Pages**, select **GitHub Actions** as the source.

The workflow sets the `BASE_PATH` env var automatically to `/<repo>/`, and Vite uses it in `vite.config.ts`.
If you want to override it locally, run:
```bash
BASE_PATH=/<your-repo>/ npm run build
```

## Gameplay Controls
**Keyboard**
- Move: ← →
- Soft drop: ↓
- Rotate: Z (CCW), X or ↑ (CW)
- Hard drop: Space
- Hold: C or Shift
- Pause: P or Esc

**Touch**
- Use the on-screen buttons for move, rotate, drop, hold, and pause.

## Game Modes and Unlocks
- **Normal** is available by default.
- **Sprint** unlocks after finishing 1 game.
- **Ultra** unlocks after finishing 3 games.

Unlock progress and any secret modifiers are stored locally in `localStorage`.

## Secret Menu
- **Desktop:** type `TETRIS` anywhere (not in a text field).
- **Mobile:** tap the Start Menu header 5 times, then enter `TETRIS`.

The secret menu lets you toggle fun modifiers and unlock modes for testing.

## Project Layout
- `src/engine` — deterministic game logic.
- `src/game` — input mapping and reducer logic.
- `src/components` — UI components.
- `src/styles/global.css` — global styles and layout.
- `docs/codex` — agent guides and dev assets.

## Testing
```bash
npm test
```

## Contributing
See `CONTRIBUTING.md` for setup, workflow, and PR guidance.
