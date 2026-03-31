import { useQuery } from "@tanstack/react-query";
import {
  FerrySearchParams,
  UnifiedFerryResult,
} from "@/types/FerryBookingSession.types";

interface FerrySearchResponse {
  success: boolean;
  message?: string;
  data: {
    results: UnifiedFerryResult[];
    searchParams: FerrySearchParams;
    meta: {
      totalResults: number;
      searchTime: string;
      operatorErrors: Array<{
        operator: string;
        error: string;
      }>;
      availableOperators: string[];
      failedOperators: string[];
    };
  };
}

interface FerrySearchError {
  success: false;
  error: string;
  message: string;
  details?: any;
}

export const useFerrySearch = (
  searchParams: FerrySearchParams | null,
  options?: {
    enabled?: boolean;
  }
) => {
  const { enabled = true } = options || {};

  // Enhanced validation to handle reactive updates
  const isSearchValid = (params: FerrySearchParams | null) => {
    return !!(
      params?.from &&
      params?.to &&
      params?.date &&
      params.from !== params.to &&
      params.adults > 0
    );
  };

  const shouldSearch = enabled && isSearchValid(searchParams);

  return useQuery({
    queryKey: ["ferry-search", searchParams],
    queryFn: async ({ signal }) => { // Add AbortSignal support
      if (!searchParams?.from || !searchParams?.to || !searchParams?.date) {
        throw new Error("Missing required search parameters");
      }

      const response = await fetch("/api/ferry?action=search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
        signal, // Pass abort signal to fetch
      });

      const data = await response.json();

      // Handle different response status codes (keeping your existing logic)
      if (response.status === 200) {
        return {
          results: data.data.results,
          errors: data.data.meta.operatorErrors || [],
          isPartialFailure: false,
          availableOperators: data.data.meta.availableOperators || [],
          failedOperators: data.data.meta.failedOperators || [],
        };
      } else if (response.status === 207) {
        return {
          results: data.data.results,
          errors: data.data.meta.operatorErrors || [],
          isPartialFailure: true,
          availableOperators: data.data.meta.availableOperators || [],
          failedOperators: data.data.meta.failedOperators || [],
        };
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait before searching again.');
      } else if (response.status === 503) {
        throw new Error(`Service unavailable: ${data.message}`);
      } else {
        throw new Error(data.message || data.error || "Ferry search failed");
      }
    },
    enabled: shouldSearch,
    retry: (failureCount, error) => {
      if (error.message.includes('Too many requests')) return false;
      if (error.message.includes('Missing required')) return false;
      if (error.message.includes('aborted')) return false; // Don't retry cancelled requests
      if (error.message.includes('Service unavailable')) return failureCount < 2;
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 2, // Keep your existing timing
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });
};
