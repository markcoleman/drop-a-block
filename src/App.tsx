import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import clsx from "clsx";
import {
  ARKANOID_TRIGGER_LINES,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DOOM_DURATION,
  DOOM_TRIGGER_LINES,
  forceDoom,
  SPRINT_TARGET_LINES,
  getGhost,
  setPaddlePosition,
  startGame,
  turnDoom,
  ULTRA_DURATION,
  resetGame,
  VISIBLE_ROWS
} from "./engine/engine";
import { Controls } from "./components/Controls";
import { GameCanvas, type DropTrail } from "./components/GameCanvas";
import { MiniGrid } from "./components/MiniGrid";
import { HighScores } from "./components/HighScores";
import { loadGoalsState, loadScores, loadSettings, saveGoalsState, saveScore, saveSettings } from "./utils/storage";
import { playClear, playLock, playMove, playRotate, setSfxMuted } from "./audio/sfx";
import { SettingsPanel } from "./components/SettingsPanel";
import { ArrowLeftIcon, CloseIcon, HelpIcon, PauseIcon, PlayIcon, SettingsIcon, TrophyIcon } from "./components/Icons";
import { Action, canApplyAction } from "./game/actions";
import { useInput } from "./game/input";
import { useGame } from "./game/useGame";
import { evaluateGoals, getNextLevelTarget } from "./utils/goals";
import type { GameModifiers, PlayMode } from "./engine/types";
import { getPalette } from "./ui/palettes";

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

const CHEAT_CODE = "TETRIS";
const DOOM_CODE = "DOOM";
const CHEAT_TAP_TARGET = 5;

const MODE_LABELS: Record<PlayMode, string> = {
  marathon: "Normal",
  sprint: "Sprint",
  ultra: "Ultra"
};

const MODE_OPTIONS: Array<{ id: PlayMode; label: string; desc: string }> = [
  {
    id: "marathon",
    label: "Normal",
    desc: "Classic endless climb with speed bumps every 10 lines."
  },
  {
    id: "sprint",
    label: "Sprint",
    desc: `Clear ${SPRINT_TARGET_LINES} lines as fast as you can.`
  },
  {
    id: "ultra",
    label: "Ultra",
    desc: `Score attack for ${Math.round(ULTRA_DURATION / 60000)} minutes.`
  }
];

const MODE_UNLOCKS: Record<Exclude<PlayMode, "marathon">, { plays: number; label: string }> = {
  sprint: { plays: 1, label: "Finish 1 game" },
  ultra: { plays: 3, label: "Finish 3 games" }
};

const SECRET_MODES: Array<{ id: keyof GameModifiers; label: string; desc: string }> = [
  { id: "turbo", label: "Turbo Gravity", desc: "Pieces fall 40% faster." },
  { id: "mirror", label: "Mirror Controls", desc: "Left/right controls are swapped." },
  { id: "noGhost", label: "No Ghost", desc: "Hide the landing preview." }
];

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

