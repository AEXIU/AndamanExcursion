import { useMemo } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";

interface OperatorError {
  operator: string;
  error: string;
}

interface EnhancedError {
  message: string;
  operatorErrors: OperatorError[];
  isPartialFailure: boolean;
}

export const useErrorHandling = (
  error: Error | null,
  searchErrors: OperatorError[],
  searchResults: UnifiedFerryResult[],
  isPartialFailure: boolean,
  refetchSearch: () => void
) => {
  const enhancedError = useMemo((): EnhancedError | null => {
    if (error) {
      return {
        message: error.message || "Ferry search failed",
        operatorErrors: searchErrors,
        isPartialFailure: isPartialFailure || false,
      };
    }

    if (searchErrors.length > 0 && searchResults.length === 0) {
      return {
        message:
          "All ferry operators are temporarily unavailable. Please try again later.",
        operatorErrors: searchErrors,
        isPartialFailure: false,
      };
    }

    if (isPartialFailure && searchResults.length > 0) {
      return {
        message: `Some ferry operators are temporarily unavailable, but we found ${searchResults.length} options from available services.`,
        operatorErrors: searchErrors,
        isPartialFailure: true,
      };
    }

    return null;
  }, [error, searchErrors, searchResults.length, isPartialFailure]);

  const handleRetry = () => {
    refetchSearch();
  };

  const handleClearError = () => {
    refetchSearch();
  };

  return {
    enhancedError,
    handleRetry,
    handleClearError,
  };
};
