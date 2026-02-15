import { useI18n } from "../i18n";

type PauseOverlayProps = {
  onResume: () => void;
};

export const PauseOverlay = ({ onResume }: PauseOverlayProps) => {
  const { t } = useI18n();

  return (
    <div className="overlay">
      <h2>{t("pause.paused")}</h2>
      <p>{t("pause.prompt")}</p>
      <button className="primary" onClick={onResume}>
        {t("pause.resume")}
      </button>
    </div>
  );
};
