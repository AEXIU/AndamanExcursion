import React from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import styles from "./SeatPreferenceSelector.module.css";

interface SeatPreferenceSelectorProps {
  ferry: UnifiedFerryResult;
  preference: "manual" | "auto";
  onPreferenceChange: (pref: "manual" | "auto") => void;
  onManualSelected: () => void;
}

export const SeatPreferenceSelector: React.FC<SeatPreferenceSelectorProps> = ({
  ferry,
  preference,
  onPreferenceChange,
  onManualSelected,
}) => {
  return (
    <div className={styles.seatPreferenceContainer}>
      <h4>Seat Selection Preference</h4>
      <div className={styles.seatPreferenceOptions}>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name="seatPreference"
            value="auto"
            checked={preference === "auto"}
            onChange={(e) => onPreferenceChange(e.target.value as "auto")}
          />
          <span>Auto-assign best available seats</span>
        </label>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name="seatPreference"
            value="manual"
            checked={preference === "manual"}
            onChange={(e) => {
              onPreferenceChange(e.target.value as "manual");
              if (e.target.value === "manual") {
                onManualSelected();
              }
            }}
          />
          <span>Choose specific seats</span>
        </label>
      </div>
    </div>
  );
};

export default SeatPreferenceSelector;
