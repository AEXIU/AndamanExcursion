// ===== 4. Updated SmartResultsSection.tsx =====
import React from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { FerryResults } from "./FerryResults";
import styles from "./SmartResultsSection.module.css";

interface SmartFilteredResults {
  preferredTime: UnifiedFerryResult[];
  otherTimes: UnifiedFerryResult[];
}

interface SmartResultsSectionProps {
  userPreferredTime: string | null;
  timeFilter: string | null;
  smartFilteredResults: SmartFilteredResults;
}

export const SmartResultsSection: React.FC<SmartResultsSectionProps> = ({
  userPreferredTime,
  timeFilter,
  smartFilteredResults,
}) => {
  if (!userPreferredTime || timeFilter) return null;

  const hasPreferredTimeResults = smartFilteredResults.preferredTime.length > 0;
  const hasOtherTimeResults = smartFilteredResults.otherTimes.length > 0;

  return (
    <>
      {hasPreferredTimeResults && (
        <div className={styles.smartSection}>
          <h3 className={styles.smartSectionTitle}>
            Perfect match for your preferred time ({userPreferredTime})
          </h3>
          <FerryResults
            loading={false}
            results={smartFilteredResults.preferredTime}
          />
        </div>
      )}

      {hasOtherTimeResults && (
        <div className={styles.smartSection}>
          <h3 className={styles.smartSectionTitle}>
            {hasPreferredTimeResults
              ? "Other available ferries for the same day"
              : "Available ferries for your selected date"}
          </h3>
          <FerryResults
            loading={false}
            results={smartFilteredResults.otherTimes}
          />
        </div>
      )}
    </>
  );
};
