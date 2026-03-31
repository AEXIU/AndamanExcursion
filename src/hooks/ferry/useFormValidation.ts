// hooks/ferry/useFormValidation.ts
import { useMemo } from "react";

export const useFormValidation = (watchedFields: any) => {
  return useMemo(() => {
    const { fromLocation, toLocation, selectedDate, passengers } =
      watchedFields;

    // Basic validation
    if (!fromLocation || !toLocation || !selectedDate || !passengers) {
      return false;
    }

    // Same location check
    if (fromLocation === toLocation) {
      return false;
    }

    // Passenger validation
    if (passengers.adults < 1) {
      return false;
    }

    // Date validation - don't allow past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const searchDate = new Date(selectedDate);
    searchDate.setHours(0, 0, 0, 0);

    if (searchDate < today) {
      return false;
    }

    return true;
  }, [watchedFields]);
};
