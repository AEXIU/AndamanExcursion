import { useState, useCallback } from "react";
import { SeatLayout, UnifiedFerryResult } from "@/types/FerryBookingSession.types";

interface UseSeatLayoutReturn {
  seatLayout: SeatLayout | null;
  isLoading: boolean;
  error: string | null;
  loadSeatLayout: (classId: string, forceRefresh?: boolean) => Promise<void>;
  refreshLayout: () => void;
}

export const useSeatLayout = (ferry: UnifiedFerryResult | null): UseSeatLayoutReturn => {
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);

  const loadSeatLayout = useCallback(async (classId: string, forceRefresh = false) => {
    if (!ferry) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ferry?action=seat-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: ferry.operatorData.originalResponse.routeId,
          ferryId: ferry.operatorFerryId,
          classId,
          travelDate: ferry.schedule.date,
          operator: ferry.operator,
          forceRefresh,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSeatLayout(data.data.seatLayout);
        setCurrentClassId(classId);
        console.log(
          `🪑 Seat layout updated: ${data.data.seatLayout.seats.length} total seats, available: ${
            data.data.seatLayout.seats.filter((s: any) => s.status === "available").length
          }`
        );
      } else {
        throw new Error("Failed to load seat layout");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error loading seat layout";
      setError(errorMessage);
      console.error("Error loading seat layout:", err);
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
    seatLayout,
    isLoading,
    error,
    loadSeatLayout,
    refreshLayout
  };
};
