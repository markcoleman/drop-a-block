# Drop-a-Block

A modern, mobile-first Tetris clone built with React + TypeScript + Vite. It runs entirely in the browser, works offline after the first load, and is ready for GitHub Pages.

## Features
- 10x20 board with 2 hidden spawn rows.
- 7-bag RNG and SRS-like rotation with wall kicks.
- Hold piece (one swap per drop) and next queue (3 previews).
- Ghost piece, soft drop, hard drop, lock delay, and DAS/ARR controls.
- Local high scores (top 10) + settings stored in localStorage.
- Touch-friendly on-screen controls + keyboard support.
- Offline support via Vite PWA plugin.

## Local Development
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

## Tech Notes
- Rendering uses Canvas for crisp performance.
- Game logic is separated into a pure engine module (`src/engine`).
- UI handles input mapping, rendering, audio, and localStorage persistence.

## Testing
```bash
npm test
```
