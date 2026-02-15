import { useI18n } from "../i18n";
import { Modal } from "./Modal";

type ScoreEntryModalProps = {
  initials: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export const ScoreEntryModal = ({ initials, onChange, onSave }: ScoreEntryModalProps) => {
  const { t } = useI18n();

  return (
    <Modal>
      <h2>{t("scoreEntry.newHighScore")}</h2>
      <p>{t("scoreEntry.enterInitials")}</p>
      <input
        value={initials}
        onChange={(event) => onChange(event.target.value)}
        maxLength={3}
        placeholder="AAA"
        aria-label={t("scoreEntry.initials")}
      />
      <button className="primary" onClick={onSave}>
        {t("scoreEntry.saveScore")}
      </button>
    </Modal>
  );
};
