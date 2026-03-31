import React from "react";
import styles from "./IncludeItem.module.css";
import { Circle } from "lucide-react";
import { IncludeItemProps } from "./IncludeItem.types";

export const IncludeItem: React.FC<IncludeItemProps> = ({ text }) => {
  return (
    <div
      role="listitem"
      aria-label={`Include: ${text}`}
      className={styles.includeItem}
    >
      <div className={styles.iconContainer}>
        <Circle
          size={12}
          fill="var(--color-secondary)"
          color="var(--color-secondary)"
        />
      </div>
      <span className={styles.text}>{text}</span>
    </div>
  );
};
