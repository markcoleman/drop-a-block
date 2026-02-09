import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  ARKANOID_TRIGGER_LINES,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  COLORS,
  startGame,
  VISIBLE_ROWS
} from "./engine/engine";
import { Controls } from "./components/Controls";
import { GameCanvas } from "./components/GameCanvas";
import { MiniGrid } from "./components/MiniGrid";
import { HighScores } from "./components/HighScores";
import { loadGoalsState, loadScores, loadSettings, saveGoalsState, saveScore, saveSettings } from "./utils/storage";
import { playClear, playLock, playMove, playRotate } from "./utils/sound";
import { SettingsPanel } from "./components/SettingsPanel";
import { CloseIcon, HelpIcon, PlayIcon, SettingsIcon, TrophyIcon } from "./components/Icons";
import { Action, canApplyAction } from "./game/actions";
import { getActionForKey, isRepeatableAction, RepeatableAction } from "./game/controls";
import { useGame } from "./game/useGame";
import { evaluateGoals, getNextLevelTarget } from "./utils/goals";

const ACTION_EFFECTS: Partial<
  Record<Action, { sound?: () => void; haptics?: boolean }>
> = {
  left: { sound: playMove },
  right: { sound: playMove },
  down: { sound: playMove },
  rotateCw: { sound: playRotate },
  rotateCcw: { sound: playRotate },
  hardDrop: { sound: playLock, haptics: true },
  hold: { sound: playRotate }
};

