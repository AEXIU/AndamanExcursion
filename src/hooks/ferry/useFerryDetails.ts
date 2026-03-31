import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
import { useFerryStore } from "@/store/FerryStore";
import { useFerryFlow } from "@/hooks/queries/useFerryStore";

interface UseFerryDetailsReturn {
  ferry: UnifiedFerryResult | null;
  selectedClass: FerryClass | null;
  isLoading: boolean;
  error: string | null;
}

export const useFerryDetails = (
  ferryId?: string,
  classId?: string
): UseFerryDetailsReturn => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { selectedFerry, selectedClass, selectClass } = useFerryStore();
  const { ferries: searchResults, isSearching: isLoading } = useFerryFlow();

  const [ferry, setFerry] = useState<UnifiedFerryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if class selection has been performed to prevent infinite loops
  const hasSelectedClassRef = useRef<string | null>(null);

  const actualFerryId = ferryId || (params.id as string);
  const actualClassId = classId || searchParams.get("class");

  useEffect(() => {
    try {
      // Find ferry from search results or selected ferry
      let currentFerry = selectedFerry;

      if (!currentFerry && searchResults && searchResults.length > 0) {
        currentFerry =
          searchResults.find(
            (f: UnifiedFerryResult) => f.id === actualFerryId
          ) || null;
      }

      if (currentFerry) {
        setFerry(currentFerry);
        setError(null);

        // Auto-select class if provided in URL and not already selected
        if (
          actualClassId &&
          currentFerry.classes.length > 0 &&
          hasSelectedClassRef.current !== actualClassId
        ) {
          const targetClass = currentFerry.classes.find(
            (c) => c.id === actualClassId
          );
          if (targetClass) {
            selectClass(targetClass);
            hasSelectedClassRef.current = actualClassId;
          }
        }
      } else if (!isLoading) {
        setError("Ferry not found");
      }
    } catch (err) {
      setError("Error loading ferry details");
      console.error("Ferry details error:", err);
    }
  }, [actualFerryId, actualClassId, selectedFerry, searchResults, isLoading]); // Removed selectClass from dependencies

  // Reset the ref when ferry or class ID changes
  useEffect(() => {
    if (hasSelectedClassRef.current !== actualClassId) {
      hasSelectedClassRef.current = null;
    }
  }, [actualFerryId, actualClassId]);

  return {
    ferry,
    selectedClass,
    isLoading,
    error,
  };
};
