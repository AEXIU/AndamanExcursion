import { useQuery } from "@tanstack/react-query";
import { boatRouteApi } from "@/services/api/boatRoutes";

// Hook for all active boat routes
export function useBoatRoutes() {
  return useQuery({
    queryKey: ["boatRoutes"],
    queryFn: () => boatRouteApi.getAllWithDetails(),
    staleTime: 1000 * 60 * 15, // 15 minutes - routes change rarely
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook for boat routes by from location
export function useBoatRoutesByFromLocation(fromLocationSlug: string | null) {
  return useQuery({
    queryKey: ["boatRoutes", "fromLocation", fromLocationSlug],
    queryFn: () => boatRouteApi.getByFromLocation(fromLocationSlug!),
    enabled: !!fromLocationSlug,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Hook for single boat route
export function useBoatRoute(routeId: string | null) {
  return useQuery({
    queryKey: ["boatRoute", routeId],
    queryFn: () => boatRouteApi.getById(routeId!),
    enabled: !!routeId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Combined hook for boat form options
export function useBoatFormOptions() {
  const boatRoutesQuery = useBoatRoutes();

  // Extract unique from locations from routes
  const fromLocations =
    boatRoutesQuery.data?.reduce((acc, route) => {
      if (route.fromLocation && typeof route.fromLocation === "object") {
        const location = route.fromLocation;
        if (!acc.some((loc) => loc.id === location.id)) {
          acc.push(location);
        }
      }
      return acc;
    }, [] as any[]) || [];

  return {
    boatRoutes: boatRoutesQuery,
    fromLocations,
    isLoading: boatRoutesQuery.isLoading,
    error: boatRoutesQuery.error,
  };
}
