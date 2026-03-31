import { useState, useCallback } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { Seat } from "@/types/SeatSelection.types";
import { transformSeatLayoutToSeats } from "@/utils/seatLayoutTransformer";

interface UseSimplifiedSeatLayoutReturn {
  seats: Seat[];
  isLoading: boolean;
  error: string | null;
  loadSeatLayout: (classId: string, forceRefresh?: boolean) => Promise<void>;
  refreshLayout: () => void;
}

/**
 * Simplified Seat Layout Hook
 * 
 * This replaces the complex useSeatLayout hook with:
 * 1. Direct Seat[] array instead of complex SeatLayout object
 * 2. Simplified state management
 * 3. Better error handling
 * 4. Consistent interface across operators
 */
export const useSimplifiedSeatLayout = (ferry: UnifiedFerryResult | null): UseSimplifiedSeatLayoutReturn => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);

  const loadSeatLayout = useCallback(async (classId: string, forceRefresh = false) => {
    if (!ferry) {
      console.log("❌ No ferry provided to loadSeatLayout");
      return;
    }

    console.log("🔄 Loading simplified seat layout:", {
      operator: ferry.operator,
      ferryId: ferry.operatorFerryId || ferry.id,
      classId,
      routeId: ferry.operatorData?.originalResponse?.routeId,
    });

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ferry?action=seat-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: ferry.operatorData?.originalResponse?.routeId || null,
          ferryId: ferry.operatorFerryId || ferry.id,
          classId,
          travelDate: ferry.schedule.date,
          operator: ferry.operator,
          forceRefresh,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform complex seat layout to simplified Seat[] array
        if (data.success && data.data?.seatLayout) {
          const transformedSeats = transformSeatLayoutToSeats(data.data.seatLayout);
          setSeats(transformedSeats);
          setCurrentClassId(classId);
          
          console.log(
            `🪑 Simplified seat layout loaded: ${transformedSeats.length} total seats, available: ${
              transformedSeats.filter((s) => s.status === "available").length
            }`
          );
        } else {
          throw new Error("Invalid seat layout response");
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to load seat layout";
        console.error("❌ Seat layout API error:", {
          status: response.status,
          error: errorMessage,
          ferry: ferry.operator,
          classId,
        });
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error loading seat layout";
      setError(errorMessage);
      console.error("❌ Error loading simplified seat layout:", {
        error: err,
        ferry: ferry.operator,
        classId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [ferry]);

  const refreshLayout = useCallback(() => {
    if (currentClassId) {
      loadSeatLayout(currentClassId, true);
    }
  }, [currentClassId, loadSeatLayout]);

  return {
    seats,
    isLoading,
    error,
    loadSeatLayout,
    refreshLayout
  };
};
