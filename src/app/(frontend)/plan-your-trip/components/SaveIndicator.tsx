import React from "react";
import { SaveStatus } from "../../../../hooks/planYourTrip/useFormPersistence";
import { Check, Save, AlertCircle, Loader2 } from "lucide-react";
import styles from "./SaveIndicator.module.css";

interface SaveIndicatorProps {
  status: SaveStatus;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status }) => {
  if (status === "idle") return null;

  return (
    <div
      className={`${styles.saveIndicator} ${styles[status]}`}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <Loader2 className={styles.spinner} size={14} />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check size={14} />
          <span>Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle size={14} />
          <span>Save failed</span>
        </>
      )}
    </div>
  );
};
