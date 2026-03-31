// Grid.tsx
import React from "react";
import styles from "./Grid.module.css";
import { GridProps } from "./Grid.types";

export const Grid = ({
  children,
  className,
  columns = { desktop: 3, tablet: 2, mobile: 1 },
  gap = 3,
  minItemWidth,
  style = {},
  role,
  ariaLabel,
}: GridProps) => {
  const gridClasses = [styles.grid, className || ""]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Convert gap to CSS custom properties
  const gapValue = typeof gap === "number" ? `${gap * 8}px` : gap;

  const combinedStyle = {
    "--grid-gap": gapValue,
    "--grid-columns-desktop": columns.desktop,
    "--grid-columns-tablet": columns.tablet,
    "--grid-columns-mobile": columns.mobile,
    ...(minItemWidth && { "--grid-min-item-width": minItemWidth }),
    ...style,
  } as React.CSSProperties;

  return (
    <div
      className={gridClasses}
      style={combinedStyle}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};
