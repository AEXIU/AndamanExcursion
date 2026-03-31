import React from "react";
import { AlertCircle } from "lucide-react";
import styles from "./ErrorSummary.module.css";

interface ErrorItem {
  message: string;
  fieldId?: string; // Optional field ID to focus when clicked
}

interface ErrorSummaryProps {
  errors: (string | ErrorItem)[];
  title?: string;
  onErrorClick?: (fieldId: string) => void;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  title = "Please fix the following errors:",
  onErrorClick,
}) => {
  if (!errors || errors.length === 0) return null;

  const handleErrorClick = (error: string | ErrorItem) => {
    if (typeof error === "string" || !error.fieldId || !onErrorClick) return;
    onErrorClick(error.fieldId);
  };

  return (
    <div
      className={styles.errorSummary}
      role="alert"
      aria-labelledby="error-summary-title"
    >
      <div className={styles.errorHeader}>
        <AlertCircle size={18} aria-hidden="true" />
        <h4 id="error-summary-title">{title}</h4>
      </div>
      <ul className={styles.errorList}>
        {errors.map((error, index) => {
          const message = typeof error === "string" ? error : error.message;
          const isClickable =
            typeof error !== "string" && !!error.fieldId && !!onErrorClick;

          return (
            <li
              key={index}
              className={`${styles.errorItem} ${
                isClickable ? styles.clickable : ""
              }`}
              onClick={() => handleErrorClick(error)}
              tabIndex={isClickable ? 0 : undefined}
              role={isClickable ? "button" : undefined}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleErrorClick(error);
                }
              }}
            >
              {message}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
