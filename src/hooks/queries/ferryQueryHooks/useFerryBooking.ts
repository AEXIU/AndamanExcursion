import { FerryBookingSession } from "@/types/FerryBookingSession.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useFerryBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: FerryBookingSession) => {
      // Call your booking API
      const response = await fetch("/api/ferry?action=create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Booking failed");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate seat layouts after successful booking
      queryClient.invalidateQueries({
        queryKey: ["seat-layout"],
      });

      // Clear any blocked seats
      queryClient.invalidateQueries({
        queryKey: ["seat-blocking"],
      });
    },
    onError: (error) => {
      console.error("Ferry booking failed:", error);
    },
  });
};
