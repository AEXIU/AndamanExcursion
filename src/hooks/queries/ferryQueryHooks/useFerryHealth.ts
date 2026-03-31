import { useQuery } from "@tanstack/react-query";

export const useFerryHealth = () => {
  return useQuery({
    queryKey: ["ferry-health"],
    queryFn: async () => {
      // Call a health check endpoint that tests all 3 operators
      const response = await fetch("/api/ferry?action=health");
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      return response.json();
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 25000,
    retry: false, // Don't retry health checks
    throwOnError: false,
  });
};
