import React, { memo } from "react";
import { Info } from "lucide-react";
import { formatTimeForDisplay } from "@/utils/timeUtils";
import styles from "./BookingResults.module.css";

interface SearchSummaryProps {
  loading: boolean;
  resultCount: number;
  from?: string;
  to?: string;
  activity?: string;
  activityName?: string; // Display name for activity
  location?: string;
  locationName?: string; // Display name for location
  date: string;
  time: string;
  timeFilter?: string | null; // Make optional
  passengers: number;
  type: "ferry" | "activity" | "boat";
}

export const SearchSummary = memo<SearchSummaryProps>(
  ({
    loading,
    resultCount,
    from,
    to,
    activity,
    activityName,
    location,
    locationName,
    date,
    time,
    timeFilter,
    passengers,
    type,
  }) => {
    if (loading) {
      return (
        <div className={styles.searchSummary}>
          <div className={styles.searchInfo}>
            <p>
              Searching for {type === "ferry" ? "ferries" : "activities"}...
            </p>
          </div>
        </div>
      );
    }

    const displayTime = formatTimeForDisplay(timeFilter || time);
    const formattedDate = new Date(date).toLocaleDateString();
    const passengerText = `${passengers} Passenger${
      passengers !== 1 ? "s" : ""
    }`;

    // Different summary based on type
    const summaryText =
      type === "ferry"
        ? `${resultCount} ferries found for ${from} to ${to} at ${displayTime}`
        : `${resultCount} ${activityName || activity || "activities"} found${
            locationName ? ` in ${locationName}` : ""
          }${displayTime ? ` at ${displayTime}` : ""}`;

    // Different heading based on type
    const headingText =
      type === "ferry"
        ? `${from} to ${to} • ${formattedDate} • ${passengerText}`
        : `${activityName || activity || "Activities"}${
            locationName ? ` in ${locationName}` : ""
          } • ${formattedDate} • ${passengerText}`;

    return (
      <div className={styles.searchSummary}>
        <div className={styles.searchInfo}>
          <div className={styles.resultCount}>
            <Info size={16} />
            <span>{summaryText}</span>
          </div>
          <h2>{headingText}</h2>
        </div>
      </div>
    );
  }
);

SearchSummary.displayName = "SearchSummary";
