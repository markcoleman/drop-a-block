import clsx from "clsx";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { playClear, setSfxMuted } from "./audio/sfx";
import { Controls } from "./components/Controls";
import { type DropTrail, GameCanvas } from "./components/GameCanvas";
import { GameOverOverlay } from "./components/GameOverOverlay";
import { HudBar } from "./components/HudBar";
import { IconButton } from "./components/IconButton";
import { EyeIcon } from "./components/Icons";
import { MenuModal } from "./components/MenuModal";
import { PauseOverlay } from "./components/PauseOverlay";
import { QueuePanel } from "./components/QueuePanel";
import { ScoreEntryModal } from "./components/ScoreEntryModal";
import { StartOverlay } from "./components/StartOverlay";
import { StatsPanel } from "./components/StatsPanel";
import {
  BOARD_WIDTH,
  forceDoom,
  getDoomTriggerLines,
  getGhost,
  resetGame,
  setPaddlePosition,
  startGame,
  turnDoom,
  VISIBLE_ROWS
} from "./engine/engine";
import type { GameModifiers, PlayMode } from "./engine/types";
import { ACTION_EFFECTS } from "./game/actionEffects";
import { Action, canApplyAction } from "./game/actions";
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
import { setLanguage, translate } from "./i18n";
import { getPalette } from "./ui/palettes";
import { applyThemeToDocument } from "./ui/themes";
import type { CheatFeedback, MenuView, StartStep } from "./ui/types";
import { isEditableTarget } from "./utils/dom";
import { evaluateGoals, getNextLevelTarget } from "./utils/goals";
import {
  loadGoalsState,
  loadScores,
  loadSettings,
  saveGoalsState,
  saveScore,
  saveSettings
} from "./utils/storage";

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
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [startStep, setStartStep] = useState<StartStep>("main");
  const [selectedMode, setSelectedMode] = useState<PlayMode>("marathon");
  const [showCheatEntry, setShowCheatEntry] = useState(false);
  const [cheatInput, setCheatInput] = useState("");
  const [cheatFeedback, setCheatFeedback] = useState<CheatFeedback>("idle");
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const arkanoidSeconds = Math.ceil(state.arkanoid.timeLeft / 1000);
  const doomSeconds = Math.ceil(state.doom.timeLeft / 1000);
  const bonusSeconds = Math.ceil(state.bonusTimeLeft / 1000);
  const bonusActive = state.mode === "tetris" && state.bonusTimeLeft > 0;
  const doomTriggerLines = getDoomTriggerLines(state.modifiers);
  const doomLinesToReady = Math.max(0, doomTriggerLines - state.doomMeter);
  const nextLevelTarget = getNextLevelTarget(state.level);
  const levelStart = (state.level - 1) * 10;
  const linesToNextLevel = Math.max(0, nextLevelTarget - state.lines);
  const linesIntoLevel = state.lines - levelStart;
  const levelProgress = Math.min(1, linesIntoLevel / 10);
  const palette = useMemo(
    () => getPalette(settings.palette, settings.theme, settings.customTheme),
    [settings.customTheme, settings.palette, settings.theme]
  );
  const themeToken = useMemo(
    () => JSON.stringify([settings.theme, settings.customTheme]),
    [settings.customTheme, settings.theme]
  );
  const highScore = scores[0]?.score ?? 0;
  const clearShake = !settings.reducedMotion && clearFlash && state.lastClear >= 2;
  const statusRef = useRef(state.status);
  const lastClearRef = useRef(state.lastClear);
  const cheatTapRef = useRef<{ count: number; timeoutId?: number }>({ count: 0 });
  const cheatBufferRef = useRef("");
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const touchGestureRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    movedColumns: number;
    movedRows: number;
    startedAt: number;
    cellWidth: number;
    cellHeight: number;
  } | null>(null);
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
    applyThemeToDocument(document.documentElement, settings.theme, settings.customTheme);
    document.documentElement.dataset.palette = settings.palette;
    document.documentElement.dataset.motion = settings.reducedMotion ? "reduced" : "full";
    document.documentElement.lang = settings.language;
    setLanguage(settings.language);
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
    const narrowQuery = window.matchMedia("(max-width: 720px)");
    const updateViewportMode = () => setIsNarrowViewport(narrowQuery.matches);
    updateViewportMode();

    if (narrowQuery.addEventListener) {
      narrowQuery.addEventListener("change", updateViewportMode);
    } else {
      narrowQuery.addListener(updateViewportMode);
    }

    return () => {
      if (narrowQuery.removeEventListener) {
        narrowQuery.removeEventListener("change", updateViewportMode);
      } else {
        narrowQuery.removeListener(updateViewportMode);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let canceled = false;

    const releaseWakeLock = async () => {
      try {
        await wakeLockRef.current?.release();
      } catch {
        // Ignore wake lock release errors.
      }
      wakeLockRef.current = null;
    };

    const requestWakeLock = async () => {
      if (canceled || state.status !== "running" || document.visibilityState !== "visible") {
        return;
      }
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      } catch {
        wakeLockRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
        return;
      }
      void releaseWakeLock();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (state.status === "running") {
      void requestWakeLock();
    } else {
      void releaseWakeLock();
    }

    return () => {
      canceled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void releaseWakeLock();
    };
  }, [state.status]);

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
    const params = new URLSearchParams(window.location.search);
    const launchTarget = params.get("launch");
    if (!launchTarget) return;
    if (launchTarget === "scores") {
      setMenuView("scores");
      return;
    }
    if (launchTarget === "play") {
      setMenuView("none");
      setStartStep("mode");
    }
  }, []);

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

  const triggerHaptics = useCallback(
    (pattern: number | number[] = 10) => {
      if (!isTouchMode || typeof navigator.vibrate !== "function") return;
      navigator.vibrate(pattern);
    },
    [isTouchMode]
  );

  const triggerActionHaptics = useCallback(
    (action: Action) => {
      if (!isTouchMode) return;
      if (action === "hardDrop") {
        triggerHaptics([12, 10, 20]);
        return;
      }
      if (action === "rotateCw" || action === "rotateCcw" || action === "hold") {
        triggerHaptics(8);
      }
    },
    [isTouchMode, triggerHaptics]
  );

  const requestMobileImmersive = useCallback(async () => {
    if (!isTouchMode || !isNarrowViewport) return;
    const root = document.documentElement;
    if (!document.fullscreenElement && typeof root.requestFullscreen === "function") {
      try {
        await root.requestFullscreen({ navigationUI: "hide" });
      } catch {
        // Ignore fullscreen request failures (not supported or blocked by browser policy).
      }
    }
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: "portrait" | "landscape") => Promise<void>;
    };
    if (typeof orientation.lock === "function") {
      try {
        await orientation.lock("portrait");
      } catch {
        // Ignore orientation lock failures.
      }
    }
  }, [isNarrowViewport, isTouchMode]);

  const handleAction = useCallback(
    (action: Action) => {
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
      if (effect?.haptics) triggerActionHaptics(resolvedAction);
    },
    [
      dispatch,
      palette,
      settings.holdEnabled,
      settings.reducedMotion,
      stateRef,
      triggerActionHaptics
    ]
  );
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

  useEffect(() => {
    if (state.mode !== "tetris" || state.status !== "running") {
      touchGestureRef.current = null;
    }
  }, [state.mode, state.status]);

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

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const canInstall = Boolean(installPromptEvent);

  const handleInstallApp = useCallback(async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  }, [installPromptEvent]);

  const handleShareApp = useCallback(async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: translate("start.shareGame", undefined, settings.language, "Share Drop-a-Block"),
        text: translate(
          "start.shareGameDesc",
          undefined,
          settings.language,
          "Send this game to a friend in one tap."
        ),
        url: window.location.href
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }, [canShare, settings.language]);

  const handleStartMenu = () => {
    setSelectedMode("marathon");
    setStartStep("mode");
  };

  const handleLaunch = () => {
    if (!unlockedModes.has(selectedMode)) return;
    void requestMobileImmersive();
    setMenuView("none");
    setStartStep("main");
    applyState(() => startGame(resetGame(selectedMode, activeModifiers)));
  };

  const handleRestart = () => {
    void requestMobileImmersive();
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

  const handleTetrisPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const current = stateRef.current;
      if (current.mode !== "tetris" || current.status !== "running") return;
      if (event.pointerType === "mouse") return;
      if (touchGestureRef.current) return;
      const rect = event.currentTarget.getBoundingClientRect();
      touchGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        movedColumns: 0,
        movedRows: 0,
        startedAt: performance.now(),
        cellWidth: rect.width / BOARD_WIDTH,
        cellHeight: rect.height / VISIBLE_ROWS
      };
    },
    [stateRef]
  );

  const handleTetrisPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const gesture = touchGestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      const current = stateRef.current;
      if (current.mode !== "tetris" || current.status !== "running") {
        touchGestureRef.current = null;
        return;
      }

      const totalX = event.clientX - gesture.startX;
      const totalY = event.clientY - gesture.startY;
      const moveThreshold = Math.max(5, gesture.cellWidth * 0.32);
      const targetColumns =
        totalX >= 0 ? Math.floor(totalX / moveThreshold) : Math.ceil(totalX / moveThreshold);

      while (gesture.movedColumns < targetColumns) {
        handleAction("right");
        gesture.movedColumns += 1;
      }

      while (gesture.movedColumns > targetColumns) {
        handleAction("left");
        gesture.movedColumns -= 1;
      }

      const rowDragThreshold = Math.max(8, gesture.cellHeight * 0.5);
      const targetRows = Math.max(0, Math.floor(totalY / rowDragThreshold));
      while (gesture.movedRows < targetRows) {
        handleAction("down");
        gesture.movedRows += 1;
      }
    },
    [handleAction, stateRef]
  );

  const handleTetrisPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const gesture = touchGestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      touchGestureRef.current = null;
      const current = stateRef.current;
      if (current.mode !== "tetris" || current.status !== "running") return;

      const tapMaxDuration = 320;
      const tapSlop = Math.max(10, gesture.cellWidth * 0.35);
      const elapsed = performance.now() - gesture.startedAt;
      const movedX = Math.abs(event.clientX - gesture.startX);
      const movedY = Math.abs(event.clientY - gesture.startY);
      if (elapsed <= tapMaxDuration && movedX <= tapSlop && movedY <= tapSlop) {
        handleAction("rotateCw");
      }
    },
    [handleAction, stateRef]
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

  const arkanoidTouchEnabled =
    isTouchMode && state.mode === "arkanoid" && state.status === "running";
  const tetrisTouchEnabled =
    isTouchMode && state.mode === "tetris" && state.status === "running" && inputEnabled;
  const mobileControlsEnabled = isTouchMode && settings.mobileControls;
  const doomPointerEnabled = state.mode === "doom" && state.status === "running";
  const modeTimeLeft = Math.max(0, state.modeTimer);
  const modeMinutes = Math.floor(modeTimeLeft / 60000);
  const modeSeconds = Math.floor((modeTimeLeft % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  const sprintLinesLeft = Math.max(0, state.targetLines - state.lines);
  const modeLabel = translate(
    `mode.${state.playMode}.label`,
    undefined,
    settings.language,
    MODE_LABELS[state.playMode]
  );
  const mobileFocusMode = isTouchMode && isNarrowViewport;
  const showHud = settings.showHud && !mobileFocusMode;
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
    <div
      className={clsx("app", {
        "touch-enabled": isTouchMode,
        "mobile-focus": mobileFocusMode,
        "mobile-controls-enabled": mobileControlsEnabled
      })}
    >
      <main className="layout">
        <section className="game-panel">
          {showHud && (
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
              onHideHud={() => setSettings((prev) => ({ ...prev, showHud: false }))}
            />
          )}
          <div className="game-stage">
            <div
              className={clsx("board-panel", {
                "clear-flash": clearFlash,
                "clear-shake": clearShake,
                arkanoid: state.mode === "arkanoid",
                doom: state.mode === "doom",
                bonus: bonusActive,
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
                themeKey={themeToken}
                onPointerDown={
                  doomPointerEnabled
                    ? handleDoomPointerDown
                    : arkanoidTouchEnabled
                      ? handleArkanoidPointer
                      : tetrisTouchEnabled
                        ? handleTetrisPointerDown
                        : undefined
                }
                onPointerMove={
                  arkanoidTouchEnabled
                    ? handleArkanoidPointer
                    : tetrisTouchEnabled
                      ? handleTetrisPointerMove
                      : undefined
                }
                onPointerUp={tetrisTouchEnabled ? handleTetrisPointerUp : undefined}
              />
              {!showHud && !mobileFocusMode && (
                <IconButton
                  className="hud-reveal-button"
                  label={translate("app.showHud", undefined, settings.language, "Show HUD")}
                  onClick={() => setSettings((prev) => ({ ...prev, showHud: true }))}
                >
                  <EyeIcon />
                </IconButton>
              )}
              {comboActive && state.status === "running" && (
                <div className="combo-badge" aria-live="polite">
                  {translate(
                    "app.combo",
                    { count: comboCount },
                    settings.language,
                    `Combo x${comboCount}`
                  )}
                </div>
              )}
              {bonusActive && state.status === "running" && (
                <div className="bonus-timer" aria-live="polite">
                  <span className="bonus-label">
                    {translate("app.bonus", undefined, settings.language, "Bonus")}
                  </span>
                  <strong>{bonusSeconds}s</strong>
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
                  canInstall={canInstall}
                  onInstallApp={handleInstallApp}
                  canShare={canShare}
                  onShareApp={handleShareApp}
                />
              )}
              {state.status === "paused" && <PauseOverlay onResume={() => handleAction("pause")} />}
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
            {showHud && (
              <>
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
              </>
            )}
          </div>
          {mobileControlsEnabled && state.mode !== "doom" && (
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
