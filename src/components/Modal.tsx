import clsx from "clsx";
import type { ReactNode } from "react";

type ModalProps = {
  children: ReactNode;
  size?: "default" | "large";
  cardClassName?: string;
};

export const Modal = ({ children, size = "default", cardClassName }: ModalProps) => {
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className={clsx("modal-card", cardClassName, { "modal-large": size === "large" })}>
        {children}
      </div>
    </div>
  );
};
