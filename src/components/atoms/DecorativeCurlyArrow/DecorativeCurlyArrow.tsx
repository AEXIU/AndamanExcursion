import Image from "next/image";
import React from "react";
import curlyArrow from "@public/graphics/curlyArrowOrange.svg";
import styles from "./DecorativeCurlyArrow.module.css";

export interface DecorativeCurlyArrowProps {
  /** Position from top as percentage (0-100) or CSS unit */
  top?: string | number;
  /** Position from left as percentage (0-100) or CSS unit */
  left?: string | number;
  /** Position from right as percentage (0-100) or CSS unit */
  right?: string | number;
  /** Position from bottom as percentage (0-100) or CSS unit */
  bottom?: string | number;
  /** Width of the arrow */
  width?: string | number;
  /** Height of the arrow */
  height?: string | number;
  /** Rotation angle in degrees */
  rotation?: number;
  /** Scale factor for the arrow */
  scale?: number;
  /** Z-index for layering */
  zIndex?: number;
  /** Color variant (if you have different colored arrows) */
  color?: "orange" | "blue" | "purple";
  /** Additional CSS classes */
  className?: string;
  /** Hide on mobile breakpoint */
  hideMobile?: boolean;
  /** Hide on tablet breakpoint */
  hideTablet?: boolean;
  /** Opacity (0-1) */
  opacity?: number;
  /** Animation type */
  animation?: "none" | "bounce" | "float" | "pulse";
  /** Flip the arrow */
  flip?: boolean;
}

const formatPosition = (value: string | number): string => {
  if (typeof value === "number") {
    return `${value}%`;
  }
  return value;
};

export const DecorativeCurlyArrow: React.FC<DecorativeCurlyArrowProps> = ({
  top = "15%",
  left,
  right,
  bottom,
  width = 100,
  height = 100,
  rotation = 0,
  scale = 1,
  zIndex = 1,
  color = "orange",
  className = "",
  hideMobile = true,
  hideTablet = true,
  opacity = 1,
  animation = "none",
  flip = false,
}) => {
  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    top: top ? formatPosition(top) : undefined,
    left: left ? formatPosition(left) : undefined,
    right: right ? formatPosition(right) : undefined,
    bottom: bottom ? formatPosition(bottom) : undefined,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    objectFit: "contain",
    objectPosition: "center",
    transform: `rotate(${rotation}deg) scale(${scale}) ${
      flip ? "scaleX(-1)" : ""
    }`,
    zIndex,
    opacity,
    pointerEvents: "none", // Prevents interference with other elements
  };

  const containerClasses = [
    styles.curlyArrow,
    styles[`curlyArrow--${color}`],
    styles[`curlyArrow--${animation}`],
    hideMobile ? styles["curlyArrow--hideMobile"] : "",
    hideTablet ? styles["curlyArrow--hideTablet"] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Image
      src={curlyArrow}
      alt="decorative arrow"
      className={containerClasses}
      style={arrowStyle}
      role="presentation"
      aria-hidden="true"
    />
  );
};

export default DecorativeCurlyArrow;