export const App = () => {
  const { state, stateRef, applyState, dispatch } = useGame();
  const [settings, setSettings] = useState(loadSettings);
  const [scores, setScores] = useState(loadScores);
  const [goalsState, setGoalsState] = useState(loadGoalsState);
  const [initials, setInitials] = useState("");
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [menuView, setMenuView] = useState<"none" | "settings" | "help" | "about" | "scores">("none");
  const [clearFlash, setClearFlash] = useState(false);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const arkanoidSeconds = Math.ceil(state.arkanoid.timeLeft / 1000);
  const linesToFlip = Math.max(0, ARKANOID_TRIGGER_LINES - state.arkanoidMeter);
  const nextLevelTarget = getNextLevelTarget(state.level);
  const levelStart = (state.level - 1) * 10;
  const linesToNextLevel = Math.max(0, nextLevelTarget - state.lines);
  const levelProgress = Math.min(1, (state.lines - levelStart) / 10);
  type TimerKey = RepeatableAction | `${RepeatableAction}Interval`;
  const inputTimers = useRef<{
    left?: number;
    right?: number;
    down?: number;
    leftInterval?: number;
    rightInterval?: number;
    downInterval?: number;
  }>({});

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.dataset.theme = settings.theme;
  }, [settings]);

  useEffect(() => {
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const updateTouchMode = () => {
      const hasTouchPoints = navigator.maxTouchPoints > 0;
      const hasTouchEvent = "ontouchstart" in window;
      setIsTouchMode(coarseQuery.matches || hasTouchPoints || hasTouchEvent);
    };

    updateTouchMode();
    const handleTouchStart = () => setIsTouchMode(true);
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        setIsTouchMode(true);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    if (coarseQuery.addEventListener) {
      coarseQuery.addEventListener("change", updateTouchMode);
    } else {
      coarseQuery.addListener(updateTouchMode);
    }

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("pointerdown", handlePointerDown);
      if (coarseQuery.removeEventListener) {
        coarseQuery.removeEventListener("change", updateTouchMode);
      } else {
        coarseQuery.removeListener(updateTouchMode);
      }
    };
  }, []);

  useEffect(() => {
    if (state.status === "over") {
      setShowScoreEntry(true);
    }
  }, [state.status]);

  useEffect(() => {
    const progress = evaluateGoals(
      { score: state.score, lines: state.lines, level: state.level },
      goalsState.unlocked
    );
    const newlyUnlocked = progress
      .filter((item) => item.achieved && !goalsState.unlocked.includes(item.goal.id))
      .map((item) => item.goal.id);
    if (newlyUnlocked.length === 0) return;
    const updated = { unlocked: [...goalsState.unlocked, ...newlyUnlocked] };
    setGoalsState(updated);
    saveGoalsState(updated);
  }, [goalsState.unlocked, state.level, state.lines, state.score]);

  useEffect(() => {
    if (!settings.sound) return;
    if (state.lastClear > 0) playClear();
  }, [state.lastClear, settings.sound]);

  useEffect(() => {
    if (state.lastClear <= 0) return;
    setClearFlash(false);
    const rafId = window.requestAnimationFrame(() => setClearFlash(true));
    const timeoutId = window.setTimeout(() => setClearFlash(false), 520);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [state.lastClear]);

  const haptics = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);

  const handleAction = useCallback((action: Action) => {
    const current = stateRef.current;
    if (!canApplyAction(current, action)) return;
    dispatch(action);
    if (current.status !== "running") return;
    const effect = ACTION_EFFECTS[action];
    if (effect?.sound && settings.sound) effect.sound();
    if (effect?.haptics) haptics();
  }, [dispatch, haptics, settings.sound, stateRef]);

  const clearTimer = useCallback((key: TimerKey) => {
    const timerId = inputTimers.current[key];
    if (!timerId) return;
    if (key.endsWith("Interval")) {
      window.clearInterval(timerId);
    } else {
      window.clearTimeout(timerId);
    }
    inputTimers.current[key] = undefined;
  }, []);

  const stopRepeat = useCallback(
    (direction: RepeatableAction) => {
      clearTimer(direction);
      clearTimer(`${direction}Interval` as TimerKey);
    },
    [clearTimer]
  );

  const startRepeat = useCallback((direction: RepeatableAction) => {
    stopRepeat(direction);
    handleAction(direction);
    const timeoutId = window.setTimeout(() => {
      const intervalId = window.setInterval(() => {
        handleAction(direction);
      }, settings.arr);
      inputTimers.current[`${direction}Interval` as const] = intervalId;
    }, settings.das);
    inputTimers.current[direction] = timeoutId;
  }, [handleAction, settings.arr, settings.das, stopRepeat]);

  useEffect(() => {
    return () => {
      (["left", "right", "down"] as const).forEach(stopRepeat);
    };
  }, [stopRepeat]);

  useEffect(() => {
    (["left", "right", "down"] as const).forEach(stopRepeat);
  }, [settings.arr, settings.das, stopRepeat]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = getActionForKey(event.code);
      if (!action) return;
      event.preventDefault();
      if (event.repeat) return;
      if (isRepeatableAction(action)) {
        startRepeat(action);
        return;
      }
      handleAction(action);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const action = getActionForKey(event.code);
      if (!action) return;
      event.preventDefault();
      if (isRepeatableAction(action)) {
        stopRepeat(action);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleAction, startRepeat, stopRepeat]);

  const nextQueue = useMemo(() => state.queue.slice(0, 3), [state.queue]);
  const goalProgress = useMemo(
    () =>
      evaluateGoals(
        { score: state.score, lines: state.lines, level: state.level },
        goalsState.unlocked
      ),
    [state.score, state.lines, state.level, goalsState.unlocked]
  );
  const displayGoals = useMemo(() => {
    const unlocked = goalProgress.filter((goal) => goal.achieved);
    const upcoming = goalProgress.filter((goal) => !goal.achieved);
    const recentUnlocked = unlocked.slice(-1);
    const nextGoals = upcoming.slice(0, 3);
    return [...recentUnlocked, ...nextGoals].slice(0, 4);
  }, [goalProgress]);

  const handleStart = () => {
    setMenuView("none");
    applyState(startGame);
  };

  const handleScoreSubmit = () => {
    const name = initials.trim().slice(0, 3).toUpperCase() || "AAA";
    const updated = saveScore({
      name,
      score: state.score,
      lines: state.lines,
      level: state.level,
      date: new Date().toISOString()
    });
    setScores(updated);
    setShowScoreEntry(false);
  };

  return (
    <div className={clsx("app", { "touch-enabled": isTouchMode })}>
      <main className="layout">
        <section className="game-panel">
          <div className="game-stage">
            <div
              className={clsx("board-panel", {
                "clear-flash": clearFlash,
                arkanoid: state.mode === "arkanoid"
              })}
            >
              <GameCanvas state={state} />
              {state.status === "start" && (
                <div className="overlay start-overlay">
                  <div className="start-menu">
                    <div className="start-menu-header">
                      <p className="eyebrow">Start Menu</p>
                      <h2>Ready to drop?</h2>
                      <p className="subtitle">
                        Pick a launch point. Tune the feel, review controls, or jump straight in.
                      </p>
                    </div>
                  <div className="start-menu-actions">
                    <button className="menu-button primary" onClick={handleStart}>
                      <span className="menu-icon">
                        <PlayIcon />
                      </span>
                        <span className="menu-copy">
                          <strong>Start Game</strong>
                        <span className="menu-desc">Drop into level {state.level}.</span>
                      </span>
                    </button>
                    <button className="menu-button" onClick={() => setMenuView("scores")}>
                      <span className="menu-icon">
                        <TrophyIcon />
                      </span>
                      <span className="menu-copy">
                        <strong>High Scores</strong>
                        <span className="menu-desc">Your top runs and rankings.</span>
                      </span>
                    </button>
                    <button className="menu-button" onClick={() => setMenuView("settings")}>
                      <span className="menu-icon">
                        <SettingsIcon />
                      </span>
                      <span className="menu-copy">
                        <strong>Adjust Settings</strong>
                        <span className="menu-desc">Sound, theme, and speed controls.</span>
                      </span>
                    </button>
                    <button className="menu-button" onClick={() => setMenuView("help")}>
                      <span className="menu-icon">
                        <HelpIcon />
                      </span>
                      <span className="menu-copy">
                        <strong>Help</strong>
                        <span className="menu-desc">Controls, tactics, and pro tips.</span>
                      </span>
                    </button>
                    <button className="menu-button" onClick={() => setMenuView("about")}>
                      <span className="menu-icon">
                        <HelpIcon />
                      </span>
                      <span className="menu-copy">
                        <strong>About</strong>
                        <span className="menu-desc">Board size, colors, and rules.</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
              {state.status === "paused" && (
                <div className="overlay">
                  <h2>Paused</h2>
                  <p>Press P or tap resume.</p>
                  <button className="primary" onClick={() => handleAction("pause")}>
                    Resume
                  </button>
                </div>
              )}
              {state.status === "over" && (
                <div className="overlay">
                  <h2>Game Over</h2>
                  <p>Score {state.score.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="side-panel left">
              <div className="panel stats-panel">
                <h2>Stats</h2>
                <div className="stat-grid">
                  <div className="stat-card">
                    <span className="label">Score</span>
                    <strong>{state.score.toLocaleString()}</strong>
                  </div>
                  <div className="stat-card compact">
                    <span className="label">Level</span>
                    <strong>{state.level}</strong>
                  </div>
                  <div className="stat-card compact">
                    <span className="label">Lines</span>
                    <strong>{state.lines}</strong>
                  </div>
                  {state.mode !== "arkanoid" && (
                    <div className="stat-card">
                      <span className="label">Flip in</span>
                      <strong>{linesToFlip} lines</strong>
                    </div>
                  )}
                </div>
                {state.mode === "arkanoid" && state.status === "running" && (
                  <div className="mode-banner" aria-live="polite">
                    <span className="mode-label">Arkanoid</span>
                    <span className="mode-timer">{arkanoidSeconds}s</span>
                    <span className="mode-hint">Break blocks for points.</span>
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
                      aria-valuenow={state.lines - levelStart}
                    >
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.round(levelProgress * 100)}%` }}
                      />
                    </div>
                    <span className="muted">
                      Level {state.level + 1} unlocks at {nextLevelTarget} lines.
                    </span>
                  </div>
                  <div className="goal-list" aria-live="polite">
                    {displayGoals.map((item) => (
                      <div
                        key={item.goal.id}
                        className={clsx("goal-card", { completed: item.achieved })}
                      >
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
            </div>
            <div className="side-panel right">
              <div className="panel">
                <h2>Hold</h2>
                <MiniGrid type={state.hold} label="Hold piece" />
              </div>
              <div className="panel">
                <h2>Next</h2>
                <div className="next-queue">
                  {nextQueue.map((type, index) => (
                    <MiniGrid key={`${type}-${index}`} type={type} label={`Next piece ${index + 1}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {isTouchMode && (
            <Controls
              onLeftStart={() => startRepeat("left")}
              onLeftEnd={() => stopRepeat("left")}
              onRightStart={() => startRepeat("right")}
              onRightEnd={() => stopRepeat("right")}
              onDownStart={() => startRepeat("down")}
              onDownEnd={() => stopRepeat("down")}
              onRotateCw={() => handleAction("rotateCw")}
              onRotateCcw={() => handleAction("rotateCcw")}
              onHardDrop={() => handleAction("hardDrop")}
              onHold={() => handleAction("hold")}
              onPause={() => handleAction("pause")}
            />
          )}
        </section>
      </main>

      {showScoreEntry && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>New High Score</h2>
            <p>Enter your initials (3 letters).</p>
            <input
              value={initials}
              onChange={(event) => setInitials(event.target.value)}
              maxLength={3}
              placeholder="AAA"
              aria-label="Initials"
            />
            <button className="primary" onClick={handleScoreSubmit}>
              Save Score
            </button>
          </div>
        </div>
      )}

      {menuView !== "none" && !showScoreEntry && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card modal-large">
            <div className="modal-header">
              <h2>
                {menuView === "settings"
                  ? "Adjust Settings"
                  : menuView === "help"
                    ? "Help"
                    : menuView === "scores"
                      ? "High Scores"
                      : "About"}
              </h2>
              <button
                className="icon-button"
                onClick={() => setMenuView("none")}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            {menuView === "settings" ? (
              <SettingsPanel
                settings={settings}
                onChange={setSettings}
                className="embedded"
              />
            ) : menuView === "help" ? (
              <div className="help-panel">
                <p className="muted">
                  Tight rotations and fast drops win. Use Hold to save a rescue piece, and watch the next queue.
                </p>
                <ul className="help-list">
                  <li>
                    <strong>Rotate</strong> with Z / X or the on-screen rotate buttons.
                  </li>
                  <li>
                    <strong>Move/Drop</strong> by holding the on-screen arrows for repeat.
                  </li>
                  <li>
                    <strong>Hard drop</strong> with Space or the hard drop button.
                  </li>
                  <li>
                    <strong>Hold</strong> with C / Shift to swap the current tetromino.
                  </li>
                  <li>
                    <strong>Arkanoid mode</strong> triggers every {ARKANOID_TRIGGER_LINES} lines for 30 seconds.
                  </li>
                  <li>
                    <strong>Pause</strong> anytime with P or Esc.
                  </li>
                </ul>
              </div>
            ) : menuView === "scores" ? (
              <HighScores scores={scores} className="embedded" />
            ) : (
              <div className="help-panel">
                <p className="muted about-copy">
                  Board size {BOARD_WIDTH}x{VISIBLE_ROWS} with {BOARD_HEIGHT - VISIBLE_ROWS} hidden spawn rows.
                  Colors are mapped per tetromino.
                </p>
                <div className="legend about-legend">
                  {Object.entries(COLORS).map(([key, value]) => (
                    <span key={key} style={{ background: value }}>
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
