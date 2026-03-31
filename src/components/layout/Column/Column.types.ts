import { CSSProperties, ReactNode } from "react";

export interface ColumnProps {
  children?: ReactNode;
  className?: string;
  gap?: number | string;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  justifyContent?: "start" | "end" | "center" | "between" | "around" | "evenly";
  alignItems?: "start" | "end" | "center" | "baseline" | "stretch";
  style?: CSSProperties;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  responsive?: boolean;
  responsiveAlignItems?: "start" | "end" | "center" | "baseline" | "stretch";
  responsiveGap?: number | string;
}
