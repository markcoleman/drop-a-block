# Implementation Notes

**Themes**
- Themes are applied via `data-theme` on `document.documentElement`.
- Available themes: `dark`, `neon`, `retro`.
- Retro theme swaps UI typography to `--font-mono` for a mono arcade feel.

**Palettes**
- Piece palettes live in `src/ui/palettes.ts`.
- `default` is the premium arcade palette; `colorblind` uses a color-universal set.
- Canvas rendering and MiniGrid read the active palette from settings.

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
