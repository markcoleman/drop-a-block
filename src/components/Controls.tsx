import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode
} from "react";

import { useI18n } from "../i18n";
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

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isHoldable) {
      event.currentTarget.setPointerCapture(event.pointerId);
      onHoldStart?.();
      return;
    }
    onPress?.();
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isHoldable) return;
    if (event.type === "pointerleave" && event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    onHoldEnd?.();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (isHoldable) {
      onHoldStart?.();
      return;
    }
    onPress?.();
  };

  const handleKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
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
  const { t } = useI18n();

  return (
    <div className="controls" aria-label={t("controls.touchControls")}>
      <div className="controls-row controls-row--move">
        <ControlButton
          label={t("controls.moveLeft")}
          text={t("controls.left")}
          onHoldStart={onLeftStart}
          onHoldEnd={onLeftEnd}
        >
          <ArrowLeftIcon />
        </ControlButton>
        <ControlButton
          label={t("controls.moveRight")}
          text={t("controls.right")}
          onHoldStart={onRightStart}
          onHoldEnd={onRightEnd}
        >
          <ArrowRightIcon />
        </ControlButton>
        <ControlButton
          label={t("controls.softDrop")}
          text={t("controls.down")}
          onHoldStart={onDownStart}
          onHoldEnd={onDownEnd}
        >
          <ArrowDownIcon />
        </ControlButton>
      </div>
      <div className="controls-row controls-row--rotate">
        <ControlButton
          label={t("controls.rotateCcw")}
          text={t("controls.rotateL")}
          onPress={onRotateCcw}
        >
          <RotateCcwIcon />
        </ControlButton>
        <ControlButton
          label={t("controls.rotateCw")}
          text={t("controls.rotateR")}
          onPress={onRotateCw}
        >
          <RotateCwIcon />
        </ControlButton>
        <ControlButton
          label={t("controls.hardDrop")}
          text={t("controls.hardDropText")}
          onPress={onHardDrop}
        >
          <HardDropIcon />
        </ControlButton>
      </div>
      <div className="controls-row controls-row--system">
        {holdEnabled && (
          <ControlButton label={t("controls.holdPiece")} text={t("controls.hold")} onPress={onHold}>
            <HoldIcon />
          </ControlButton>
        )}
        <ControlButton label={t("controls.pause")} text={t("controls.pause")} onPress={onPause}>
          <PauseIcon />
        </ControlButton>
      </div>
    </div>
  );
};
