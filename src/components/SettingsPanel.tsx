import clsx from "clsx";

import { Settings } from "../utils/storage";

type Props = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  className?: string;
};

export const SettingsPanel = ({ settings, onChange, className }: Props) => {
  return (
    <section className={clsx("panel", "settings-panel", className)} aria-label="Settings">
      <h2>Settings</h2>
      <div className="settings-group">
        <p className="settings-label">Appearance</p>
        <div className="settings-row">
          <span className="settings-title">Theme</span>
          <div className="segmented" role="radiogroup" aria-label="Theme">
            {(["dark", "neon", "retro"] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                className={clsx("segmented-button", { active: settings.theme === theme })}
                role="radio"
                aria-checked={settings.theme === theme}
                onClick={() => onChange({ ...settings, theme })}
              >
                {theme === "retro" ? "Retro Mono" : theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.palette === "colorblind"}
            onChange={(event) =>
              onChange({
                ...settings,
                palette: event.target.checked ? "colorblind" : "default"
              })
            }
          />
          <span>Colorblind palette</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => onChange({ ...settings, reducedMotion: event.target.checked })}
          />
          <span>Reduced motion</span>
        </label>
      </div>
      <div className="settings-group">
        <p className="settings-label">Audio & Gameplay</p>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(event) => onChange({ ...settings, sound: event.target.checked })}
          />
          <span>Sound effects</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.holdEnabled}
            onChange={(event) => onChange({ ...settings, holdEnabled: event.target.checked })}
          />
          <span>Enable hold</span>
        </label>
      </div>
      <div className="settings-group">
        <label>
          <span>DAS (ms)</span>
          <input
            type="range"
            min={80}
            max={250}
            step={10}
            value={settings.das}
            onChange={(event) => onChange({ ...settings, das: Number(event.target.value) })}
          />
          <span className="value">{settings.das}</span>
        </label>
        <label>
          <span>ARR (ms)</span>
          <input
            type="range"
            min={20}
            max={120}
            step={10}
            value={settings.arr}
            onChange={(event) => onChange({ ...settings, arr: Number(event.target.value) })}
          />
          <span className="value">{settings.arr}</span>
        </label>
      </div>
    </section>
  );
};
