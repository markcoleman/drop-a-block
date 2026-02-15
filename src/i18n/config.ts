export const SUPPORTED_LANGUAGES = ["en", "es", "ja"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  es: "Espanol",
  ja: "日本語"
};
