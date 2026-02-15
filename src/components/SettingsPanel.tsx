import clsx from "clsx";

import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, useI18n } from "../i18n";
import {
  getThemePreview,
  THEME_ASSET_KEYS,
  THEME_ASSET_LABELS,
  THEME_COLOR_KEYS,
  THEME_COLOR_LABELS,
  THEME_IDS,
  type ThemeAssetKey,
  type ThemeColorKey,
  THEMES,
  type ThemeSelection
} from "../ui/themes";
import type { Settings } from "../utils/storage";

type Props = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  className?: string;
};

const PIECE_KEYS = ["I", "O", "T", "S", "Z", "J", "L"] as const;

const normalizeThemeLabel = (theme: ThemeSelection) => {
  if (theme === "custom") return "Custom";
  return THEMES[theme].name;
};

export const SettingsPanel = ({ settings, onChange, className }: Props) => {
  const { t } = useI18n();

  const changeTheme = (theme: ThemeSelection) => onChange({ ...settings, theme });

  const updateCustomTheme = (next: Partial<Settings["customTheme"]>) => {
    onChange({
      ...settings,
      theme: "custom",
      customTheme: {
        ...settings.customTheme,
        ...next,
        colors: {
          ...settings.customTheme.colors,
          ...(next.colors ?? {})
        },
        assets: {
          ...settings.customTheme.assets,
          ...(next.assets ?? {})
        },
        piecePalette: {
          ...settings.customTheme.piecePalette,
          ...(next.piecePalette ?? {})
        }
      }
    });
  };

  const updateCustomColor = (key: ThemeColorKey, value: string) => {
    updateCustomTheme({ colors: { [key]: value } });
  };

  const updateCustomAsset = (key: ThemeAssetKey, value: string) => {
    updateCustomTheme({ assets: { [key]: value } });
  };

  return (
    <section
      className={clsx("panel settings-panel", className)}
      aria-label={t("settings.settings")}
    >
      <h2>{t("settings.settings")}</h2>

      <div className="settings-group">
        <p className="settings-label">{t("settings.appearance")}</p>
        <div className="settings-row flex-col items-start gap-3">
          <span className="settings-title">{t("settings.themePresets")}</span>
          <div className="grid w-full gap-3 sm:grid-cols-2">
            {[...THEME_IDS, "custom" as const].map((theme) => {
              const selected = settings.theme === theme;
              const preview = getThemePreview(theme, settings.customTheme);
              const tagline =
                theme === "custom"
                  ? "Create your own full palette and asset pack."
                  : THEMES[theme].tagline;
              return (
                <button
                  key={theme}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => changeTheme(theme)}
                  className={clsx(
                    "rounded-xl border px-3 py-3 text-left transition duration-150",
                    "bg-[color:var(--surface)] hover:-translate-y-0.5",
                    selected
                      ? "border-[color:var(--accent)] ring-1 ring-[color:var(--focus)]"
                      : "border-[color:var(--border)]"
                  )}
                >
                  <div
                    className="mb-2 h-2.5 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${preview[0]}, ${preview[1]}, ${preview[2]})`
                    }}
                  />
                  <span className="block text-sm font-semibold">{normalizeThemeLabel(theme)}</span>
                  <span className="mt-1 block text-xs text-[color:var(--text-muted)]">
                    {t("settings.themeTagline", { tagline }, tagline)}
                  </span>
                </button>
              );
            })}
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
          <span>{t("settings.colorblindPalette")}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => onChange({ ...settings, reducedMotion: event.target.checked })}
          />
          <span>{t("settings.reducedMotion")}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.showHud}
            onChange={(event) => onChange({ ...settings, showHud: event.target.checked })}
          />
          <span>{t("settings.showHud")}</span>
        </label>

        <label className="mt-1 flex flex-col gap-2 text-sm">
          <span>{t("settings.language")}</span>
          <select
            value={settings.language}
            onChange={(event) =>
              onChange({
                ...settings,
                language: event.target.value as Settings["language"]
              })
            }
            className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-2"
            aria-label={t("settings.language")}
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {LANGUAGE_LABELS[language]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {settings.theme === "custom" && (
        <div className="settings-group">
          <p className="settings-label">{t("settings.customThemeEditor")}</p>
          <label className="mb-3 flex flex-col gap-2 text-sm">
            <span>{t("settings.customThemeName")}</span>
            <input
              value={settings.customTheme.name}
              onChange={(event) => updateCustomTheme({ name: event.target.value })}
              className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-2"
            />
          </label>
          <label className="mb-3 flex flex-col gap-2 text-sm">
            <span>{t("settings.customBaseTheme")}</span>
            <select
              value={settings.customTheme.baseTheme}
              onChange={(event) =>
                updateCustomTheme({
                  baseTheme: event.target.value as Settings["customTheme"]["baseTheme"]
                })
              }
              className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-2"
            >
              {THEME_IDS.map((theme) => (
                <option key={theme} value={theme}>
                  {THEMES[theme].name}
                </option>
              ))}
            </select>
          </label>

          <details className="mb-3 rounded-lg border border-[color:var(--border)] p-3" open>
            <summary className="cursor-pointer text-sm font-semibold">
              {t("settings.customColors")}
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {THEME_COLOR_KEYS.map((colorKey) => (
                <label key={colorKey} className="grid gap-1 text-xs text-[color:var(--text-muted)]">
                  <span>{THEME_COLOR_LABELS[colorKey]}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-8 w-8 rounded-md border border-[color:var(--border)]"
                      style={{
                        background:
                          settings.customTheme.colors[colorKey] ||
                          THEMES[settings.customTheme.baseTheme].colors[colorKey]
                      }}
                    />
                    <input
                      value={settings.customTheme.colors[colorKey] ?? ""}
                      onChange={(event) => updateCustomColor(colorKey, event.target.value)}
                      placeholder={THEMES[settings.customTheme.baseTheme].colors[colorKey]}
                      className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5"
                    />
                  </div>
                </label>
              ))}
            </div>
          </details>

          <details className="mb-3 rounded-lg border border-[color:var(--border)] p-3" open>
            <summary className="cursor-pointer text-sm font-semibold">
              {t("settings.customAssets")}
            </summary>
            <div className="mt-3 grid gap-2">
              {THEME_ASSET_KEYS.map((assetKey) => (
                <label key={assetKey} className="grid gap-1 text-xs text-[color:var(--text-muted)]">
                  <span>{THEME_ASSET_LABELS[assetKey]}</span>
                  <input
                    value={settings.customTheme.assets[assetKey] ?? ""}
                    onChange={(event) => updateCustomAsset(assetKey, event.target.value)}
                    placeholder={THEMES[settings.customTheme.baseTheme].assets[assetKey]}
                    className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5"
                  />
                </label>
              ))}
            </div>
          </details>

          <details className="rounded-lg border border-[color:var(--border)] p-3" open>
            <summary className="cursor-pointer text-sm font-semibold">
              {t("settings.customPiecePalette")}
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PIECE_KEYS.map((pieceType) => (
                <label
                  key={pieceType}
                  className="grid gap-1 text-xs text-[color:var(--text-muted)]"
                >
                  <span>{pieceType}</span>
                  <input
                    value={settings.customTheme.piecePalette[pieceType] ?? ""}
                    onChange={(event) =>
                      updateCustomTheme({ piecePalette: { [pieceType]: event.target.value } })
                    }
                    placeholder={THEMES[settings.customTheme.baseTheme].piecePalette[pieceType]}
                    className="w-full rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5"
                  />
                </label>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="settings-group">
        <p className="settings-label">{t("settings.audioGameplay")}</p>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(event) => onChange({ ...settings, sound: event.target.checked })}
          />
          <span>{t("settings.soundEffects")}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.holdEnabled}
            onChange={(event) => onChange({ ...settings, holdEnabled: event.target.checked })}
          />
          <span>{t("settings.enableHold")}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.mobileControls}
            onChange={(event) => onChange({ ...settings, mobileControls: event.target.checked })}
          />
          <span>{t("settings.mobileControls")}</span>
        </label>
      </div>
      <div className="settings-group">
        <label>
          <span>{t("settings.das")}</span>
          <input
            type="range"
            min={80}
            max={250}
            step={10}
            value={settings.das}
            aria-label={t("settings.das")}
            onChange={(event) => onChange({ ...settings, das: Number(event.target.value) })}
          />
          <span className="value">{settings.das}</span>
        </label>
        <label>
          <span>{t("settings.arr")}</span>
          <input
            type="range"
            min={20}
            max={120}
            step={10}
            value={settings.arr}
            aria-label={t("settings.arr")}
            onChange={(event) => onChange({ ...settings, arr: Number(event.target.value) })}
          />
          <span className="value">{settings.arr}</span>
        </label>
      </div>
    </section>
  );
};
