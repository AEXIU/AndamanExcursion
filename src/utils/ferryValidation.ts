import { UnifiedFerryResult, FerryClass } from "@/types/FerryBookingSession.types";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate seat selection based on ferry operator and passenger count
 */
export const validateSeatSelection = (
  selectedSeats: string[],
  totalPassengers: number,
  ferry: UnifiedFerryResult
): ValidationResult => {
  // For operators that require manual seat selection
  if (
    ferry.operator === "greenocean" ||
    ferry.operator === "sealink" ||
    // For Makruzz: only require seat selection for Pearl (supportsSeatSelection is only true for Pearl)
    (ferry.operator === "makruzz" && ferry.features.supportsSeatSelection) ||
    (ferry.features.supportsSeatSelection && !ferry.features.supportsAutoAssignment)
  ) {
    if (selectedSeats.length === 0) {
      return {
        isValid: false,
        message: "Please select your seats before proceeding to checkout."
      };
    }

    if (selectedSeats.length !== totalPassengers) {
      return {
        isValid: false,
        message: `Please select ${totalPassengers} seat(s) for your ${totalPassengers} passenger(s).`
      };
    }
  }

  // For operators with manual selection chosen (excluding Sealink)
  if (
    ferry.features.supportsSeatSelection &&
    ferry.features.supportsAutoAssignment &&
    ferry.operator !== "sealink"
  ) {
    // This validation will be handled by the component based on preference
    return { isValid: true };
  }

  return { isValid: true };
};

/**
 * Check if user can proceed to checkout
 */
export const canProceedToCheckout = (
  ferry: UnifiedFerryResult,
  selectedClass: FerryClass | null,
  selectedSeats: string[],
  passengers: number
): boolean => {
  if (!selectedClass) return false;

  const validation = validateSeatSelection(selectedSeats, passengers, ferry);
  return validation.isValid;
};

/**
 * Get validation message for current state
 */
export const getValidationMessage = (
  ferry: UnifiedFerryResult,
  selectedClass: FerryClass | null,
  selectedSeats: string[],
  passengers: number
): string | null => {
  if (!selectedClass) return "Please select a class to continue";

  const validation = validateSeatSelection(selectedSeats, passengers, ferry);
  return validation.message || null;
};
