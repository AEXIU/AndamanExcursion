import React from "react";
import styles from "./ItineraryDay.module.css";
import { ItineraryDayProps } from "./ItineraryDay.types";

export const ItineraryDay: React.FC<ItineraryDayProps> = ({
  day,
  title,
  description,
  isLast = false,
  className,
}) => {
  return (
    <div className={`${styles.itineraryDay} ${className}`}>
      <div className={styles.dayNumber}>
        <span className={styles.dayNumberTextDot} />
        <span className={styles.dayNumberText}>Day {day}</span>
        <span className={styles.dayNumberTextSeparator}>:</span>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.content}>
        <p className={styles.description}>{description}</p>
      </div>
      {!isLast && <div className={styles.connector} />}
    </div>
  );
};
