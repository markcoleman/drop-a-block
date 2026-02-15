import clsx from "clsx";
import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  size?: "default" | "large";
};

export const Modal = ({ children, size = "default" }: ModalProps) => {
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className={clsx("modal-card", { "modal-large": size === "large" })}>{children}</div>
    </div>
  );
};
