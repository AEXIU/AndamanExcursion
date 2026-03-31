"use client";
import React, { ReactNode } from "react";
import { IconContainer } from "../IconContainer/IconContainer";
import styles from "./Chip.module.css";
import { cn } from "@/utils/cn";

export interface ChipProps {
  icon?: string;
  iconComponent?: ReactNode;
  text: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

export const Chip = ({
  icon,
  iconComponent,
  text,
  className = "",
  size = "small",
}: ChipProps) => {
  return (
    <div className={cn(styles.chipContainer, className)}>
      <div className={styles.iconWrapper}>
        {iconComponent ? (
          iconComponent
        ) : icon ? (
          <IconContainer src={icon} alt="icon" size={20} />
        ) : null}
      </div>
      <span className={cn(styles.chipText, styles[size])}>{text}</span>
    </div>
  );
};
