import { ReactNode } from "react";

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HardDropIcon,
  HoldIcon,
  PauseIcon,
  RotateCcwIcon,
  RotateCwIcon
} from "./Icons";

type ControlButtonProps = {
  label: string;
  onPress?: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  text: string;
  children: ReactNode;
};

const ControlButton = ({
  label,
  onPress,
  onHoldStart,
  onHoldEnd,
  text,
  children
}: ControlButtonProps) => {
  const isHoldable = Boolean(onHoldStart || onHoldEnd);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isHoldable) {
      event.currentTarget.setPointerCapture(event.pointerId);
      onHoldStart?.();
      return;
    }
    onPress?.();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isHoldable) return;
    onHoldEnd?.();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (isHoldable) {
      onHoldStart?.();
      return;
    }
    onPress?.();
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!isHoldable) return;
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    onHoldEnd?.();
  };

  return (
    <button
      type="button"
      className="control-button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={(event) => event.preventDefault()}
      aria-label={label}
    >
      <span className="control-icon">{children}</span>
      <span className="control-text">{text}</span>
    </button>
  );
};

export const Controls = ({
  onLeftStart,
  onLeftEnd,
  onRightStart,
  onRightEnd,
  onDownStart,
  onDownEnd,
  onRotateCw,
  onRotateCcw,
  onHardDrop,
  onHold,
  onPause,
  holdEnabled = true
}: {
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onDownStart: () => void;
  onDownEnd: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onPause: () => void;
  holdEnabled?: boolean;
}) => {
  return (
    <div className="controls" aria-label="Touch controls">
      <div className="controls-row controls-row--move">
        <ControlButton
          label="Move left"
          text="Left"
          onHoldStart={onLeftStart}
          onHoldEnd={onLeftEnd}
        >
          <ArrowLeftIcon />
        </ControlButton>
        <ControlButton
          label="Move right"
          text="Right"
          onHoldStart={onRightStart}
          onHoldEnd={onRightEnd}
        >
          <ArrowRightIcon />
        </ControlButton>
        <ControlButton
          label="Soft drop"
          text="Down"
          onHoldStart={onDownStart}
          onHoldEnd={onDownEnd}
        >
          <ArrowDownIcon />
        </ControlButton>
      </div>
      <div className="controls-row controls-row--rotate">
        <ControlButton label="Rotate counter-clockwise" text="Rotate L" onPress={onRotateCcw}>
          <RotateCcwIcon />
        </ControlButton>
        <ControlButton label="Rotate clockwise" text="Rotate R" onPress={onRotateCw}>
          <RotateCwIcon />
        </ControlButton>
        <ControlButton label="Hard drop" text="Hard Drop" onPress={onHardDrop}>
          <HardDropIcon />
        </ControlButton>
      </div>
      <div className="controls-row controls-row--system">
        {holdEnabled && (
          <ControlButton label="Hold piece" text="Hold" onPress={onHold}>
            <HoldIcon />
          </ControlButton>
        )}
        <ControlButton label="Pause" text="Pause" onPress={onPause}>
          <PauseIcon />
        </ControlButton>
      </div>
    </div>
  );
};
