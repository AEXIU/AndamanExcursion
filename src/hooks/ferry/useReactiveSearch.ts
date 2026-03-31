// hooks/ferry/useReactiveSearch.ts
import { useEffect } from "react";
import { FerrySearchParams } from "@/types/FerryBookingSession.types";

interface UseReactiveSearchProps {
  watchedFields: any;
  shouldEnableReactiveSearch: boolean;
  searchParams: FerrySearchParams;
  setSearchParams: (params: FerrySearchParams) => void;
}

export const useReactiveSearch = ({
  watchedFields,
  shouldEnableReactiveSearch,
  searchParams,
  setSearchParams,
}: UseReactiveSearchProps) => {
  useEffect(() => {
    if (!shouldEnableReactiveSearch) return;

    const { fromLocation, toLocation, selectedDate, passengers } =
      watchedFields;

    if (fromLocation && toLocation && selectedDate && passengers) {
      // Basic validation before updating search params
      if (fromLocation === toLocation) return;
      if (passengers.adults < 1) return;

      const localDate = new Date(selectedDate);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const newSearchParams = {
        from: fromLocation,
        to: toLocation,
        date: formattedDate,
        adults: passengers.adults,
        children: passengers.children,
        infants: passengers.infants,
      };

      // Only update if params actually changed
      const hasChanged =
        JSON.stringify(newSearchParams) !== JSON.stringify(searchParams);
      if (hasChanged) {
        setSearchParams(newSearchParams);
      }
    }
  }, [
    watchedFields.fromLocation,
    watchedFields.toLocation,
    watchedFields.selectedDate,
    watchedFields.passengers,
    shouldEnableReactiveSearch,
    searchParams,
    setSearchParams,
  ]);
};
