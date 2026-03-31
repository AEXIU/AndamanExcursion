import { useQuery } from "@tanstack/react-query";
import { locationApi } from "@/services/api/locations";
import { timeSlotApi } from "@/services/api/timeSlots";
import { activityCategoryApi } from "@/services/api/activityCategories";

// Individual hooks for each form option type
export function useActivityCategories() {
  return useQuery({
    queryKey: ["activityCategories"],
    queryFn: () => activityCategoryApi.getActive(),
    staleTime: 1000 * 60 * 15, // 15 minutes - categories change rarely
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: () => locationApi.getAll(),
    staleTime: 1000 * 60 * 15, // 15 minutes - locations change rarely
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useTimeSlots() {
  return useQuery({
    queryKey: ["timeSlots"],
    queryFn: () => timeSlotApi.getForActivities(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Combined hook for all form options
export function useFormOptions() {
  const categoriesQuery = useActivityCategories();
  const locationsQuery = useLocations();
  const timeSlotsQuery = useTimeSlots();

  return {
    categories: categoriesQuery,
    locations: locationsQuery,
    timeSlots: timeSlotsQuery,
    isLoading:
      categoriesQuery.isLoading ||
      locationsQuery.isLoading ||
      timeSlotsQuery.isLoading,
    error:
      categoriesQuery.error || locationsQuery.error || timeSlotsQuery.error,
  };
}
