import React from "react";
import styles from "./Row.module.css";
import type { RowProps } from "./Row.types";
import { cn } from "@/utils/cn";

export const Row = ({
  children,
  className,
  gap,
  wrap = false,
  fullWidth = false,
  fullHeight = false,
  justifyContent,
  alignItems,
  responsive = false,
  responsiveAlignItems,
  responsiveJustifyContent,
  responsiveGap,
}: RowProps) => {
  const rowClasses = cn(
    styles.row,
    wrap && styles.wrap,
    fullWidth && styles.fullWidth,
    fullHeight && styles.fullHeight,
    justifyContent && styles[`justify-${justifyContent}`],
    alignItems && styles[`align-${alignItems}`],
    responsive && styles.responsive,
    responsive &&
      responsiveAlignItems &&
      styles[`responsive-align-${responsiveAlignItems}`],
    responsive &&
      responsiveJustifyContent &&
      styles[`responsive-justify-${responsiveJustifyContent}`],
    className
  );

  const normalizeGap = (gapValue: string | number | undefined) => {
    if (gapValue === undefined) return undefined;
    if (typeof gapValue === "string" && gapValue.startsWith("var(")) {
      return gapValue; // Return CSS variables as-is
    }
    return typeof gapValue === "number" ? `${gapValue * 8}px` : gapValue;
  };

  const style: React.CSSProperties & { [key: `--${string}`]: string } = {};

  if (gap !== undefined) {
    style.gap = normalizeGap(gap);
  }

  if (responsive && responsiveGap !== undefined) {
    style["--responsive-gap"] = normalizeGap(responsiveGap) || "";
  }

  return (
    <div className={rowClasses} style={style}>
      {children}
    </div>
  );
};
