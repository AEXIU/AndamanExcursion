import React from "react";

import { Column } from "@/components/layout";

// import type { OverviewTabProps } from "../../PackageDetailTabs.types";

import { HighlightItem } from "../../components/HighlightItem/HighlightItem";

import styles from "./OverviewTab.module.css";

export const OverviewTab: React.FC<{ packageData: any }> = ({
  packageData,
}) => {
  // Get description from packageData
  const description = packageData.descriptions?.description || "";

  // Get highlights from packageData
  const highlights = packageData.packageDetails?.highlights || [];

  return (
    <div
      className={styles.overviewContainer}
      role="region"
      aria-label="Package overview"
    >
      <Column gap={4} fullWidth>
        <div className={styles.descriptionSection}>
          <p className={styles.description}>{description}</p>
        </div>

        {highlights.length > 0 && (
          <div
            className={styles.highlightsSection}
            aria-labelledby="highlights-title"
          >
            <h2 id="highlights-title" className={styles.sectionTitle}>
              Highlights
            </h2>
            <Column gap={2} fullWidth>
              {highlights.map((highlight: any, index: number) => (
                <HighlightItem
                  key={index}
                  text={
                    typeof highlight === "string"
                      ? highlight
                      : highlight.highlight
                  }
                />
              ))}
            </Column>
          </div>
        )}
      </Column>
    </div>
  );
};
