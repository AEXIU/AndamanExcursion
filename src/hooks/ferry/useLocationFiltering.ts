// hooks/ferry/useLocationFiltering.ts
import { useMemo } from "react";

export const useLocationFiltering = (
  locations: any[],
  fromLocation: string,
  toLocation: string
) => {
  const availableDestinations = useMemo(() => {
    return locations.filter((location) => location.value !== fromLocation);
  }, [locations, fromLocation]);

  const availableDepartures = useMemo(() => {
    return locations.filter((location) => location.value !== toLocation);
  }, [locations, toLocation]);

  return { availableDestinations, availableDepartures };
};
