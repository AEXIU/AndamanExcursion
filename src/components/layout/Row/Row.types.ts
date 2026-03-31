import { ReactNode } from "react";

export interface RowProps {
  children: ReactNode;
  className?: string;
  gap?: string | number;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  justifyContent?: "start" | "end" | "center" | "between" | "around" | "evenly";
  alignItems?: "start" | "end" | "center" | "baseline" | "stretch";
  responsive?: boolean;
  responsiveAlignItems?: "start" | "end" | "center" | "baseline" | "stretch";
  responsiveJustifyContent?:
    | "start"
    | "end"
    | "center"
    | "between"
    | "around"
    | "evenly";
  responsiveGap?: string | number;
}
