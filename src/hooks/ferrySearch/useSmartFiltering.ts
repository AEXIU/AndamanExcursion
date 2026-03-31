import { useMemo } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";

interface SmartFilteredResults {
  preferredTime: UnifiedFerryResult[];
  otherTimes: UnifiedFerryResult[];
}

export const useSmartFiltering = (
  searchResults: UnifiedFerryResult[] | null,
  userPreferredTime: string | null
) => {
  return useMemo((): SmartFilteredResults => {
    if (!searchResults || searchResults.length === 0) {
      return { preferredTime: [], otherTimes: [] };
    }

    // If user has a preferred time, create smart sections
    if (userPreferredTime) {
      const preferredHour = parseInt(userPreferredTime.split(":")[0]);
      const timeWindow = 2; // 2-hour window around preferred time

      const preferred = searchResults.filter((ferry: UnifiedFerryResult) => {
        const departureHour = parseInt(
          ferry.schedule.departureTime.split(":")[0]
        );
        return Math.abs(departureHour - preferredHour) <= timeWindow;
      });

      const others = searchResults.filter((ferry: UnifiedFerryResult) => {
        const departureHour = parseInt(
          ferry.schedule.departureTime.split(":")[0]
        );
        return Math.abs(departureHour - preferredHour) > timeWindow;
      });

      return {
        preferredTime: preferred.sort(
          (a: UnifiedFerryResult, b: UnifiedFerryResult) =>
            a.schedule.departureTime.localeCompare(b.schedule.departureTime)
        ),
        otherTimes: others.sort(
          (a: UnifiedFerryResult, b: UnifiedFerryResult) =>
            a.schedule.departureTime.localeCompare(b.schedule.departureTime)
        ),
      };
    } else {
      // No preferred time, show all results normally
      return { preferredTime: [], otherTimes: searchResults || [] };
    }
  }, [searchResults, userPreferredTime]);
};
