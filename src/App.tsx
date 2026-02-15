import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import clsx from "clsx";
import {
  BOARD_WIDTH,
  forceDoom,
  getDoomTriggerLines,
  getGhost,
  setPaddlePosition,
  startGame,
  turnDoom,
  resetGame
} from "./engine/engine";
import { Controls } from "./components/Controls";
import { GameCanvas, type DropTrail } from "./components/GameCanvas";
import { GameOverOverlay } from "./components/GameOverOverlay";
import { HudBar } from "./components/HudBar";
import { MenuModal } from "./components/MenuModal";
import { PauseOverlay } from "./components/PauseOverlay";
import { QueuePanel } from "./components/QueuePanel";
import { ScoreEntryModal } from "./components/ScoreEntryModal";
import { StartOverlay } from "./components/StartOverlay";
import { StatsPanel } from "./components/StatsPanel";
import { loadGoalsState, loadScores, loadSettings, saveGoalsState, saveScore, saveSettings } from "./utils/storage";
import { playClear, setSfxMuted } from "./audio/sfx";
import { Action, canApplyAction } from "./game/actions";
import { ACTION_EFFECTS } from "./game/actionEffects";
import {
  CHEAT_CODE,
  CHEAT_TAP_TARGET,
  DOOM_CODE,
  isCheatMatch,
  normalizeCheatInput,
  updateCheatBuffer
} from "./game/cheats";
import { useInput } from "./game/input";
import {
  getUnlockedModes,
  MODE_LABELS,
  MODE_ORDER,
  MODE_UNLOCKS,
  orderModes,
  SECRET_MODES
} from "./game/modes";
import { useGame } from "./game/useGame";
import { evaluateGoals, getNextLevelTarget } from "./utils/goals";
import type { GameModifiers, PlayMode } from "./engine/types";
import { isEditableTarget } from "./utils/dom";
import { getPalette } from "./ui/palettes";
import type { CheatFeedback, MenuView, StartStep } from "./ui/types";

