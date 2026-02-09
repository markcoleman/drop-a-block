import { Settings } from "../utils/storage";

type Props = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  className?: string;
};

export const SettingsPanel = ({ settings, onChange, className }: Props) => {
  const panelClass = ["panel", "settings-panel", className].filter(Boolean).join(" ");
  return (
    <section className={panelClass} aria-label="Settings">
      <h2>Settings</h2>
      <div className="settings-group">
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(event) =>
              onChange({ ...settings, sound: event.target.checked })
            }
          />
          <span>Sound effects</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.theme === "dark"}
            onChange={(event) =>
              onChange({
                ...settings,
                theme: event.target.checked ? "dark" : "light"
              })
            }
          />
          <span>Dark theme</span>
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
            onChange={(event) =>
              onChange({ ...settings, das: Number(event.target.value) })
            }
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
            onChange={(event) =>
              onChange({ ...settings, arr: Number(event.target.value) })
            }
          />
          <span className="value">{settings.arr}</span>
        </label>
      </div>
    </section>
  );
};
