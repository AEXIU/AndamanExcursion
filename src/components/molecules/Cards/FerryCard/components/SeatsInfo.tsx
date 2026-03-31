import React, { memo } from "react";
import { Info } from "lucide-react";
import styles from "../FerryCard.module.css";
import { ferryCardContent } from "../FerryCard.content";

interface SeatsInfoProps {
  seatsLeft: number;
}

export const SeatsInfo = memo<SeatsInfoProps>(({ seatsLeft }) => {
  return (
    <div className={styles.seatsInfo} role="status" aria-live="polite">
      <Info
        className={styles.infoIcon}
        color="var(--color-primary)"
        size="auto"
      />
      <span className={styles.seatsText}>
        {seatsLeft} {ferryCardContent.seatsLeft}
      </span>
    </div>
  );
});

SeatsInfo.displayName = "SeatsInfo";
