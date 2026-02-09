import { useEffect, useMemo, useRef, useState } from "react";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  COLORS,
  hardDrop,
  holdPiece,
  movePiece,
  pauseGame,
  resetGame,
  rotatePiece,
  softDrop,
  startGame,
  tick,
  VISIBLE_ROWS
} from "./engine/engine";
import { GameState } from "./engine/types";
import { Controls } from "./components/Controls";
import { GameCanvas } from "./components/GameCanvas";
import { MiniGrid } from "./components/MiniGrid";
import { HighScores } from "./components/HighScores";
import { loadScores, loadSettings, saveScore, saveSettings } from "./utils/storage";
import { playClear, playLock, playMove, playRotate } from "./utils/sound";
import { SettingsPanel } from "./components/SettingsPanel";
import { CloseIcon, HelpIcon, PlayIcon, SettingsIcon, TrophyIcon } from "./components/Icons";

const keyMap = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowUp: "rotateCw",
  KeyX: "rotateCw",
  KeyZ: "rotateCcw",
  Space: "hardDrop",
  KeyC: "hold",
  ShiftLeft: "hold",
  ShiftRight: "hold",
  KeyP: "pause",
  Escape: "pause"
} as const;

type Action = "left" | "right" | "down" | "rotateCw" | "rotateCcw" | "hardDrop" | "hold" | "pause";

export const App = () => {
  const [state, setState] = useState<GameState>(() => resetGame());
  const [settings, setSettings] = useState(loadSettings);
  const [scores, setScores] = useState(loadScores);
  const [initials, setInitials] = useState("");
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [menuView, setMenuView] = useState<"none" | "settings" | "help" | "about" | "scores">("none");
  const [clearFlash, setClearFlash] = useState(false);
  const stateRef = useRef(state);
  const rafRef = useRef<number>();
  const inputTimers = useRef<{
    left?: number;
    right?: number;
    down?: number;
    leftInterval?: number;
    rightInterval?: number;
    downInterval?: number;
  }>({});

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.dataset.theme = settings.theme;
  }, [settings]);

  useEffect(() => {
    let last = performance.now();
    const loop = (now: number) => {
      const delta = now - last;
      last = now;
      const next = tick(stateRef.current, delta);
      if (next !== stateRef.current) {
        stateRef.current = next;
        setState(next);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (state.status === "over") {
      setShowScoreEntry(true);
    }
  }, [state.status]);

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

  const haptics = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const applyState = (fn: (prev: GameState) => GameState) => {
    setState((prev) => {
      const next = fn(prev);
      stateRef.current = next;
      return next;
    });
  };

  const handleAction = (action: Action) => {
    const current = stateRef.current;
    if (current.status === "start" && action !== "pause") {
      applyState(startGame);
    }
    if (action === "pause") {
      applyState(pauseGame);
      return;
    }
    if (current.status !== "running") return;
    if (action === "left") {
      applyState((prev) => movePiece(prev, { x: -1, y: 0 }));
      if (settings.sound) playMove();
    }
    if (action === "right") {
      applyState((prev) => movePiece(prev, { x: 1, y: 0 }));
      if (settings.sound) playMove();
    }
    if (action === "down") {
      applyState(softDrop);
      if (settings.sound) playMove();
    }
    if (action === "rotateCw") {
      applyState((prev) => rotatePiece(prev, "cw"));
      if (settings.sound) playRotate();
    }
    if (action === "rotateCcw") {
      applyState((prev) => rotatePiece(prev, "ccw"));
      if (settings.sound) playRotate();
    }
    if (action === "hardDrop") {
      applyState(hardDrop);
      if (settings.sound) playLock();
      haptics();
    }
    if (action === "hold") {
      applyState(holdPiece);
      if (settings.sound) playRotate();
    }
  };

  const startRepeat = (direction: "left" | "right" | "down") => {
    handleAction(direction);
    const timerKey = direction as "left" | "right" | "down";
    const timeoutId = window.setTimeout(() => {
      const intervalId = window.setInterval(() => {
        handleAction(direction);
      }, settings.arr);
      inputTimers.current[`${timerKey}Interval` as const] = intervalId;
    }, settings.das);
    inputTimers.current[timerKey] = timeoutId;
  };

  const stopRepeat = (direction: "left" | "right" | "down") => {
    const timeoutId = inputTimers.current[direction];
    if (timeoutId) window.clearTimeout(timeoutId);
    const intervalId = inputTimers.current[`${direction}Interval` as const];
    if (intervalId) window.clearInterval(intervalId);
    inputTimers.current[direction] = undefined;
    inputTimers.current[`${direction}Interval` as const] = undefined;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = keyMap[event.code as keyof typeof keyMap];
      if (!action) return;
      event.preventDefault();
      if (event.repeat) return;
      if (action === "left" || action === "right" || action === "down") {
        startRepeat(action);
        return;
      }
      handleAction(action);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const action = keyMap[event.code as keyof typeof keyMap];
      if (!action) return;
      event.preventDefault();
      if (action === "left" || action === "right" || action === "down") {
        stopRepeat(action);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [settings.das, settings.arr]);

  const nextQueue = useMemo(() => state.queue.slice(0, 3), [state.queue]);

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
    <div className="app">
      <main className="layout">
        <section className="game-panel">
          <div className="game-stage">
            <div className={`board-panel${clearFlash ? " clear-flash" : ""}`}>
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
                  <div>
                    <span className="label">Score</span>
                    <strong>{state.score.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="label">Level</span>
                    <strong>{state.level}</strong>
                  </div>
                  <div>
                    <span className="label">Lines</span>
                    <strong>{state.lines}</strong>
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
          <Controls
            onLeft={() => handleAction("left")}
            onRight={() => handleAction("right")}
            onDown={() => handleAction("down")}
            onRotateCw={() => handleAction("rotateCw")}
            onRotateCcw={() => handleAction("rotateCcw")}
            onHardDrop={() => handleAction("hardDrop")}
            onHold={() => handleAction("hold")}
            onPause={() => handleAction("pause")}
          />
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
                    <strong>Hard drop</strong> with Space or the down arrow.
                  </li>
                  <li>
                    <strong>Hold</strong> with C / Shift to swap the current tetromino.
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
