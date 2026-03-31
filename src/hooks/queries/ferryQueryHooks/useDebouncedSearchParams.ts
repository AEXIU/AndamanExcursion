// hooks/ferrySearch/useDebouncedSearchParams.ts
import { useEffect, useState, useRef } from 'react';
import { FerrySearchParams } from '@/types/FerryBookingSession.types';

export const useDebouncedSearchParams = (
  searchParams: FerrySearchParams,
  delay: number = 1000
) => {
  const [debouncedParams, setDebouncedParams] = useState(searchParams);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const isValid = !!(
        searchParams.from &&
        searchParams.to &&
        searchParams.date &&
        searchParams.from !== searchParams.to &&
        searchParams.adults > 0
      );

      if (isValid) {
        setDebouncedParams(searchParams);
      }
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchParams, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedParams;
};
