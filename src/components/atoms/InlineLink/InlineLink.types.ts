import { ReactNode } from "react";

export interface InlineLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  icon?: "arrow-up-right" | "arrow-right" | "none";
  iconSize?: number;
  color?: "primary" | "secondary" | "white";
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: "_blank" | "_self";
  textStyles?: string;
}
