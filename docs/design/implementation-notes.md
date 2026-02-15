# Implementation Notes

**Themes**

- Themes are applied via runtime CSS variables on `document.documentElement`.
- Built-in themes: `dark`, `neon`, `retro`, `liquid2026`, `gameboy`, `solarized`, `c64`.
- Custom themes support overrides for UI color tokens, piece colors, and asset URLs (including Doom sprites + texture overlays).
- Retro-based themes keep mono-arcade typography through `data-theme="retro"`.

**Palettes**

- Piece palettes are resolved in `src/ui/palettes.ts` from either the active theme or colorblind mode.
- `default` now follows the active theme palette; `colorblind` remains the universal accessible set.
- Canvas rendering and MiniGrid read the resolved palette from settings.

**Localization**

- UI strings are translated through `src/i18n/index.ts`.
- Supported languages: `en`, `es`, `ja`.
- Language selection is part of persisted settings.

**Styling**

- Tailwind CSS is enabled via PostCSS (`tailwind.config.js`, `postcss.config.js`).
- Existing semantic class architecture remains in `src/styles/global.css`; new settings UI uses Tailwind utility classes.

**Motion**

- Reduced motion sets `data-motion="reduced"` to disable CSS transitions/animations.
- Canvas FX (line sweep + drop trails) skip when reduced motion is enabled.

**HUD**

- HUD surfaces show score, level, lines, and high score.
- Pause + settings buttons live in `.hud-actions`.

**Gameplay FX**

- Line clears trigger a sweep overlay, board glow, and canvas pulse.
- Hard drops create a short-lived vertical trail between active and ghost pieces.
- Ghost pieces are outlined with dashed strokes for clarity.
