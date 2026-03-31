// hooks/ferry/useTimingPreference.ts
import { useEffect } from "react";

interface UseTimingPreferenceProps {
  selectedSlot: string | undefined;
  setPreferredTime: (time: string | null) => void;
}

export const useTimingPreference = ({
  selectedSlot,
  setPreferredTime,
}: UseTimingPreferenceProps) => {
  useEffect(() => {
    // Convert form timing to filter format
    let timeFilter: string | null = null;

    if (selectedSlot && selectedSlot !== "") {
      switch (selectedSlot) {
        case "06:00":
          timeFilter = "0600-1200"; // Morning
          break;
        case "12:00":
          timeFilter = "1200-1800"; // Afternoon/Noon
          break;
        case "18:00":
          timeFilter = "1800-2359"; // Evening
          break;
        default:
          timeFilter = null;
      }
    }

    setPreferredTime(timeFilter);
  }, [selectedSlot, setPreferredTime]);
};
