import React from "react";
import { IconContainer } from "@/components/atoms/IconContainer/IconContainer";
import { HighlightItemProps } from "./HighlightItem.types";

const checkboxIcon = "/icons/misc/checkbox.svg";

import styles from "./HighlightItem.module.css";

export const HighlightItem: React.FC<HighlightItemProps> = ({ text }) => {
  return (
    <div
      role="listitem"
      aria-label={`Highlight: ${text}`}
      className={styles.highlightItem}
    >
      <div className={styles.iconContainer}>
        <IconContainer src={checkboxIcon} size={20} alt="Checkbox" />
      </div>
      <span className={styles.text}>{text}</span>
    </div>
  );
};
