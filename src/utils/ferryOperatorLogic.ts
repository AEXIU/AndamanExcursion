import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";

/**
 * Check if ferry operator should show seat preference options
 * As per user request, seat selection is mandatory, so preference toggles are hidden.
 */
export const shouldShowSeatPreference = (ferry: UnifiedFerryResult): boolean => {
  return false;
};

/**
 * Check if operator requires manual seat selection
 */
export const requiresManualSelection = (ferry: UnifiedFerryResult): boolean => {
  return ferry.features.supportsSeatSelection;
};

/**
 * Check if operator supports both auto and manual preferences
 */
export const supportsBothPreferences = (ferry: UnifiedFerryResult): boolean => {
  return false;
};

/**
 * Get default seat preference for operator
 */
export const getDefaultSeatPreference = (ferry: UnifiedFerryResult): "manual" | "auto" => {
  return ferry.features.supportsSeatSelection ? "manual" : "auto";
};

/**
 * Check if seat layout should be loaded automatically
 */
export const shouldLoadSeatLayoutAutomatically = (ferry: UnifiedFerryResult): boolean => {
  return ferry.features.supportsSeatSelection;
};

/**
 * Check if operator supports only auto-assignment
 */
export const supportsOnlyAutoAssignment = (ferry: UnifiedFerryResult): boolean => {
  return (
    !ferry.features.supportsSeatSelection &&
    ferry.features.supportsAutoAssignment &&
    ferry.operator !== "sealink"
  );
};

/**
 * Check if the operator should use the offline enquiry flow instead of regular booking
 * E.g., Green Ocean, Go Nautica
 */
export const isOfflineEnquiryOperator = (ferry: UnifiedFerryResult | null | undefined): boolean => {
  if (!ferry?.operator) return false;
  
  const operatorLower = ferry.operator.toLowerCase();
  const ferryNameLower = (ferry.ferryName || '').toLowerCase();
  return (
    operatorLower.includes('greenocean') || 
    operatorLower.includes('green ocean') || 
    operatorLower.includes('nautica') ||
    ferryNameLower.includes('nautika') ||
    ferryNameLower.includes('nautica')
  );
};
