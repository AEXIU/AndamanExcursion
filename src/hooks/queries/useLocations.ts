import { useQuery } from "@tanstack/react-query";
import { locationApi, timeSlotApi } from "@/services/api";

export const useLocations = (type?: string) => {
  return useQuery({
    queryKey: ["locations", type],
    queryFn: () => (type ? locationApi.getByType(type) : locationApi.getAll()),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFerryPorts = () => {
  return useQuery({
    queryKey: ["locations", "ferry_port"],
    queryFn: () => locationApi.getForFerries(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useActivityLocations = () => {
  return useQuery({
    queryKey: ["locations", "activity_location"],
    queryFn: () => locationApi.getForActivities(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTimeSlots = (
  type?: "ferry" | "boat" | "activity" | "package" | "general"
) => {
  return useQuery({
    queryKey: ["time-slots", type],
    queryFn: () => (type ? timeSlotApi.getByType(type) : timeSlotApi.getAll()),
    staleTime: 5 * 60 * 1000,
  });
};

export const useActivityTimeSlots = () => {
  return useQuery({
    queryKey: ["time-slots", "activity"],
    queryFn: () => timeSlotApi.getForActivities(),
    staleTime: 5 * 60 * 1000,
  });
};
