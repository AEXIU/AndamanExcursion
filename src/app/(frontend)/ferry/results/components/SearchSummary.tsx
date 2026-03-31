import React from "react";
import { FerrySearchParams } from "@/types/FerryBookingSession.types";
import { Info } from "lucide-react";
import styles from "./SearchSummary.module.css";

interface SearchSummaryProps {
  loading: boolean;
  ferryCount: number;
  searchParams: FerrySearchParams;
}

export function SearchSummary({
  loading,
  ferryCount,
  searchParams,
}: SearchSummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLocation = (location: string) => {
    const locationMap: Record<string, string> = {
      "port-blair": "Port Blair",
      havelock: "Havelock Island",
      neil: "Neil Island",
      // baratang: "Baratang Island",
    };
    return locationMap[location] || location;
  };

  const formatPassengerInfo = () => {
    const totalPassengers =
      searchParams.adults + searchParams.children + searchParams.infants;

    const parts = [
      `${totalPassengers} passenger${totalPassengers !== 1 ? "s" : ""}`,
    ];

    // if (searchParams.children > 0) {
    //   parts.push(
    //     `${searchParams.children} child${
    //       searchParams.children !== 1 ? "ren" : ""
    //     }`
    //   );
    // }

    if (searchParams.infants > 0) {
      parts.push(
        `${searchParams.infants} infant${searchParams.infants !== 1 ? "s" : ""}`
      );
    }

    return parts.join(", ");
  };

  const getResultsInfo = () => {
    if (loading) {
      return (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span>Searching...</span>
        </div>
      );
    }

    if (ferryCount === 0) {
      return (
        <div className={styles.resultsInfo}>
          <Info size={16} className={styles.infoIcon} />
          <span className={`${styles.count} ${styles.noResults}`}>
            No ferries found
          </span>
        </div>
      );
    }

    return (
      <div className={styles.resultsInfo}>
        <Info size={16} className={styles.infoIcon} />
        <span className={`${styles.count} ${styles.hasResults}`}>
          {ferryCount} ferry{ferryCount !== 1 ? "s" : ""} found
        </span>
      </div>
    );
  };

  return (
    <div className={styles.searchSummary}>
      <div className={styles.routeInfo}>
        <div className={styles.route}>
          <span className={styles.from}>
            {formatLocation(searchParams.from)}
          </span>
          <span className={styles.arrow}>→</span>
          <span className={styles.to}>{formatLocation(searchParams.to)}</span>
        </div>
        <div className={styles.details}>
          <span className={styles.date}>{formatDate(searchParams.date)}</span>
          <span className={styles.separator}>•</span>
          <span className={styles.passengers}>{formatPassengerInfo()}</span>
        </div>
      </div>
      {getResultsInfo()}
    </div>
  );
}
