import type { ReactNode } from "react";

import type { GameMode, GameStatus, PlayMode } from "../engine/types";
import { IconButton } from "./IconButton";
import { EyeOffIcon, PauseIcon, SettingsIcon } from "./Icons";

type HudBarProps = {
  status: GameStatus;
  mode: GameMode;
  playMode: PlayMode;
  modeLabel: string;
  sprintLinesLeft: number;
  modeMinutes: number;
  modeSeconds: string;
  score: number;
  level: number;
  lines: number;
  doomLinesToReady: number;
  highScore: number;
  onPause: () => void;
  onOpenSettings: () => void;
  onHideHud: () => void;
};

const HudStat = ({
  label,
  value,
  className
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) => (
  <div className={className ? `hud-card ${className}` : "hud-card"}>
    <span className="label">{label}</span>
    <strong>{value}</strong>
  </div>
);

export const HudBar = ({
  status,
  mode,
  playMode,
  modeLabel,
  sprintLinesLeft,
  modeMinutes,
  modeSeconds,
  score,
  level,
  lines,
  doomLinesToReady,
  highScore,
  onPause,
  onOpenSettings,
  onHideHud
}: HudBarProps) => {
  return (
    <div className="hud-bar">
      <div className="hud-main">
        <div className="hud-title">
          <span className="eyebrow">Drop-a-Block</span>
          <div className="hud-mode">
            <span className="hud-mode-label">{modeLabel}</span>
            {playMode === "sprint" && (
              <span className="hud-mode-sub">{sprintLinesLeft} lines left</span>
            )}
            {playMode === "ultra" && (
              <span className="hud-mode-sub">
                {modeMinutes}:{modeSeconds} remaining
              </span>
            )}
          </div>
        </div>
        <div className="hud-stats">
          <HudStat label="Score" value={score.toLocaleString()} className="hud-primary" />
          <HudStat label="Level" value={level} className="hud-primary" />
          <HudStat label="Lines" value={lines} className="hud-primary" />
          {mode === "tetris" && (
            <HudStat label="Doom" value={`${doomLinesToReady} lines`} className="hud-secondary" />
          )}
          <HudStat label="High" value={highScore.toLocaleString()} className="hud-secondary" />
        </div>
      </div>
      <div className="hud-actions">
        <IconButton
          className="hud-button"
          label={status === "paused" ? "Resume" : "Pause"}
          onClick={onPause}
        >
          <PauseIcon />
        </IconButton>
        <IconButton className="hud-button" label="Open settings" onClick={onOpenSettings}>
          <SettingsIcon />
        </IconButton>
        <IconButton className="hud-button" label="Hide HUD" onClick={onHideHud}>
          <EyeOffIcon />
        </IconButton>
      </div>
    </div>
  );
};