export const App = () => {
  const { state, stateRef, applyState, dispatch } = useGame();
  const [settings, setSettings] = useState(loadSettings);
  const [scores, setScores] = useState(loadScores);
  const [goalsState, setGoalsState] = useState(loadGoalsState);
  const [initials, setInitials] = useState("");
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [menuView, setMenuView] = useState<
    "none" | "settings" | "help" | "about" | "scores" | "secret"
  >("none");
  const [clearFlash, setClearFlash] = useState(false);
  const [dropTrail, setDropTrail] = useState<DropTrail | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [comboPulse, setComboPulse] = useState(0);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [startStep, setStartStep] = useState<"main" | "mode">("main");
  const [selectedMode, setSelectedMode] = useState<PlayMode>("marathon");
  const [showCheatEntry, setShowCheatEntry] = useState(false);
  const [cheatInput, setCheatInput] = useState("");
  const [cheatFeedback, setCheatFeedback] = useState<"idle" | "error">("idle");
  const arkanoidSeconds = Math.ceil(state.arkanoid.timeLeft / 1000);
  const doomSeconds = Math.ceil(state.doom.timeLeft / 1000);
  const linesToFlip = Math.max(0, ARKANOID_TRIGGER_LINES - state.arkanoidMeter);
  const doomLinesToReady = Math.max(0, DOOM_TRIGGER_LINES - state.doomMeter);
  const nextLevelTarget = getNextLevelTarget(state.level);
  const levelStart = (state.level - 1) * 10;
  const linesToNextLevel = Math.max(0, nextLevelTarget - state.lines);
  const levelProgress = Math.min(1, (state.lines - levelStart) / 10);
  const palette = useMemo(() => getPalette(settings.palette), [settings.palette]);
  const highScore = scores[0]?.score ?? 0;
  const clearShake = !settings.reducedMotion && clearFlash && state.lastClear >= 2;
  const statusRef = useRef(state.status);
  const lastClearRef = useRef(state.lastClear);
  const cheatTapRef = useRef<{ count: number; timeoutId?: number }>({ count: 0 });
  const cheatBufferRef = useRef("");
  const updateGoalsState = useCallback(
    (updater: (prev: typeof goalsState) => typeof goalsState) => {
      setGoalsState((prev) => {
        const next = updater(prev);
        if (next === prev) return prev;
        saveGoalsState(next);
        return next;
      });
    },
    []
  );
  const totalPlays = goalsState.plays ?? 0;
  const unlockedModes = useMemo(() => {
    const unlocked = new Set<PlayMode>(goalsState.unlockedModes ?? []);
    unlocked.add("marathon");
    if (totalPlays >= MODE_UNLOCKS.sprint.plays) unlocked.add("sprint");
    if (totalPlays >= MODE_UNLOCKS.ultra.plays) unlocked.add("ultra");
    return unlocked;
  }, [goalsState.unlockedModes, totalPlays]);
  const activeModifiers = useMemo<GameModifiers>(() => {
    const secretModes = goalsState.secretModes ?? [];
    return {
      turbo: secretModes.includes("turbo"),
      mirror: secretModes.includes("mirror"),
      noGhost: secretModes.includes("noGhost")
    };
  }, [goalsState.secretModes]);

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.palette = settings.palette;
    document.documentElement.dataset.motion = settings.reducedMotion ? "reduced" : "full";
    setSfxMuted(!settings.sound);
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
    const handlePointerDown = (event: globalThis.PointerEvent) => {
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
    const prevStatus = statusRef.current;
    if (prevStatus !== "over" && state.status === "over") {
      updateGoalsState((prev) => {
        const nextPlays = prev.plays + 1;
        const unlocked = new Set<PlayMode>(prev.unlockedModes ?? []);
        unlocked.add("marathon");
        if (nextPlays >= MODE_UNLOCKS.sprint.plays) unlocked.add("sprint");
        if (nextPlays >= MODE_UNLOCKS.ultra.plays) unlocked.add("ultra");
        const ordered: PlayMode[] = ["marathon", "sprint", "ultra"];
        const nextModes = ordered.filter((mode) => unlocked.has(mode));
        const sameModes =
          nextModes.length === prev.unlockedModes.length &&
          nextModes.every((mode, index) => mode === prev.unlockedModes[index]);
        if (sameModes && nextPlays === prev.plays) return prev;
        return { ...prev, plays: nextPlays, unlockedModes: nextModes };
      });
    }
    statusRef.current = state.status;
  }, [state.status, updateGoalsState]);

  useEffect(() => {
    if (state.status === "start") {
      setStartStep("main");
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
    updateGoalsState((prev) => ({
      ...prev,
      unlocked: Array.from(new Set([...prev.unlocked, ...newlyUnlocked]))
    }));
  }, [goalsState.unlocked, state.level, state.lines, state.score, updateGoalsState]);

  useEffect(() => {
    if (state.lastClear > 0) playClear();
  }, [state.lastClear]);

  useEffect(() => {
    if (state.lastClear <= 0 || settings.reducedMotion) {
      setClearFlash(false);
      return;
    }
    setClearFlash(false);
    const rafId = window.requestAnimationFrame(() => setClearFlash(true));
    const timeoutId = window.setTimeout(() => setClearFlash(false), 520);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [settings.reducedMotion, state.lastClear]);

  useEffect(() => {
    if (state.lastClear === lastClearRef.current) return;
    if (state.lastClear > 0) {
      setComboCount((prev) => prev + 1);
      setComboPulse(performance.now());
    } else {
      setComboCount(0);
    }
    lastClearRef.current = state.lastClear;
  }, [state.lastClear]);

  useEffect(() => {
    if (!dropTrail) return;
    const timeoutId = window.setTimeout(() => setDropTrail(null), 320);
    return () => window.clearTimeout(timeoutId);
  }, [dropTrail]);

  useEffect(() => {
    if (!unlockedModes.has(selectedMode)) {
      setSelectedMode("marathon");
    }
  }, [selectedMode, unlockedModes]);

  const haptics = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);

  const handleAction = useCallback((action: Action) => {
    const current = stateRef.current;
    if (current.status === "start") return;
    const resolvedAction =
      current.modifiers.mirror && (action === "left" || action === "right")
        ? action === "left"
          ? "right"
          : "left"
        : action;
    if (resolvedAction === "hold" && !settings.holdEnabled) return;
    if (!canApplyAction(current, resolvedAction)) return;
    if (
      resolvedAction === "hardDrop" &&
      current.mode !== "arkanoid" &&
      !current.modifiers.noGhost &&
      !settings.reducedMotion
    ) {
      const ghost = getGhost(current);
      setDropTrail({
        active: current.active,
        ghost,
        startedAt: performance.now(),
        color: palette[current.active.type]
      });
    }
    dispatch(resolvedAction);
    if (current.status !== "running") return;
    const effect = ACTION_EFFECTS[resolvedAction];
    if (effect?.sound) effect.sound();
    if (effect?.haptics) haptics();
  }, [dispatch, haptics, palette, settings.holdEnabled, settings.reducedMotion, stateRef]);
  const inputEnabled = menuView === "none" && !showScoreEntry && !showCheatEntry;
  const { startRepeat, stopRepeat, stopAll } = useInput({
    enabled: inputEnabled,
    allowHold: settings.holdEnabled,
    gameStatus: state.status,
    settings,
    stateRef,
    onAction: handleAction
  });

  useEffect(() => {
    if (state.mode === "doom") stopAll();
  }, [state.mode, stopAll]);

  const nextQueue = useMemo(() => state.queue.slice(0, 3), [state.queue]);
  const comboActive = comboCount >= 2 && performance.now() - comboPulse < 900;
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

  const handleStartMenu = () => {
    setSelectedMode("marathon");
    setStartStep("mode");
  };

  const handleLaunch = () => {
    if (!unlockedModes.has(selectedMode)) return;
    setMenuView("none");
    setStartStep("main");
    applyState(() => startGame(resetGame(selectedMode, activeModifiers)));
  };

  const handleRestart = () => {
    setMenuView("none");
    setShowScoreEntry(false);
    setStartStep("main");
    setSelectedMode(state.playMode);
    applyState(() => startGame(resetGame(state.playMode, activeModifiers)));
  };

  const handleBackToMenu = () => {
    setMenuView("none");
    setShowScoreEntry(false);
    setStartStep("main");
    setSelectedMode(state.playMode);
    applyState(() => resetGame(state.playMode, activeModifiers));
  };

  const handleArkanoidPointer = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const current = stateRef.current;
      if (current.mode !== "arkanoid" || current.status !== "running") return;
      if (!event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * BOARD_WIDTH;
      applyState((prev) => setPaddlePosition(prev, x));
    },
    [applyState, stateRef]
  );

  const handleDoomPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const current = stateRef.current;
      if (current.mode !== "doom" || current.status !== "running") return;
      event.preventDefault();
      if (event.button === 2) return;
      if (document.pointerLockElement !== event.currentTarget) {
        event.currentTarget.requestPointerLock();
      }
      dispatch("doomShoot");
    },
    [dispatch, stateRef]
  );

  useEffect(() => {
    if (state.mode !== "doom") {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      return;
    }
    const handleMouseMove = (event: MouseEvent) => {
      if (!document.pointerLockElement) return;
      if (stateRef.current.mode !== "doom") return;
      const delta = event.movementX * 0.003;
      if (delta === 0) return;
      applyState((prev) => turnDoom(prev, delta));
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [applyState, state.mode, stateRef]);

  const openSecretMenu = useCallback(() => {
    setMenuView("secret");
    setCheatFeedback("idle");
    setShowCheatEntry(false);
    setCheatInput("");
  }, []);

  const handleCheatTap = useCallback(() => {
    const tracker = cheatTapRef.current;
    tracker.count += 1;
    if (tracker.timeoutId) window.clearTimeout(tracker.timeoutId);
    if (tracker.count >= CHEAT_TAP_TARGET) {
      tracker.count = 0;
      setShowCheatEntry(true);
      setCheatFeedback("idle");
      setCheatInput("");
      return;
    }
    tracker.timeoutId = window.setTimeout(() => {
      tracker.count = 0;
    }, 900);
  }, []);

  const handleCheatSubmit = useCallback(() => {
    const normalized = cheatInput.trim().toUpperCase();
    if (!normalized) return;
    if (normalized === CHEAT_CODE) {
      openSecretMenu();
      return;
    }
    if (normalized === DOOM_CODE) {
      applyState((prev) => forceDoom(prev));
      setCheatInput("");
      setCheatFeedback("idle");
      setShowCheatEntry(false);
      return;
    }
    setCheatFeedback("error");
  }, [applyState, cheatInput, openSecretMenu]);

  useEffect(() => {
    const handleCheatKeys = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key.length !== 1) return;
      const next = `${cheatBufferRef.current}${event.key}`.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const maxLen = Math.max(CHEAT_CODE.length, DOOM_CODE.length);
      cheatBufferRef.current = next.slice(-maxLen);
      if (cheatBufferRef.current.endsWith(CHEAT_CODE)) {
        cheatBufferRef.current = "";
        openSecretMenu();
        return;
      }
      if (cheatBufferRef.current.endsWith(DOOM_CODE)) {
        cheatBufferRef.current = "";
        applyState((prev) => forceDoom(prev));
      }
    };
    window.addEventListener("keydown", handleCheatKeys);
    return () => {
      window.removeEventListener("keydown", handleCheatKeys);
    };
  }, [applyState, openSecretMenu]);

  const toggleSecretMode = useCallback(
    (mode: keyof GameModifiers) => {
      updateGoalsState((prev) => {
        const current = new Set(prev.secretModes ?? []);
        if (current.has(mode)) {
          current.delete(mode);
        } else {
          current.add(mode);
        }
        return { ...prev, secretModes: Array.from(current) };
      });
    },
    [updateGoalsState]
  );

  const unlockMode = useCallback(
    (mode: PlayMode) => {
      updateGoalsState((prev) => {
        const current = new Set(prev.unlockedModes ?? []);
        current.add("marathon");
        current.add(mode);
        const ordered: PlayMode[] = ["marathon", "sprint", "ultra"];
        const nextModes = ordered.filter((entry) => current.has(entry));
        const sameModes =
          nextModes.length === prev.unlockedModes.length &&
          nextModes.every((entry, index) => entry === prev.unlockedModes[index]);
        if (sameModes) return prev;
        return { ...prev, unlockedModes: nextModes };
      });
    },
    [updateGoalsState]
  );

  const unlockAllModes = useCallback(() => {
    updateGoalsState((prev) => ({
      ...prev,
      unlockedModes: ["marathon", "sprint", "ultra"]
    }));
  }, [updateGoalsState]);

  const resetModeUnlocks = useCallback(() => {
    updateGoalsState((prev) => ({
      ...prev,
      plays: 0,
      unlockedModes: ["marathon"]
    }));
  }, [updateGoalsState]);

  const arkanoidTouchEnabled = isTouchMode && state.mode === "arkanoid" && state.status === "running";
  const doomPointerEnabled = state.mode === "doom" && state.status === "running";
  const modeTimeLeft = Math.max(0, state.modeTimer);
  const modeMinutes = Math.floor(modeTimeLeft / 60000);
  const modeSeconds = Math.floor((modeTimeLeft % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  const sprintLinesLeft = Math.max(0, state.targetLines - state.lines);
  const modeLabel = MODE_LABELS[state.playMode];

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
          <div className="hud-bar">
            <div className="hud-main">
              <div className="hud-title">
                <span className="eyebrow">Drop-a-Block</span>
                <div className="hud-mode">
                  <span className="hud-mode-label">{modeLabel}</span>
                  {state.playMode === "sprint" && (
                    <span className="hud-mode-sub">{sprintLinesLeft} lines left</span>
                  )}
                  {state.playMode === "ultra" && (
                    <span className="hud-mode-sub">
                      {modeMinutes}:{modeSeconds} remaining
                    </span>
                  )}
                </div>
              </div>
              <div className="hud-stats">
                <div className="hud-card">
                  <span className="label">Score</span>
                  <strong>{state.score.toLocaleString()}</strong>
                </div>
                <div className="hud-card">
                  <span className="label">Level</span>
                  <strong>{state.level}</strong>
                </div>
                <div className="hud-card">
                  <span className="label">Lines</span>
                  <strong>{state.lines}</strong>
                </div>
                {state.mode === "tetris" && (
                  <div className="hud-card">
                    <span className="label">Doom</span>
                    <strong>{doomLinesToReady} lines</strong>
                  </div>
                )}
                <div className="hud-card">
                  <span className="label">High</span>
                  <strong>{highScore.toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div className="hud-actions">
              <button
                className="icon-button hud-button"
                onClick={() => handleAction("pause")}
                aria-label={state.status === "paused" ? "Resume" : "Pause"}
              >
                <PauseIcon />
              </button>
              <button
                className="icon-button hud-button"
                onClick={() => setMenuView("settings")}
                aria-label="Open settings"
              >
                <SettingsIcon />
              </button>
            </div>
          </div>
          <div className="game-stage">
            <div
              className={clsx("board-panel", {
                "clear-flash": clearFlash,
                "clear-shake": clearShake,
                arkanoid: state.mode === "arkanoid",
                doom: state.mode === "doom",
                "clear-lines": clearFlash,
                [`clear-lines-${state.lastClear}`]: clearFlash
              })}
            >
              <GameCanvas
                state={state}
                palette={palette}
                dropTrail={dropTrail}
                reducedMotion={settings.reducedMotion}
                theme={settings.theme}
                onPointerDown={
                  doomPointerEnabled
                    ? handleDoomPointerDown
                    : arkanoidTouchEnabled
                      ? handleArkanoidPointer
                      : undefined
                }
                onPointerMove={arkanoidTouchEnabled ? handleArkanoidPointer : undefined}
              />
              {comboActive && state.status === "running" && (
                <div className="combo-badge" aria-live="polite">
                  Combo x{comboCount}
                </div>
              )}
              {state.status === "start" && (
                <div className="overlay start-overlay">
                  <div className="start-menu">
                    <div className="start-menu-header" onClick={handleCheatTap}>
                      <p className="eyebrow">Start Menu</p>
                      <h2>{startStep === "mode" ? "Choose your mode" : "Ready to drop?"}</h2>
                      <p className="subtitle">
                        {startStep === "mode"
                          ? "Normal is unlocked by default. Other modes unlock after you play."
                          : "Start a run, then pick the game mode type."}
                      </p>
                    </div>
                    {startStep === "mode" ? (
                      <>
                        <div className="mode-select">
                          <p className="eyebrow">Game Mode</p>
                          <div className="mode-options">
                            {MODE_OPTIONS.map((mode) => {
                              const isUnlocked = unlockedModes.has(mode.id);
                              const requirement =
                                mode.id === "marathon"
                                  ? null
                                  : MODE_UNLOCKS[mode.id as Exclude<PlayMode, "marathon">];
                              const progress = requirement
                                ? Math.min(totalPlays, requirement.plays)
                                : 0;
                              return (
                                <button
                                  key={mode.id}
                                  type="button"
                                  className={clsx("mode-option", {
                                    active: selectedMode === mode.id,
                                    locked: !isUnlocked
                                  })}
                                  onClick={() => isUnlocked && setSelectedMode(mode.id)}
                                  disabled={!isUnlocked}
                                >
                                  <span className="mode-option-title">{mode.label}</span>
                                  <span className="mode-option-desc">{mode.desc}</span>
                                  {!isUnlocked && requirement && (
                                    <span className="mode-option-lock">
                                      Locked · {requirement.label} ({progress}/{requirement.plays})
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="mode-unlock-progress muted">
                          Games finished: {totalPlays}
                        </div>
                        <div className="start-menu-actions">
                          <button
                            className="menu-button primary"
                            onClick={handleLaunch}
                            disabled={!unlockedModes.has(selectedMode)}
                          >
                            <span className="menu-icon">
                              <PlayIcon />
                            </span>
                            <span className="menu-copy">
                              <strong>Launch {MODE_LABELS[selectedMode]}</strong>
                              <span className="menu-desc">Drop into level {state.level}.</span>
                            </span>
                          </button>
                          <button className="menu-button" onClick={() => setStartStep("main")}>
                            <span className="menu-icon">
                              <ArrowLeftIcon />
                            </span>
                            <span className="menu-copy">
                              <strong>Back</strong>
                              <span className="menu-desc">Return to the start menu.</span>
                            </span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="start-menu-actions">
                        <button className="menu-button primary" onClick={handleStartMenu}>
                          <span className="menu-icon">
                            <PlayIcon />
                          </span>
                          <span className="menu-copy">
                            <strong>Start Game</strong>
                            <span className="menu-desc">Pick your mode next.</span>
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
                    )}
                    {showCheatEntry && (
                      <div className="cheat-entry">
                        <p className="eyebrow">Cheat Code</p>
                        <div className="cheat-row">
                          <input
                            value={cheatInput}
                            onChange={(event) => {
                              setCheatInput(event.target.value);
                              if (cheatFeedback !== "idle") setCheatFeedback("idle");
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") handleCheatSubmit();
                            }}
                            placeholder="Enter code"
                            aria-label="Cheat code"
                            autoComplete="off"
                          />
                          <button className="primary" onClick={handleCheatSubmit}>
                            Enter
                          </button>
                        </div>
                        {cheatFeedback === "error" && (
                          <span className="cheat-feedback">Nope. Try again.</span>
                        )}
                      </div>
                    )}
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
                  <div className="game-over-panel">
                    <div>
                      <p className="eyebrow">Run Summary</p>
                      <h2>{state.result === "win" ? "Mode Complete" : "Game Over"}</h2>
                      <p className="muted">
                        {state.result === "win"
                          ? `${modeLabel} wrapped with ${state.score.toLocaleString()} points.`
                          : `Final score ${state.score.toLocaleString()}.`}
                      </p>
                    </div>
                    <div className="summary-grid">
                      <div className="summary-card">
                        <span className="label">Score</span>
                        <strong>{state.score.toLocaleString()}</strong>
                      </div>
                      <div className="summary-card">
                        <span className="label">Lines</span>
                        <strong>{state.lines}</strong>
                      </div>
                      <div className="summary-card">
                        <span className="label">Level</span>
                        <strong>{state.level}</strong>
                      </div>
                      <div className="summary-card">
                        <span className="label">Mode</span>
                        <strong>{modeLabel}</strong>
                      </div>
                    </div>
                    <div className="summary-actions">
                      <button type="button" className="primary" onClick={handleRestart}>
                        Play Again
                      </button>
                      <button type="button" className="ghost" onClick={handleBackToMenu}>
                        Back to Menu
                      </button>
                    </div>
                  </div>
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
                  {state.mode === "tetris" && (
                    <div className="stat-card">
                      <span className="label">Flip in</span>
                      <strong>{linesToFlip} lines</strong>
                    </div>
                  )}
                  {state.mode === "tetris" && (
                    <div className="stat-card">
                      <span className="label">Doom</span>
                      <strong>{doomLinesToReady} lines</strong>
                    </div>
                  )}
                  <div className="stat-card">
                    <span className="label">Mode</span>
                    <strong>{modeLabel}</strong>
                  </div>
                  {state.playMode === "sprint" && (
                    <div className="stat-card">
                      <span className="label">Lines left</span>
                      <strong>{sprintLinesLeft}</strong>
                    </div>
                  )}
                  {state.playMode === "ultra" && (
                    <div className="stat-card">
                      <span className="label">Time left</span>
                      <strong>
                        {modeMinutes}:{modeSeconds}
                      </strong>
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
                {state.mode === "doom" && state.status === "running" && (
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
              {settings.holdEnabled ? (
                <div className="panel">
                  <h2>Hold</h2>
                  <MiniGrid type={state.hold} label="Hold piece" palette={palette} />
                </div>
              ) : (
                <div className="panel panel-muted">
                  <h2>Hold</h2>
                  <p className="muted">Disabled in settings.</p>
                </div>
              )}
              <div className="panel">
                <h2>Next</h2>
                <div className="next-queue">
                  {nextQueue.map((type, index) => (
                    <MiniGrid
                      key={`${type}-${index}`}
                      type={type}
                      label={`Next piece ${index + 1}`}
                      palette={palette}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {isTouchMode && state.mode !== "doom" && (
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
              holdEnabled={settings.holdEnabled}
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
                      : menuView === "secret"
                        ? "Secret Menu"
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
                  {settings.holdEnabled && (
                    <li>
                      <strong>Hold</strong> with C / Shift to swap the current tetromino.
                    </li>
                  )}
                  <li>
                    <strong>Arkanoid mode</strong> triggers every {ARKANOID_TRIGGER_LINES} lines for 30 seconds.
                  </li>
                  <li>
                    <strong>Doom run</strong> triggers every {DOOM_TRIGGER_LINES} lines. You get{" "}
                    {Math.round(DOOM_DURATION / 1000)} seconds to clear a path to the exit with WASD + mouse.
                  </li>
                  <li>
                    <strong>Doom pickups</strong> restore health, armor, and ammo. Enemies can drain your health.
                  </li>
                  <li>
                    <strong>Modes</strong> include Normal (Marathon), Sprint ({SPRINT_TARGET_LINES} lines),
                    and Ultra ({Math.round(ULTRA_DURATION / 60000)} minutes).
                  </li>
                  <li>
                    <strong>Pause</strong> anytime with P or Esc.
                  </li>
                </ul>
              </div>
            ) : menuView === "scores" ? (
              <HighScores scores={scores} className="embedded" />
            ) : menuView === "secret" ? (
              <div className="secret-panel">
                <p className="muted">Secret console unlocked. Changes apply to your next run.</p>
                <div className="secret-section">
                  <h3>Mode Unlocks</h3>
                  <div className="secret-grid">
                    {MODE_OPTIONS.filter((mode) => mode.id !== "marathon").map((mode) => {
                      const isUnlocked = unlockedModes.has(mode.id);
                      const requirement = MODE_UNLOCKS[mode.id as Exclude<PlayMode, "marathon">];
                      const progress = Math.min(totalPlays, requirement.plays);
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          className={clsx("secret-toggle", { active: isUnlocked })}
                          onClick={() => unlockMode(mode.id)}
                          disabled={isUnlocked}
                        >
                          <span className="secret-title">
                            {mode.label}
                            <span className="secret-status">
                              {isUnlocked ? "Unlocked" : `Locked · ${progress}/${requirement.plays}`}
                            </span>
                          </span>
                          <span className="secret-desc">{mode.desc}</span>
                          {!isUnlocked && (
                            <span className="secret-meta">{requirement.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="secret-actions">
                    <button className="secret-action" onClick={unlockAllModes}>
                      Unlock All Modes
                    </button>
                    <button className="secret-action" onClick={resetModeUnlocks}>
                      Reset Mode Unlocks
                    </button>
                  </div>
                </div>
                <div className="secret-section">
                  <h3>Fun Modes</h3>
                  <div className="secret-grid">
                    {SECRET_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        className={clsx("secret-toggle", {
                          active: Boolean(activeModifiers[mode.id])
                        })}
                        aria-pressed={Boolean(activeModifiers[mode.id])}
                        onClick={() => toggleSecretMode(mode.id)}
                      >
                        <span className="secret-title">
                          {mode.label}
                          <span className="secret-status">
                            {activeModifiers[mode.id] ? "On" : "Off"}
                          </span>
                        </span>
                        <span className="secret-desc">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="help-panel">
                <p className="muted about-copy">
                  Board size {BOARD_WIDTH}x{VISIBLE_ROWS} with {BOARD_HEIGHT - VISIBLE_ROWS} hidden spawn rows.
                  Colors are mapped per tetromino.
                </p>
                <div className="legend about-legend">
                  {Object.entries(palette).map(([key, value]) => (
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
