import React from "react";
import { Column } from "@/components/layout";
import type { WhatsCoveredTabProps } from "../../PackageDetailTabs.types";
import styles from "./WhatsCoveredTab.module.css";
import { IncludeItem } from "../../components/IncludeItem/IncludeItem";
import { ExcludeItem } from "../../components/ExcludeItem/ExcludeItem";
import { NoteItem } from "@/components/atoms";

export const WhatsCoveredTab: React.FC<WhatsCoveredTabProps> = ({
  includes,
  excludes,
  notes,
}) => {
  // Process includes to handle both array formats
  const processedIncludes = React.useMemo(() => {
    if (!includes) return [];
    return includes.map((item) => {
      if (typeof item === "string") return item;
      return item.inclusion;
    });
  }, [includes]);

  // Process excludes to handle both array formats
  const processedExcludes = React.useMemo(() => {
    if (!excludes) return [];
    return excludes.map((item) => {
      if (typeof item === "string") return item;
      return item.exclusion;
    });
  }, [excludes]);

  // Process notes to handle both array formats - THIS IS THE FIX
  const processedNotes = React.useMemo(() => {
    if (!notes) return [];
    return notes.map((item) => {
      if (typeof item === "string") return item;
      return item.note;
    });
  }, [notes]);

  // If nothing to show, return empty message
  if (
    (!processedIncludes || processedIncludes.length === 0) &&
    (!processedExcludes || processedExcludes.length === 0) &&
    (!processedNotes || processedNotes.length === 0)
  ) {
    return (
      <div className={styles.whatsCoveredContainer}>
        <p>No inclusion, exclusion, or notes details available.</p>
      </div>
    );
  }

  return (
    <div
      className={styles.whatsCoveredContainer}
      role="region"
      aria-label="What's covered in this package"
    >
      <div className={styles.sectionsWrapper}>
        {processedIncludes && processedIncludes.length > 0 && (
          <Column
            className={styles.section}
            responsive
            responsiveGap="var(--space-4)"
          >
            <h3 id="included-title" className={styles.sectionTitle}>
              Included
            </h3>
            <div className={styles.itemsGrid} aria-labelledby="included-title">
              {processedIncludes.map((item, index) => (
                <IncludeItem key={index} text={item} />
              ))}
            </div>
          </Column>
        )}

        {processedExcludes && processedExcludes.length > 0 && (
          <Column
            className={styles.section}
            responsive
            responsiveGap="var(--space-4)"
          >
            <h3 id="excluded-title" className={styles.sectionTitle}>
              Not Included
            </h3>
            <div className={styles.itemsGrid} aria-labelledby="excluded-title">
              {processedExcludes.map((item, index) => (
                <ExcludeItem key={index} text={item} />
              ))}
            </div>
          </Column>
        )}

        {processedNotes && processedNotes.length > 0 && (
          <Column
            className={styles.section}
            responsive
            responsiveGap="var(--space-4)"
          >
            <h3 id="notes-title" className={styles.sectionTitle}>
              Notes
            </h3>
            <ul className={styles.notesItemsGrid} aria-labelledby="notes-title">
              {processedNotes.map((item, index) => (
                <li key={index} className={styles.noteItem}>
                  <NoteItem text={item} />
                </li>
              ))}
            </ul>
          </Column>
        )}
      </div>
    </div>
  );
};
