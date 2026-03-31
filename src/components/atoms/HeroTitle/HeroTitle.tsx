import React from "react";
import styles from "./HeroTitle.module.css";
import type { HeroTitleProps  } from "./HeroTitle.types";

export const HeroTitle = ({
  primaryText,
  secondaryText,
  className,
  id,
}: HeroTitleProps) => {
  const titleClasses = [styles.heroTitle, className || ""].join(" ").trim();

  return (
    <div className={titleClasses} id={id}>
      <h1 className={styles.fullTitle}>
        <span className={styles.primary}>{primaryText}</span>
        <span className={styles.secondary}>{secondaryText}</span>
      </h1>
    </div>
  );
};
