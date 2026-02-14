import clsx from "clsx";
import type { ReactNode } from "react";
import type { PlayMode } from "../engine/types";
import { MODE_LABELS, MODE_OPTIONS, MODE_UNLOCKS } from "../game/modes";
import type { CheatFeedback, StartStep } from "../ui/types";
import {
  ArrowLeftIcon,
  HelpIcon,
  PlayIcon,
  SettingsIcon,
  TrophyIcon
} from "./Icons";

type StartOverlayProps = {
  startStep: StartStep;
  selectedMode: PlayMode;
  unlockedModes: Set<PlayMode>;
  totalPlays: number;
  startLevel: number;
  showCheatEntry: boolean;
  cheatInput: string;
  cheatFeedback: CheatFeedback;
  onCheatTap: () => void;
  onCheatInputChange: (value: string) => void;
  onCheatSubmit: () => void;
  onSelectMode: (mode: PlayMode) => void;
  onLaunch: () => void;
  onStartMenu: () => void;
  onBack: () => void;
  onOpenScores: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
};

const StartMenuButton = ({
  icon,
  title,
  desc,
  onClick,
  className,
  disabled
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      className={clsx("menu-button", className)}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="menu-icon">{icon}</span>
      <span className="menu-copy">
        <strong>{title}</strong>
        <span className="menu-desc">{desc}</span>
      </span>
    </button>
  );
};

export const StartOverlay = ({
  startStep,
  selectedMode,
  unlockedModes,
  totalPlays,
  startLevel,
  showCheatEntry,
  cheatInput,
  cheatFeedback,
  onCheatTap,
  onCheatInputChange,
  onCheatSubmit,
  onSelectMode,
  onLaunch,
  onStartMenu,
  onBack,
  onOpenScores,
  onOpenSettings,
  onOpenHelp,
  onOpenAbout
}: StartOverlayProps) => {
  return (
    <div className="overlay start-overlay">
      <div className="start-menu">
        <div className="start-menu-header" onClick={onCheatTap}>
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
                  const progress = requirement ? Math.min(totalPlays, requirement.plays) : 0;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      className={clsx("mode-option", {
                        active: selectedMode === mode.id,
                        locked: !isUnlocked
                      })}
                      onClick={() => isUnlocked && onSelectMode(mode.id)}
                      disabled={!isUnlocked}
                    >
                      <span className="mode-option-title">{mode.label}</span>
                      <span className="mode-option-desc">{mode.desc}</span>
                      {!isUnlocked && requirement && (
                        <span className="mode-option-lock">
                          Locked - {requirement.label} ({progress}/{requirement.plays})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mode-unlock-progress muted">Games finished: {totalPlays}</div>
            <div className="start-menu-actions">
              <StartMenuButton
                className="primary"
                onClick={onLaunch}
                disabled={!unlockedModes.has(selectedMode)}
                icon={<PlayIcon />}
                title={`Launch ${MODE_LABELS[selectedMode]}`}
                desc={`Drop into level ${startLevel}.`}
              />
              <StartMenuButton
                onClick={onBack}
                icon={<ArrowLeftIcon />}
                title="Back"
                desc="Return to the start menu."
              />
            </div>
          </>
        ) : (
          <div className="start-menu-actions">
            <StartMenuButton
              className="primary"
              onClick={onStartMenu}
              icon={<PlayIcon />}
              title="Start Game"
              desc="Pick your mode next."
            />
            <StartMenuButton
              onClick={onOpenScores}
              icon={<TrophyIcon />}
              title="High Scores"
              desc="Your top runs and rankings."
            />
            <StartMenuButton
              onClick={onOpenSettings}
              icon={<SettingsIcon />}
              title="Adjust Settings"
              desc="Sound, theme, and speed controls."
            />
            <StartMenuButton
              onClick={onOpenHelp}
              icon={<HelpIcon />}
              title="Help"
              desc="Controls, tactics, and pro tips."
            />
            <StartMenuButton
              onClick={onOpenAbout}
              icon={<HelpIcon />}
              title="About"
              desc="Board size, colors, and rules."
            />
          </div>
        )}
        {showCheatEntry && (
          <div className="cheat-entry">
            <p className="eyebrow">Cheat Code</p>
            <div className="cheat-row">
              <input
                value={cheatInput}
                onChange={(event) => onCheatInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onCheatSubmit();
                }}
                placeholder="Enter code"
                aria-label="Cheat code"
                autoComplete="off"
              />
              <button className="primary" onClick={onCheatSubmit}>
                Enter
              </button>
            </div>
            {cheatFeedback === "error" && <span className="cheat-feedback">Nope. Try again.</span>}
          </div>
        )}
      </div>
    </div>
  );
};