export const App = () => {
  const { state, stateRef, applyState, dispatch } = useGame();
  const [settings, setSettings] = useState(loadSettings);
  const [scores, setScores] = useState(loadScores);
  const [goalsState, setGoalsState] = useState(loadGoalsState);
  const [initials, setInitials] = useState("");
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>("none");
  const [clearFlash, setClearFlash] = useState(false);
  const [dropTrail, setDropTrail] = useState<DropTrail | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [comboPulse, setComboPulse] = useState(0);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [startStep, setStartStep] = useState<StartStep>("main");
  const [selectedMode, setSelectedMode] = useState<PlayMode>("marathon");
  const [showCheatEntry, setShowCheatEntry] = useState(false);
  const [cheatInput, setCheatInput] = useState("");
  const [cheatFeedback, setCheatFeedback] = useState<CheatFeedback>("idle");
  const arkanoidSeconds = Math.ceil(state.arkanoid.timeLeft / 1000);
  const doomSeconds = Math.ceil(state.doom.timeLeft / 1000);
  const doomTriggerLines = getDoomTriggerLines(state.modifiers);
  const doomLinesToReady = Math.max(0, doomTriggerLines - state.doomMeter);
  const nextLevelTarget = getNextLevelTarget(state.level);
  const levelStart = (state.level - 1) * 10;
  const linesToNextLevel = Math.max(0, nextLevelTarget - state.lines);
  const linesIntoLevel = state.lines - levelStart;
  const levelProgress = Math.min(1, linesIntoLevel / 10);
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
  const unlockedModes = useMemo(
    () => getUnlockedModes(totalPlays, goalsState.unlockedModes),
    [goalsState.unlockedModes, totalPlays]
  );
  const activeModifiers = useMemo<GameModifiers>(() => {
    const secretModes = goalsState.secretModes ?? [];
    return {
      turbo: secretModes.includes("turbo"),
      floaty: secretModes.includes("floaty"),
      freeHold: secretModes.includes("freeHold"),
      mirror: secretModes.includes("mirror"),
      noGhost: secretModes.includes("noGhost"),
      arcadeRush: secretModes.includes("arcadeRush"),
      party: secretModes.includes("party")
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
        const nextModes = orderModes(unlocked);
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

  const handleCheatInputChange = useCallback((value: string) => {
    setCheatInput(value);
    setCheatFeedback("idle");
  }, []);

  const handleCheatSubmit = useCallback(() => {
    const normalized = normalizeCheatInput(cheatInput);
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
      cheatBufferRef.current = updateCheatBuffer(cheatBufferRef.current, event.key);
      if (isCheatMatch(cheatBufferRef.current, CHEAT_CODE)) {
        cheatBufferRef.current = "";
        openSecretMenu();
        return;
      }
      if (isCheatMatch(cheatBufferRef.current, DOOM_CODE)) {
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

  const shuffleFunModes = useCallback(() => {
    updateGoalsState((prev) => {
      const options = SECRET_MODES.map((mode) => mode.id);
      if (options.length === 0) return prev;
      const count = Math.floor(Math.random() * Math.min(3, options.length)) + 1;
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      return { ...prev, secretModes: shuffled.slice(0, count) };
    });
  }, [updateGoalsState]);

  const clearFunModes = useCallback(() => {
    updateGoalsState((prev) => {
      if (!prev.secretModes || prev.secretModes.length === 0) return prev;
      return { ...prev, secretModes: [] };
    });
  }, [updateGoalsState]);

  const unlockMode = useCallback(
    (mode: PlayMode) => {
      updateGoalsState((prev) => {
        const current = new Set(prev.unlockedModes ?? []);
        current.add("marathon");
        current.add(mode);
        const nextModes = orderModes(current);
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
      unlockedModes: MODE_ORDER
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
  const activeMenu = !showScoreEntry && menuView !== "none" ? menuView : null;

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
          <HudBar
            status={state.status}
            mode={state.mode}
            playMode={state.playMode}
            modeLabel={modeLabel}
            sprintLinesLeft={sprintLinesLeft}
            modeMinutes={modeMinutes}
            modeSeconds={modeSeconds}
            score={state.score}
            level={state.level}
            lines={state.lines}
            doomLinesToReady={doomLinesToReady}
            highScore={highScore}
            onPause={() => handleAction("pause")}
            onOpenSettings={() => setMenuView("settings")}
          />
          <div className="game-stage">
            <div
              className={clsx("board-panel", {
                "clear-flash": clearFlash,
                "clear-shake": clearShake,
                arkanoid: state.mode === "arkanoid",
                doom: state.mode === "doom",
                party: state.modifiers.party,
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
                <StartOverlay
                  startStep={startStep}
                  selectedMode={selectedMode}
                  unlockedModes={unlockedModes}
                  totalPlays={totalPlays}
                  startLevel={state.level}
                  showCheatEntry={showCheatEntry}
                  cheatInput={cheatInput}
                  cheatFeedback={cheatFeedback}
                  onCheatTap={handleCheatTap}
                  onCheatInputChange={handleCheatInputChange}
                  onCheatSubmit={handleCheatSubmit}
                  onSelectMode={setSelectedMode}
                  onLaunch={handleLaunch}
                  onStartMenu={handleStartMenu}
                  onBack={() => setStartStep("main")}
                  onOpenScores={() => setMenuView("scores")}
                  onOpenSettings={() => setMenuView("settings")}
                  onOpenHelp={() => setMenuView("help")}
                  onOpenAbout={() => setMenuView("about")}
                />
              )}
              {state.status === "paused" && (
                <PauseOverlay onResume={() => handleAction("pause")} />
              )}
              {state.status === "over" && (
                <GameOverOverlay
                  result={state.result}
                  modeLabel={modeLabel}
                  score={state.score}
                  lines={state.lines}
                  level={state.level}
                  onRestart={handleRestart}
                  onBackToMenu={handleBackToMenu}
                />
              )}
            </div>
            <div className="side-panel left">
              <StatsPanel
                level={state.level}
                mode={state.mode}
                arkanoidSeconds={arkanoidSeconds}
                doomSeconds={doomSeconds}
                status={state.status}
                linesToNextLevel={linesToNextLevel}
                levelProgress={levelProgress}
                linesIntoLevel={linesIntoLevel}
                nextLevelTarget={nextLevelTarget}
                displayGoals={displayGoals}
              />
            </div>
            <div className="side-panel right">
              <QueuePanel
                holdEnabled={settings.holdEnabled}
                holdPiece={state.hold}
                nextQueue={nextQueue}
                palette={palette}
              />
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
        <ScoreEntryModal initials={initials} onChange={setInitials} onSave={handleScoreSubmit} />
      )}

      {activeMenu && (
        <MenuModal
          view={activeMenu}
          onClose={() => setMenuView("none")}
          settings={settings}
          onSettingsChange={setSettings}
          scores={scores}
          palette={palette}
          unlockedModes={unlockedModes}
          totalPlays={totalPlays}
          activeModifiers={activeModifiers}
          onToggleSecretMode={toggleSecretMode}
          onShuffleFunModes={shuffleFunModes}
          onClearFunModes={clearFunModes}
          onUnlockMode={unlockMode}
          onUnlockAllModes={unlockAllModes}
          onResetModeUnlocks={resetModeUnlocks}
        />
      )}
    </div>
  );
};
