type PauseOverlayProps = {
  onResume: () => void;
};

export const PauseOverlay = ({ onResume }: PauseOverlayProps) => {
  return (
    <div className="overlay">
      <h2>Paused</h2>
      <p>Press P or tap resume.</p>
      <button className="primary" onClick={onResume}>
        Resume
      </button>
    </div>
  );
};
