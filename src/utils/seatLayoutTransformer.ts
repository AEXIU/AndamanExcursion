/**
 * Seat Layout Transformer
 * 
 * Utility functions to transform complex operator-specific seat data
 * into simplified unified Seat[] format for the streamlined system
 */

import {
  Seat,
  SealinkSeatData,
  GreenOceanSeatData,
  MakruzzSeatData,
  SeatStatus,
  SeatTier
} from "@/types/SeatSelection.types";
import { SeatLayout } from "@/types/FerryBookingSession.types";

/**
 * Transform existing SeatLayout object to simplified Seat array
 */
export function transformSeatLayoutToSeats(seatLayout: SeatLayout): Seat[] {
  console.log("🔄 Starting seat layout transformation:", {
    hasOperatorData: !!seatLayout.operatorData,
    hasSealink: !!seatLayout.operatorData?.sealink,
    hasGreenOcean: !!seatLayout.operatorData?.greenocean,
    genericSeatsCount: seatLayout.seats?.length || 0,
    seatLayout: seatLayout
  });

  // If we have operator-specific data with actual data, use that for more accurate transformation
  if (seatLayout.operatorData?.sealink &&
    (Object.keys(seatLayout.operatorData.sealink.bClass || {}).length > 0 ||
      Object.keys(seatLayout.operatorData.sealink.pClass || {}).length > 0)) {
    console.log("📍 Using Sealink transformation");
    return transformSealinkToSeats(seatLayout.operatorData.sealink);
  }

  if (seatLayout.operatorData?.greenocean && seatLayout.operatorData.greenocean.layout?.length > 0) {
    console.log("📍 Using Green Ocean transformation");
    return transformGreenOceanToSeats(seatLayout.operatorData.greenocean);
  }

  if (seatLayout.operatorData?.makruzz && seatLayout.operatorData.makruzz.seats?.length > 0) {
    console.log("📍 Using Makruzz transformation");
    return transformMakruzzToSeats(seatLayout.operatorData.makruzz);
  }

  // Use the generic seats array (which is already properly formatted for Sealink)
  console.log("📍 Using generic seats array - already formatted");
  return seatLayout.seats.map((seat: any) => ({
    id: seat.id,
    number: seat.number,
    displayNumber: seat.seat_numbering || seat.number,
    status: seat.status as SeatStatus,
    type: seat.type,
    position: seat.position,
    price: seat.price,
    tier: seat.tier as SeatTier,
    isAccessible: seat.isAccessible,
    isPremium: seat.isPremium,
  }));
}

/**
 * Transform Sealink operator data to unified Seat array
 */
export function transformSealinkToSeats(sealinkData: SealinkSeatData): Seat[] {
  console.log("🔄 Transforming Sealink data:", {
    hasBClass: !!sealinkData.bClass,
    hasPClass: !!sealinkData.pClass,
    bClassCount: Object.keys(sealinkData.bClass || {}).length,
    pClassCount: Object.keys(sealinkData.pClass || {}).length,
    sealinkData: sealinkData
  });

  const seats: Seat[] = [];

  // Process Business Class seats
  Object.entries(sealinkData.bClass).forEach(([seatNumber, seatDetails]) => {
    const status: SeatStatus =
      sealinkData.bClass[seatNumber].isBooked === 1
        ? "booked"
        : sealinkData.bClass[seatNumber].isBlocked === 1
          ? "blocked"
          : "available";

    seats.push({
      id: `b_${seatNumber}`,
      number: seatNumber,
      displayNumber: seatDetails.number,
      status,
      tier: "B",
      price: sealinkData.fares.bBaseFare,
      // No seat type assumptions - keep data clean
      isAccessible: false, // Can be enhanced based on seat number patterns
      isPremium: false,
    });
  });

  // Process Premium Class seats
  Object.entries(sealinkData.pClass).forEach(([seatNumber, seatDetails]) => {
    const status: SeatStatus =
      sealinkData.pClass[seatNumber].isBooked === 1
        ? "booked"
        : sealinkData.pClass[seatNumber].isBlocked === 1
          ? "blocked"
          : "available";

    seats.push({
      id: `p_${seatNumber}`,
      number: seatNumber,
      displayNumber: seatDetails.number,
      status,
      tier: "P",
      price: sealinkData.fares.pBaseFare,
      // No seat type assumptions - keep data clean
      isAccessible: false, // Can be enhanced based on seat number patterns
      isPremium: true, // Premium class seats are premium by default
    });
  });

  return seats;
}

