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
      if (event.repeat) return;
      const action = keyMap[event.code as keyof typeof keyMap];
      if (!action) return;
      event.preventDefault();
      if (action === "left" || action === "right" || action === "down") {
        startRepeat(action);
        return;
      }
      handleAction(action);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const action = keyMap[event.code as keyof typeof keyMap];
      if (!action) return;
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

  const handleRestart = () => {
    applyState(resetGame);
    setShowScoreEntry(false);
    setInitials("");
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
      <header className="hero">
        <div>
          <p className="eyebrow">Drop-a-Block</p>
          <h1>Modern Tetris, anywhere.</h1>
          <p className="subtitle">
            Mobile-first controls, offline support, and a glassy UI. Canvas rendering keeps the board crisp and fast.
          </p>
        </div>
        <div className="hero-actions">
          {state.status !== "running" ? (
            <button className="primary" onClick={() => applyState(startGame)}>
              {state.status === "paused" ? "Resume" : "Start"}
            </button>
          ) : (
            <button className="primary" onClick={() => applyState(pauseGame)}>
              Pause
            </button>
          )}
          <button className="secondary" onClick={handleRestart}>
            Restart
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="game-panel">
          <div className="board-panel">
            <GameCanvas state={state} />
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
          <div className="stats-panel">
            <div className="panel">
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

        <aside className="sidebar">
          <SettingsPanel settings={settings} onChange={setSettings} />
          <HighScores scores={scores} />
          <section className="panel" aria-label="Controls">
            <h2>Controls</h2>
            <ul className="controls-list">
              <li>Move: Arrow keys / touch buttons</li>
              <li>Rotate: Z / X / ↑</li>
              <li>Hard drop: Space</li>
              <li>Hold: C / Shift</li>
              <li>Pause: P / Esc</li>
            </ul>
            <p className="muted">Touch uses on-screen buttons. Swipe gestures are not enabled.</p>
          </section>
        </aside>
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

      <footer className="footer">
        <p>
          Board size {BOARD_WIDTH}x{VISIBLE_ROWS} with {BOARD_HEIGHT - VISIBLE_ROWS} hidden spawn rows. Colors are
          mapped per tetromino.
        </p>
        <div className="legend">
          {Object.entries(COLORS).map(([key, value]) => (
            <span key={key} style={{ background: value }}>
              {key}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};
