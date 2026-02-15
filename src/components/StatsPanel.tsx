import clsx from "clsx";
import type { GameMode, GameStatus } from "../engine/types";
import type { GoalProgress } from "../utils/goals";

type StatsPanelProps = {
  level: number;
  mode: GameMode;
  arkanoidSeconds: number;
  doomSeconds: number;
  status: GameStatus;
  linesToNextLevel: number;
  levelProgress: number;
  linesIntoLevel: number;
  nextLevelTarget: number;
  displayGoals: GoalProgress[];
};

export const StatsPanel = ({
  level,
  mode,
  arkanoidSeconds,
  doomSeconds,
  status,
  linesToNextLevel,
  levelProgress,
  linesIntoLevel,
  nextLevelTarget,
  displayGoals
}: StatsPanelProps) => {
  return (
    <div className="panel stats-panel">
      <h2>Progress</h2>
      {mode === "arkanoid" && status === "running" && (
        <div className="mode-banner" aria-live="polite">
          <span className="mode-label">Arkanoid</span>
          <span className="mode-timer">{arkanoidSeconds}s</span>
          <span className="mode-hint">Break blocks for points.</span>
        </div>
      )}
      {mode === "doom" && status === "running" && (
        <div className="mode-banner doom" aria-live="polite">
          <span className="mode-label">Doom Run</span>
          <span className="mode-timer">{doomSeconds}s</span>
          <span className="mode-hint">Find the exit. WASD + mouse, click to shoot.</span>
        </div>
      )}
      <div className="goals-merged">
        <div className="goal-progress">
          <div className="goal-header">
            <span>Next level</span>
            <strong>{linesToNextLevel} lines</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={linesIntoLevel}
          >
            <div
              className="progress-fill"
              style={{ width: `${Math.round(levelProgress * 100)}%` }}
            />
          </div>
          <span className="muted">
            Level {level + 1} unlocks at {nextLevelTarget} lines.
          </span>
        </div>
        <div className="goal-list" aria-live="polite">
          {displayGoals.map((item) => (
            <div key={item.goal.id} className={clsx("goal-card", { completed: item.achieved })}>
              <span className="goal-title">{item.goal.label}</span>
              <div className="goal-meta">
                <span>
                  {item.achieved
                    ? "Completed"
                    : `${item.value.toLocaleString()} / ${item.goal.target.toLocaleString()}`}
                </span>
                <span>{Math.round(item.progress * 100)}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.round(item.progress * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
