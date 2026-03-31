import { useQuery } from "@tanstack/react-query";

export const useSeatLayout = (
  operator: string,
  ferryId: string | null,
  classId: string | null,
  routeId?: number | null,
  travelDate?: string | null
) => {
  return useQuery({
    queryKey: ["seat-layout", operator, ferryId, classId, routeId, travelDate],
    queryFn: async () => {
      if (!ferryId || !classId)
        throw new Error("Ferry ID and Class ID are required");

      // Use existing ferry API route with seat-layout action
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

      return response.json();
    },
    enabled: !!(operator && ferryId && classId && operator !== "makruzz"),
    staleTime: 10 * 60 * 1000, // 10 minutes - seat layouts change less frequently
    gcTime: 15 * 60 * 1000,
    retry: 1, // Only retry once for seat layouts
    throwOnError: false,
  });
};
