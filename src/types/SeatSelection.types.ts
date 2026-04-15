/**
 * Seat Selection Types
 * 
 * Centralized type definitions for all seat-related functionality
 * across ferry operators (Sealink, Green Ocean, Makruzz)
 */

// ===== CORE SEAT TYPES =====

export interface Seat {
  id: string;
  number: string;
  displayNumber: string;
  status: SeatStatus;
  // type removed - visual layouts will determine seat types based on actual ferry plans
  position?: SeatPosition;
  price?: number;
  tier?: SeatTier;
  isAccessible?: boolean;
  isPremium?: boolean;
}

export type SeatStatus =
  | "available"
  | "booked"
  | "blocked"
  | "selected"
  | "temporarily_blocked";

export type SeatType = "window" | "aisle" | "middle";

export type SeatTier = "B" | "P"; // Business | Premium (Sealink)

export interface SeatPosition {
  row: number;
  column: number;
}

// ===== SEAT LAYOUT TYPES =====

export interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  seats: Seat[];
  operatorData?: OperatorSeatData;
  layoutConfig?: SeatLayoutConfig;
}

export interface SeatLayoutConfig {
  rows: number;
  seatsPerRow: number;
  aislePositions: number[];
  emergencyExits: number[];
}

// ===== OPERATOR-SPECIFIC DATA TYPES =====

export interface OperatorSeatData {
  sealink?: SealinkSeatData;
  greenocean?: GreenOceanSeatData;
  makruzz?: MakruzzSeatData;
}

// Sealink-specific types
export interface SealinkSeatData {
  id: string;
  tripId: number;
  from: string;
  to: string;
  dTime: TimeSlot;
  aTime: TimeSlot;
  vesselID: number;
  fares: SealinkFareStructure;
  bClass: Record<string, SealinkSeatDetails>;
  pClass: Record<string, SealinkSeatDetails>;
}

export interface TimeSlot {
  hour: number;
  minute: number;
}

export interface SealinkFareStructure {
  pBaseFare: number;
  bBaseFare: number;
  pBaseFarePBHLNL: number;
  bBaseFarePBHLNL: number;
  pIslanderFarePBHLNL: number;
  bIslanderFarePBHLNL: number;
  infantFare: number;
}

export interface SealinkSeatDetails {
  tier: SeatTier;
  number: string;
  isBooked: 0 | 1;
  isBlocked: 0 | 1;
}

// Green Ocean-specific types
export interface GreenOceanSeatData {
  layout: GreenOceanSeatItem[];
  booked_seat: string[];
  class_type: number;
}

export interface GreenOceanSeatItem {
  seat_no: string;
  seat_numbering: string;
  status: string;
}

// Makruzz-specific types
export interface MakruzzSeatData {
  seats: MakruzzSeatItem[];
}

export interface MakruzzSeatItem {
  seat_id: string;  // e.g. "P1A", "D3F", "R2C"
  status: "available" | "booked" | "blocked";
}

// ===== SEAT SELECTION TYPES =====

export interface SeatSelectionData {
  selectedSeats: Seat[];
  totalPrice: number;
  seatIds: string[];
}

export interface SeatSelectionProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats: number;
  isLoading?: boolean;
  onRefreshLayout?: () => void;
}

// ===== FERRY VESSEL LAYOUT TYPES =====

export interface FerryVesselLayoutProps {
  operator: string;
  vesselClass: string;
  seats: Seat[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats: number;
  isLoading?: boolean;
  onRefreshLayout?: () => void;
}

export interface VesselLayoutConfig {
  operator: string;
  vesselClass: string;
  layout: VesselLayout;
}

export interface VesselLayout {
  sections: VesselSection[];
  totalSeats: number;
  aisles: AisleConfig[];
}

export interface VesselSection {
  id: string;
  name: string;
  tier?: SeatTier;
  rows: VesselRow[];
}

export interface VesselRow {
  id: string;
  number: number;
  seats: VesselSeatPosition[];
}

export interface VesselSeatPosition {
  id: string;
  column: number;
  type: SeatType;
  isAccessible?: boolean;
  isPremium?: boolean;
}

export interface AisleConfig {
  afterColumn: number;
  width: number;
}

// ===== SEAT PREFERENCE TYPES =====

export type SeatPreference = "manual" | "auto";

export interface SeatPreferenceConfig {
  operator: string;
  supportsManualSelection: boolean;
  supportsAutoAssignment: boolean;
  defaultPreference: SeatPreference;
}

// ===== UTILITY TYPES =====

export interface SeatValidationResult {
  isValid: boolean;
  message?: string;
  errors?: string[];
}

export interface SeatPricingInfo {
  baseFare: number;
  taxes?: number;
  fees?: number;
  total: number;
}

// ===== COMPONENT PROP TYPES =====

export interface SeatLayoutComponentProps {
  operator: string;
  vesselClass: string;
  seats: Seat[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats: number;
  isLoading?: boolean;
  onRefreshLayout?: () => void;
  ferryInfo?: {
    name: string;
    route: string;
    departureTime: string;
    estimatedDuration: string;
  };
  pricingInfo?: SeatPricingInfo;
  accessibleSeats?: string[];
  premiumSeats?: string[];
}
