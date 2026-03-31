import { ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  showArrow?: boolean;
  href?: string;
  target?: "_blank" | "_self";
  ariaLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
}
