import React from "react";
import styles from "./Column.module.css";
import type { ColumnProps } from "./Column.types";

export const Column = ({
  children,
  className,
  gap,
  wrap = false,
  fullWidth = false,
  fullHeight = false,
  justifyContent,
  alignItems,
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  responsive,
  responsiveAlignItems,
  responsiveGap,
}: ColumnProps) => {
  const columnClasses = [
    styles.column,
    wrap && styles.wrap,
    fullWidth && styles.fullWidth,
    fullHeight && styles.fullHeight,
    justifyContent && styles[`justify-${justifyContent}`],
    alignItems && styles[`align-${alignItems}`],
    responsive && styles.responsive,
    responsive &&
      responsiveAlignItems &&
      styles[`responsive-align-${responsiveAlignItems}`],
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

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

  if (responsive && responsiveAlignItems) {
    style["--responsive-align"] =
      responsiveAlignItems === "start"
        ? "flex-start"
        : responsiveAlignItems === "end"
        ? "flex-end"
        : responsiveAlignItems === "center"
        ? "center"
        : responsiveAlignItems === "baseline"
        ? "baseline"
        : responsiveAlignItems === "stretch"
        ? "stretch"
        : "flex-start";
  }

  return (
    <div
      className={columnClasses}
      style={style}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </div>
  );
};
