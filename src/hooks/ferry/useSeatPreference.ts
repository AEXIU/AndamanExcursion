import { useState, useEffect } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { 
  getDefaultSeatPreference, 
  shouldShowSeatPreference, 
  requiresManualSelection 
} from "@/utils/ferryOperatorLogic";

interface UseSeatPreferenceReturn {
  preference: "manual" | "auto";
  canChoosePreference: boolean;
  setPreference: (pref: "manual" | "auto") => void;
}

export const useSeatPreference = (ferry: UnifiedFerryResult | null): UseSeatPreferenceReturn => {
  const [preference, setPreferenceState] = useState<"manual" | "auto">("manual");

  useEffect(() => {
    if (ferry) {
      const defaultPreference = getDefaultSeatPreference(ferry);
      setPreferenceState(defaultPreference);
    }
  }, [ferry]);

  const canChoosePreference = ferry ? shouldShowSeatPreference(ferry) : false;

  const setPreference = (pref: "manual" | "auto") => {
    if (ferry && !requiresManualSelection(ferry)) {
      setPreferenceState(pref);
    }
  };

  return {
    preference,
    canChoosePreference,
    setPreference
  };
};
