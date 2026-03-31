// Enhanced useTimeFiltering hook - now store-aware
import { useMemo } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { useFerryStore } from "@/store/FerryStore";

/**
 * Enhanced time filtering hook that connects to store state
 * and provides the same filtering logic for both form preferences and manual filters
 */
export const useTimeFiltering = (results: UnifiedFerryResult[]) => {
  // Connect to store state
  const activeTimeFilter = useFerryStore((state) => state.activeTimeFilter);
  const setActiveTimeFilter = useFerryStore(
    (state) => state.setActiveTimeFilter
  );

  // Filter results based on active time filter
  const filteredResults = useMemo(() => {
    if (!activeTimeFilter || !results.length) {
      return results;
    }

    const [startTime, endTime] = activeTimeFilter.split("-");
    const startHour = parseInt(startTime.substring(0, 2));
    const startMinute = parseInt(startTime.substring(2, 4));
    const endHour = parseInt(endTime.substring(0, 2));
    const endMinute = parseInt(endTime.substring(2, 4));

    return results.filter((ferry) => {
      // Parse departure time (format: "HH:MM")
      const [depHour, depMinute] = ferry.schedule.departureTime
        .split(":")
        .map(Number);

      const departureMinutes = depHour * 60 + depMinute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      // Handle time range that crosses midnight
      if (endMinutes <= startMinutes) {
        return (
          departureMinutes >= startMinutes || departureMinutes <= endMinutes
        );
      }

      return departureMinutes >= startMinutes && departureMinutes <= endMinutes;
    });
  }, [results, activeTimeFilter]);

  // Return consistent interface but connected to store
  return {
    timeFilter: activeTimeFilter,
    setTimeFilter: setActiveTimeFilter,
    filteredResults,

    // Additional utilities
    hasTimeFilter: !!activeTimeFilter,
    filteredCount: filteredResults.length,
    totalCount: results.length,
    filterSummary: activeTimeFilter
      ? `Showing ${filteredResults.length} of ${results.length} ferries`
      : `Showing all ${results.length} ferries`,
  };
};
