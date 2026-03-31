import { useState, useEffect, useCallback } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { Seat, SeatLayout } from "@/types/SeatSelection.types";
import { useFerryStore } from "@/store/FerryStore";
import { validateSeatSelection } from "@/utils/ferryValidation";

interface UseSeatSelectionReturn {
  selectedSeats: string[];
  handleSeatSelect: (seatId: string) => void;
  canProceed: boolean;
  validationMessage: string | null;
  clearSelection: () => void;
}

export const useSeatSelection = (
  ferry: UnifiedFerryResult | null,
  passengers: number,
  seatLayout: SeatLayout | null = null
): UseSeatSelectionReturn => {
  const { selectSeats } = useFerryStore();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatSelect = useCallback(
    (seatId: string) => {
      setSelectedSeats((prev) => {
        if (prev.includes(seatId)) {
          // Deselect seat
          return prev.filter((id) => id !== seatId);
        } else {
          // Select seat - check if we've reached the passenger limit
          if (prev.length >= passengers) {
            // Replace the first selected seat with the new one (FIFO)
            return [...prev.slice(1), seatId];
          } else {
            // Add the new seat
            return [...prev, seatId];
          }
        }
      });
    },
    [passengers]
  );

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  // Update store when local seat selection changes and we have seat layout
  useEffect(() => {
    if (seatLayout && selectedSeats.length > 0) {
      const selectedSeatObjects = selectedSeats
        .map((seatId) => seatLayout.seats.find((s) => s.id === seatId))
        .filter((seat): seat is Seat => seat !== undefined);
      selectSeats(selectedSeatObjects);
    } else {
      selectSeats([]);
    }
  }, [selectedSeats, seatLayout, selectSeats]);

  // Validation
  const validation = ferry
    ? validateSeatSelection(selectedSeats, passengers, ferry)
    : { isValid: false };
  const canProceed = validation.isValid;
  const validationMessage = validation.message || null;

  return {
    selectedSeats,
    handleSeatSelect,
    canProceed,
    validationMessage,
    clearSelection,
  };
};
