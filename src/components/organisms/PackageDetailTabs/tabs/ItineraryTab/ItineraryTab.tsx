import React from "react";

import { Column } from "@/components/layout";

// import type { ItineraryTabProps } from "../../PackageDetailTabs.types";

import styles from "./ItineraryTab.module.css";
import { ItineraryDay } from "../../components/ItineraryDay/ItineraryDay";

export const ItineraryTab: React.FC<{ itinerary: any }> = ({ itinerary }) => {
  // If no itinerary, show empty state
  if (!itinerary || itinerary.length === 0) {
    return (
      <div className={styles.itineraryContainer}>
        <p>No itinerary details available.</p>
      </div>
    );
  }

  return (
    <div
      className={styles.itineraryContainer}
      role="region"
      aria-label="Package itinerary"
    >
      <Column gap={4} fullWidth>
        <div className={styles.timeline} aria-label="Day-by-day itinerary">
          {itinerary.map((day: any, index: number) => (
            <ItineraryDay
              className={styles.day}
              key={day.day}
              day={day.day}
              title={day.title}
              description={day.description || ""}
              isLast={index === itinerary.length - 1}
            />
          ))}
        </div>
      </Column>
    </div>
  );
};
