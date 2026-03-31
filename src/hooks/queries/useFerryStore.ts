// hooks/queries/useFerryFlow.ts (UPDATED to work with your existing hooks)
import { useFerryStore } from "@/store/FerryStore";
import { useFerrySearch } from "./ferryQueryHooks/useFerrySearch";
import { useSeatLayout } from "./ferryQueryHooks/useSeatLayout";
import { useFerryBooking, useFerryHealth } from "./ferryQueryHooks";
import { useDebouncedSearchParams } from "./ferryQueryHooks/useDebouncedSearchParams";

// Enhanced orchestration hook with reactive search support
export const useFerryFlow = (options?: {
  enableReactiveSearch?: boolean;
  debounceMs?: number;
}) => {
  const { enableReactiveSearch = false, debounceMs = 1000 } = options || {};

  const {
    searchParams,
    selectedFerry,
    selectedClass,
    selectedSeats,
    // bookingSession,
  } = useFerryStore();

  // Use debounced params for reactive search
  const debouncedSearchParams = useDebouncedSearchParams(
    searchParams,
    debounceMs
  );

  // Use debounced params if reactive search is enabled, otherwise use regular params
  const effectiveSearchParams = enableReactiveSearch
    ? debouncedSearchParams
    : searchParams;

  // Your existing search query - just pass the effective params
  const searchQuery = useFerrySearch(effectiveSearchParams, {
    enabled: enableReactiveSearch ? true : undefined, // Let your existing logic handle enabling
  });

  // Rest of your existing logic remains the same
  const seatLayoutQuery = useSeatLayout(
    selectedFerry?.operator || "",
    selectedFerry?.id || null,
    selectedClass?.id || null,
    selectedFerry?.operatorData?.originalResponse?.routeId || null,
    searchParams.date || null
  );

  const bookingMutation = useFerryBooking();
  const healthQuery = useFerryHealth();

  // Derived state (keeping your existing logic)
  const isSearchEnabled = !!(
    searchParams.from &&
    searchParams.to &&
    searchParams.date
  );

  const canSelectSeats = !!(
    selectedFerry &&
    selectedClass &&
    selectedFerry.operator !== "makruzz" &&
    selectedFerry.features.supportsSeatSelection
  );

  const isReadyToBook = !!(
    selectedFerry &&
    selectedClass &&
    (selectedSeats.length > 0 || !selectedFerry.features.supportsSeatSelection)
  );

  // Check if current search params differ from debounced ones
  const hasSearchParamsChanged =
    enableReactiveSearch &&
    JSON.stringify(searchParams) !== JSON.stringify(debouncedSearchParams);

  // Helper functions (keeping your existing logic)
  const createBooking = () => {
    // if (bookingSession) {
    //   return bookingMutation.mutate(bookingSession);
    // }
  };

  const getServiceStatus = () => {
    const searchData = searchQuery.data;
    if (!searchData) return null;
    return {
      availableOperators: searchData.availableOperators || [],
      failedOperators: searchData.failedOperators || [],
      isPartialFailure: searchData.isPartialFailure || false,
      operatorErrors: searchData.errors || [],
    };
  };

  return {
    // Search state - Enhanced with fault tolerance and reactive support
    ferries: searchQuery.data?.results || [],
    searchErrors: searchQuery.data?.errors || [],
    isSearching: searchQuery.isFetching,
    searchError: searchQuery.error,
    isPartialFailure: searchQuery.data?.isPartialFailure || false,
    availableOperators: searchQuery.data?.availableOperators || [],
    failedOperators: searchQuery.data?.failedOperators || [],

    // Reactive search specific state
    hasSearchParamsChanged,
    debouncedSearchParams,

    // Seat layout state (your existing logic)
    seatLayout: seatLayoutQuery.data,
    isLoadingSeats: seatLayoutQuery.isFetching,
    seatError: seatLayoutQuery.error,

    // Booking state (your existing logic)
    isBooking: bookingMutation.isPending,
    bookingError: bookingMutation.error,
    bookingSuccess: bookingMutation.data,

    // Health state (your existing logic)
    operatorHealth: healthQuery.data,
    isCheckingHealth: healthQuery.isFetching,

    // Computed state (your existing logic)
    isSearchEnabled,
    canSelectSeats,
    isReadyToBook,

    // Service status helper (your existing logic)
    serviceStatus: getServiceStatus(),

    // Actions (your existing logic)
    refetchSearch: searchQuery.refetch,
    refetchSeats: seatLayoutQuery.refetch,
    createBooking,

    // Raw queries for advanced usage (your existing logic)
    queries: {
      search: searchQuery,
      seatLayout: seatLayoutQuery,
      health: healthQuery,
    },
    mutations: {
      booking: bookingMutation,
    },

    // Enhanced error information (your existing logic)
    hasAnyErrors: !!(
      searchQuery.error ||
      (searchQuery.data?.errors?.length && searchQuery.data.errors.length > 0)
    ),
    hasCriticalError: !!(
      searchQuery.error &&
      (!searchQuery.data?.results?.length ||
        searchQuery.data.results.length === 0)
    ),
    hasPartialFailure: !!(
      searchQuery.data?.isPartialFailure &&
      searchQuery.data.results?.length &&
      searchQuery.data.results.length > 0
    ),
  };
};
