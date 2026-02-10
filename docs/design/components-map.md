# Components Map

| Area | File | Key Classes / Elements |
| --- | --- | --- |
| App layout + HUD | src/App.tsx | `.hud-bar`, `.hud-title`, `.hud-stats`, `.hud-actions` |
| Board shell + overlays | src/App.tsx | `.board-panel`, `.overlay`, `.game-over-panel`, `.combo-badge` |
| Game rendering | src/components/GameCanvas.tsx | `canvas.game-canvas` |
| Hold + next queue | src/components/MiniGrid.tsx | `.mini-grid`, `.mini-cell` |
| Stats + goals | src/App.tsx | `.stats-panel`, `.stat-grid`, `.goal-card` |
| Touch controls | src/components/Controls.tsx | `.controls`, `.control-button` |
| Settings | src/components/SettingsPanel.tsx | `.settings-group`, `.segmented`, `.toggle` |
| High scores | src/components/HighScores.tsx | `.scores-list` |
| Modals | src/App.tsx | `.modal`, `.modal-card` |
