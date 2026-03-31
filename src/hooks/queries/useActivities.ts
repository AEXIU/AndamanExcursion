import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/services/api/activities";
import { ActivitySearchParams } from "@/store/ActivityStoreRQ";

export interface TimeSlot {
  value: string;
  label: string;
  startTime: string;
  endTime: string;
}

export function useActivitiesSearch(
  searchParams: ActivitySearchParams,
  enabled: boolean = true
) {
  const queryEnabled = enabled && !!searchParams.activityType;

  return useQuery({
    queryKey: ["activities", "search", searchParams],
    queryFn: async () => {
      const result = await activityApi.search(searchParams);
      return result;
    },
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}


export function useActivityTimesByCategory(
  categorySlug: string | null,
  locationSlug: string | null
) {
  return useQuery({
    queryKey: ["activity-times", categorySlug, locationSlug],
    queryFn: async (): Promise<TimeSlot[]> => {
      if (!categorySlug || !locationSlug) {
        return [];
      }

      return await activityApi.getAvailableTimesByCategory(
        categorySlug,
        locationSlug
      );
    },
    enabled: !!(categorySlug && locationSlug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