/**
 * Transform Green Ocean operator data to unified Seat array
 */
export function transformGreenOceanToSeats(greenOceanData: GreenOceanSeatData): Seat[] {
  return greenOceanData.layout.map((seat) => ({
    id: seat.seat_no,
    number: seat.seat_no,
    displayNumber: seat.seat_numbering,
    status: seat.status === "booked" ? "booked" : "available",
    // No seat type assumptions - keep data clean
    isAccessible: false, // Can be enhanced based on seat number patterns
    isPremium: false, // Can be enhanced based on class type
  }));
}

// REMOVED: determineSeatType function - no more seat type assumptions

/**
 * Transform Makruzz operator data to unified Seat array
 */
export function transformMakruzzToSeats(makruzzData: MakruzzSeatData): Seat[] {
  return makruzzData.seats.map((seat) => ({
    id: seat.seat_id,
    number: seat.seat_id,
    displayNumber: seat.seat_id,
    status: seat.status === "booked" ? "booked" as SeatStatus : "available" as SeatStatus,
    isAccessible: false,
    isPremium: false,
  }));
}

/**
 * Enhanced seat type determination with accessibility detection
 */
export function enhanceSeatsWithAccessibility(
  seats: Seat[],
  accessibleSeatNumbers: string[] = [],
  premiumSeatNumbers: string[] = []
): Seat[] {
  return seats.map(seat => ({
    ...seat,
    isAccessible: accessibleSeatNumbers.includes(seat.number) ||
      isAccessibleSeat(seat.number),
    isPremium: premiumSeatNumbers.includes(seat.number) ||
      seat.isPremium ||
      isPremiumSeat(seat.number),
  }));
}

/**
 * Detect accessible seats based on common patterns
 */
function isAccessibleSeat(seatNumber: string): boolean {
  // Common patterns for accessible seats
  const accessiblePatterns = [
    /^1[A-F]$/, // First row seats
    /^[0-9]+A$/, // A seats (often wider)
    /^[0-9]+F$/, // F seats (often wider)
  ];

  return accessiblePatterns.some(pattern => pattern.test(seatNumber));
}

/**
 * Detect premium seats based on common patterns
 */
function isPremiumSeat(seatNumber: string): boolean {
  // Common patterns for premium seats
  const premiumPatterns = [
    /^[1-3][A-F]$/, // First 3 rows
    /^[0-9]+[AF]$/, // Window seats
  ];

  return premiumPatterns.some(pattern => pattern.test(seatNumber));
}

/**
 * Create simplified seat layout data from API responses
 */
export function createSimplifiedSeatData(
  operator: string,
  apiResponse: any,
  classId: string
): Seat[] {
  switch (operator) {
    case "sealink":
      if (apiResponse.operatorData?.sealink) {
        return transformSealinkToSeats(apiResponse.operatorData.sealink);
      }
      break;

    case "greenocean":
      if (apiResponse.operatorData?.greenocean) {
        return transformGreenOceanToSeats(apiResponse.operatorData.greenocean);
      }
      break;

    case "makruzz":
      if (apiResponse.operatorData?.makruzz) {
        return transformMakruzzToSeats(apiResponse.operatorData.makruzz);
      }
      break;

    default:
      // Fallback for unknown operators
      if (apiResponse.seats && Array.isArray(apiResponse.seats)) {
        return apiResponse.seats.map((seat: any) => ({
          id: seat.id || seat.seat_no,
          number: seat.number || seat.seat_no,
          displayNumber: seat.seat_numbering || seat.number || seat.seat_no,
          status: seat.status as SeatStatus,
          // No seat type assumptions - keep data clean
          price: seat.price,
          isAccessible: seat.isAccessible || false,
          isPremium: seat.isPremium || false,
        }));
      }
  }

  return [];
}
