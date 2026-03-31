"use client";
import React, { useState } from "react";
import { Info } from "lucide-react";
import styles from "./PassengerCounter.module.css";
import type {
  PassengerCounterProps,
  PassengerCount,
} from "./PassengerCounter.types";
import clsx from "clsx";

export type { PassengerCount };

// Add error message prop to the interface
interface PassengerCounterPropsWithError extends PassengerCounterProps {
  errorMessage?: string;
  label?: string;
  // Add props to hide infants and children for activities
  hideInfants?: boolean;
  hideChildren?: boolean;
}

export const PassengerCounter = ({
  value,
  onChange,
  className,
  hasError,
  errorMessage,
  label = "Passengers",
  hideInfants = false, // Default to false to maintain ferry functionality
  hideChildren = false, // Default to false to maintain ferry functionality
}: PassengerCounterPropsWithError) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`${styles.passengerCounterGroup} ${className || ""}`}>
      <div className={styles.countersContainer}>
        {/* Adults Counter */}
        <div className={styles.fieldContainer}>
          <div
            className={`${styles.selectWrapper} ${hasError ? styles.error : ""
              }`}
          >
            <span className={styles.selectLabel}>Adults</span>
            <div className={styles.counterInner}>
              <button
                type="button"
                aria-label="Decrease Adults"
                className={styles.counterButton}
                onClick={() => onChange("adults", value.adults - 1)}
                disabled={value.adults <= 1}
              >
                -
              </button>
              <span className={styles.counterValue}>{value.adults}</span>
              <button
                type="button"
                aria-label="Increase Adults"
                className={styles.counterButton}
                onClick={() => onChange("adults", value.adults + 1)}
                disabled={value.adults >= 10}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Children Counter - COMMENTED OUT FOR ACTIVITIES */}
        {!hideChildren && (
          <div className={styles.fieldContainer}>
            <div
              className={`${styles.selectWrapper} ${hasError ? styles.error : ""
                }`}
            >
              <span className={clsx(styles.selectLabel, styles.kidSelectLabel)}>
                Children/Infants
              </span>
              <div className={styles.counterInner}>
                <button
                  type="button"
                  aria-label="Decrease Children"
                  className={styles.counterButton}
                  onClick={() => onChange("children", value.children - 1)}
                  disabled={value.children <= 0}
                >
                  -
                </button>
                <span className={styles.counterValue}>{value.children}</span>
                <button
                  type="button"
                  aria-label="Increase Children"
                  className={styles.counterButton}
                  onClick={() => onChange("children", value.children + 1)}
                  disabled={value.children >= 10}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Infants Counter - COMMENTED OUT FOR ACTIVITIES */}
        {!hideInfants && (
          <div className={styles.fieldContainer}>
            <div
              className={`${styles.selectWrapper} ${hasError ? styles.error : ""
                }`}
            >
              <span className={clsx(styles.selectLabel, styles.kidSelectLabel)}>
                Infants
                <div
                  className={styles.tooltipContainer}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info size={12} className={styles.infoIcon} />
                  {showTooltip && (
                    <div className={styles.tooltip}>
                      Infants under 2 travel free.
                    </div>
                  )}
                </div>
              </span>
              <div className={styles.counterInner}>
                <button
                  type="button"
                  aria-label="Decrease Infants"
                  className={styles.counterButton}
                  onClick={() => onChange("infants", (value.infants || 0) - 1)}
                  disabled={(value.infants || 0) <= 0}
                >
                  -
                </button>
                <span className={styles.counterValue}>{value.infants || 0}</span>
                <button
                  type="button"
                  aria-label="Increase Infants"
                  className={styles.counterButton}
                  onClick={() => onChange("infants", (value.infants || 0) + 1)}
                  disabled={(value.infants || 0) >= 10}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message for the entire group */}
      {hasError && errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
