import { useQuery } from "@tanstack/react-query";
import { Seat } from "@/types/SeatSelection.types";
import { transformSeatLayoutToSeats } from "@/utils/seatLayoutTransformer";

/**
 * Simplified Seat Layout Hook
 * 
 * This hook replaces the complex seat layout fetching with:
 * 1. Direct transformation to Seat[] array
 * 2. Simplified caching strategy
 * 3. Better error handling
 * 4. Consistent interface across all operators
 */
export const useSimplifiedSeatLayout = (
  operator: string,
  ferryId: string | null,
  classId: string | null,
  routeId?: number | null,
  travelDate?: string | null
) => {
  return useQuery({
    queryKey: ["simplified-seat-layout", operator, ferryId, classId, routeId, travelDate],
    queryFn: async (): Promise<Seat[]> => {
      if (!ferryId || !classId) {
        throw new Error("Ferry ID and Class ID are required");
      }

      const requestBody = {
        operator,
        ferryId,
        classId,
        routeId,
        travelDate,
      };

      const response = await fetch("/api/ferry?action=seat-layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch seat layout");
      }

      const data = await response.json();
      
      // Transform the complex seat layout to simplified Seat[] array
      if (data.success && data.data?.seatLayout) {
        return transformSeatLayoutToSeats(data.data.seatLayout);
      }
      
      throw new Error("Invalid seat layout response");
    },
    enabled: !!(operator && ferryId && classId && operator !== "makruzz"),
    staleTime: 5 * 60 * 1000, // 5 minutes - seats change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: 2, // Retry twice for seat layouts
    throwOnError: false,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds for real-time updates
  });
};
