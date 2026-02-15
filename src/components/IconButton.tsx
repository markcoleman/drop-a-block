import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export const IconButton = ({ label, className, children, type, ...props }: IconButtonProps) => {
  return (
    <button
      type={type ?? "button"}
      className={clsx("icon-button", className)}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
};
