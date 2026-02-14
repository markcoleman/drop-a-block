import { Modal } from "./Modal";

type ScoreEntryModalProps = {
  initials: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export const ScoreEntryModal = ({ initials, onChange, onSave }: ScoreEntryModalProps) => {
  return (
    <Modal>
      <h2>New High Score</h2>
      <p>Enter your initials (3 letters).</p>
      <input
        value={initials}
        onChange={(event) => onChange(event.target.value)}
        maxLength={3}
        placeholder="AAA"
        aria-label="Initials"
      />
      <button className="primary" onClick={onSave}>
        Save Score
      </button>
    </Modal>
  );
};
