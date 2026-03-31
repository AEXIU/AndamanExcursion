"use client";

import {
  ActivitySearchParams,
  CartItem,
  useActivityStoreRQ,
} from "@/store/ActivityStoreRQ";
import { useFerryStore, FerryStore } from "@/store/FerryStore";
import { useBoat } from "@/store/BoatStore";
import type { Boat, BoatSearchParams, BoatCartItem } from "@/store/BoatStore";
import type {
  UnifiedFerryResult,
  FerryClass,
  Location as FerryLocation,
} from "@/types/FerryBookingSession.types";
import type { Location } from "../../payload-types";
import type { MemberDetails, CheckoutFormData } from "@/store/CheckoutStore";
import { Activity } from "@payload-types";

// Unified interfaces (unchanged)
export type BookingType = "activity" | "ferry" | "boat" | "mixed";

export interface UnifiedBookingData {
  type: BookingType;
  items: UnifiedBookingItem[];
  totalPassengers: number;
  totalPrice: number;
  requirements: PassengerRequirements;
}

export interface UnifiedBookingItem {
  id: string;
  type: "activity" | "ferry" | "boat";
  title: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  price: number;
  date: string;
  time?: string;
  location?: string | Location | Location[]; // Keep flexible for backward compatibility

  // Activity-specific
  activity?: Activity;
  searchParams?: ActivitySearchParams;

  // Ferry-specific
  ferry?: UnifiedFerryResult;
  ferryId?: string; // CRITICAL: Add ferryId for payment verification
  selectedClass?: FerryClass;
  selectedSeats?: string[];

  // Boat-specific
  boat?: Boat;
  boatSearchParams?: BoatSearchParams;
  selectedTime?: string;
}

export interface PassengerRequirements {
  totalRequired: number;
  bookings: Array<{
    title: string;
    passengers: number;
    type: "activity" | "ferry" | "boat";
  }>;
}

export interface PaymentData {
  bookingType: BookingType;
  items: UnifiedBookingItem[];
  members: MemberDetails[];
  totalPrice: number;
  contactDetails: {
    primaryName: string;
    email: string;
    whatsapp: string;
    phoneCountryCode: string;
    phoneCountry: string;
  };
  // Helper methods for Makruzz API formatting
  getMakruzzPassengerData?: () => MakruzzPassengerData[];
}

// Makruzz-specific passenger data structure
export interface MakruzzPassengerData {
  title: string; // MR, MRS, etc.
  name: string;
  age: string;
  sex: string; // male, female
  nationality: string; // indian, foreigner
  fcountry: string; // Country name for foreign passengers
  fpassport: string; // Passport number for foreign passengers  
  fexpdate: string; // Passport expiry date (YYYY-MM-DD)
}

/**
 * FIXED CheckoutAdapter - Resolves all TypeScript errors
 */
export class CheckoutAdapter {
  /**
   * Detect booking type from URL parameters
   */
  static detectBookingType(searchParams: URLSearchParams): BookingType {
    const type = searchParams.get("type");
    if (
      type === "ferry" ||
      type === "activity" ||
      type === "boat" ||
      type === "mixed"
    ) {
      return type as BookingType;
    }
    return "activity"; // Default
  }

  /**
   * Get unified booking data from store instances (FIXED)
   */
  static getUnifiedBookingData(
    type: BookingType,
    stores: {
      activityStore: ReturnType<typeof useActivityStoreRQ.getState>;
      ferryStore: FerryStore;
      boatStore: any;
    }
  ): UnifiedBookingData {
    switch (type) {
      case "activity":
        return CheckoutAdapter.getActivityCheckoutData(stores.activityStore);
      case "ferry":
        return CheckoutAdapter.getFerryCheckoutData(stores.ferryStore);
      case "boat":
        return CheckoutAdapter.getBoatCheckoutData(stores.boatStore);
      case "mixed":
        return CheckoutAdapter.getMixedCheckoutData(stores);
      default:
        throw new Error(`Unknown booking type: ${type}`);
    }
  }

  /**
   * Get passenger requirements for form setup
   */
  static getPassengerRequirements(
    data: UnifiedBookingData
  ): PassengerRequirements {
    return {
      totalRequired: data.totalPassengers,
      bookings: data.items.map((item) => ({
        title: item.title,
        passengers:
          item.passengers.adults +
          item.passengers.children +
          item.passengers.infants,
        type: item.type,
      })),
    };
  }

  /**
   * Convert form data to payment format
   */
  static preparePaymentData(
    bookingData: UnifiedBookingData,
    formData: CheckoutFormData
  ): PaymentData {
    // Recalculate pricing based on actual passenger ages for ALL booking types
    // Universal rule: Infants (<2 years) are free, everyone else (≥2 years) pays full price
    let adjustedTotalPrice = bookingData.totalPrice;
    
    if (formData.members && formData.members.length > 0 && bookingData.items.length > 0) {
      let totalAdjustedPrice = 0;
      
      // Process each booking item
      bookingData.items.forEach((item, index) => {
        let basePrice = 0;
        
        // Determine base price per passenger for each booking type
        switch (item.type) {
          case 'ferry':
            basePrice = item.ferry?.selectedClass?.price || (item.price / bookingData.totalPassengers);
            break;
          case 'activity':
            basePrice = item.price / bookingData.totalPassengers;
            break;
          case 'boat':
            basePrice = item.price / bookingData.totalPassengers;
            break;
          default:
            basePrice = item.price / bookingData.totalPassengers;
        }
        
        if (basePrice > 0) {
          const accuratePricing = CheckoutAdapter.calculateAccuratePricing(formData.members, basePrice);
          totalAdjustedPrice += accuratePricing.totalPrice;
          
          console.log(`${item.type.toUpperCase()} pricing adjustment:`, {
            itemTitle: item.title,
            originalPrice: item.price,
            basePrice,
            adjustedPrice: accuratePricing.totalPrice,
            ticketedPassengers: accuratePricing.ticketedPassengers,
            freePassengers: accuratePricing.freePassengers,
            breakdown: accuratePricing.breakdown
          });
        } else {
          totalAdjustedPrice += item.price;
        }
      });
      
      adjustedTotalPrice = totalAdjustedPrice;
      
      console.log('Total payment pricing adjustment:', {
        originalTotalPrice: bookingData.totalPrice,
        adjustedTotalPrice,
        reason: 'Recalculated based on actual passenger ages (infants <2 years free)'
      });
    }

    return {
      bookingType: bookingData.type,
      items: bookingData.items,
      members: formData.members || [],
      totalPrice: adjustedTotalPrice,
      contactDetails: {
        primaryName: formData.members?.[0]?.fullName || "",
        email: formData.members?.[0]?.email || "",
        whatsapp: formData.members?.[0]?.whatsappNumber || "",
        phoneCountryCode: formData.members?.[0]?.phoneCountryCode || "",
        phoneCountry: formData.members?.[0]?.phoneCountry || "",
      },
      // Helper method for Makruzz API formatting
      getMakruzzPassengerData: () => CheckoutAdapter.formatMakruzzPassengerData(formData.members || []),
    };
  }

  /**
   * Format passenger data for Makruzz API
   */
  static formatMakruzzPassengerData(members: MemberDetails[]): MakruzzPassengerData[] {
    return members.map((member, index) => {
      const isForeigner = member.nationality !== "Indian";
      
      return {
        title: CheckoutAdapter.getTitle(member.gender),
        name: member.fullName,
        age: member.age.toString(),
        sex: CheckoutAdapter.getMakruzzGender(member.gender),
        nationality: isForeigner ? "foreigner" : "indian",
        fcountry: isForeigner ? member.nationality : "", // Use nationality directly as country
        fpassport: isForeigner ? (member.fpassport || "") : "",
        fexpdate: isForeigner ? (member.fexpdate || "") : "",
      };
    });
  }

  /**
   * Get title based on gender for Makruzz API
   */
  private static getTitle(gender: string): string {
    switch (gender) {
      case "Male":
        return "MR";
      case "Female":
        return "MRS";
      default:
        return "MR"; // Fallback
    }
  }

  /**
   * Get Makruzz-compatible gender format
   */
  private static getMakruzzGender(gender: string): string {
    switch (gender) {
      case "Male":
        return "male";
      case "Female":
        return "female";
      default:
        return "male"; // Fallback
    }
  }

  /**
   * FIXED: Get activity checkout data from store instance
   */
  private static getActivityCheckoutData(
    activityStore: ReturnType<typeof useActivityStoreRQ.getState>
  ): UnifiedBookingData {
    const items: UnifiedBookingItem[] = activityStore.cart.map(
      (cartItem: CartItem) => ({
        id: cartItem.id,
        type: "activity" as const,
        title: cartItem.activity.title || "Activity",
        passengers: {
          adults: cartItem.searchParams.adults || 0,
          children: 0, // COMMENTED OUT: Children not handled for activities
          infants: 0, // COMMENTED OUT: Infants not handled for activities
        },
        price: cartItem.totalPrice,
        date: cartItem.searchParams.date || "",
        time: cartItem.searchParams.time || "",
        // FIXED: Ensure location is string type for activities
        location:
          typeof cartItem.activity.coreInfo?.location === "string"
            ? cartItem.activity.coreInfo.location
            : Array.isArray(cartItem.activity.coreInfo?.location) &&
              cartItem.activity.coreInfo.location.length > 0
            ? typeof cartItem.activity.coreInfo.location[0] === "string"
              ? cartItem.activity.coreInfo.location[0]
              : (cartItem.activity.coreInfo.location[0] as Location)?.name || ""
            : "",
        activity: cartItem.activity,
        searchParams: cartItem.searchParams,
      })
    );

    const totalPassengers = items.reduce(
      (sum, item) =>
        sum +
        item.passengers.adults +
        item.passengers.children +
        item.passengers.infants,
      0
    );

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    return {
      type: "activity",
      items,
      totalPassengers,
      totalPrice,
      requirements: {
        totalRequired: totalPassengers,
        bookings: items.map((item) => ({
          title: item.title,
          passengers:
            item.passengers.adults +
            item.passengers.children +
            item.passengers.infants,
          type: "activity",
        })),
      },
    };
  }

  /**
   * FIXED: Get ferry checkout data from store instance
   */
  private static getFerryCheckoutData(
    ferryStore: FerryStore
  ): UnifiedBookingData {
    // Use current ferry store state instead of booking session
    const selectedFerry = ferryStore.selectedFerry;
    const selectedClass = ferryStore.selectedClass;
    const selectedSeats = ferryStore.selectedSeats;
    const searchParams = ferryStore.searchParams;

    // STREAMLINED: Only adults + infants (children field is deprecated)
    const totalPassengers = searchParams.adults + searchParams.infants;

    // Calculate total price based on passenger types and selected class
    // NOTE: At checkout stage, we don't have actual ages yet, so we conservatively
    // assume all passengers need tickets. The accurate pricing will be recalculated
    // during payment processing when actual passenger ages are available.
    const calculateTotalPrice = (): number => {
      if (!selectedClass) return 0;
      
      // CORRECTED APPROACH: Now that PassengerCounter uses 'infants' field correctly,
      // only the 'infants' field represents passengers <2 years (free)
      // 'children' field is no longer used in ferry search (was confusing)
      const definiteFreePassengers = searchParams.infants; // Only infants are <2 years and free
      const ticketedPassengers = totalPassengers - definiteFreePassengers;
      
      // Use structured pricing (includes base fare + port fees + taxes) instead of legacy price field
      const pricePerPassenger = selectedClass.pricing?.total || selectedClass.price || 0;
      
      console.log('Ferry checkout pricing (streamlined):', {
        totalPassengers,
        searchAdults: searchParams.adults,
        searchInfants: searchParams.infants,
        ticketedPassengers,
        pricePerPassenger,
        hasStructuredPricing: !!selectedClass.pricing,
        pricingBreakdown: selectedClass.pricing ? {
          basePrice: selectedClass.pricing.basePrice,
          fees: selectedClass.pricing.fees,
          taxes: selectedClass.pricing.taxes,
          total: selectedClass.pricing.total
        } : 'Using legacy price field',
        note: 'Only 2 types: Adults (≥2 years) and Infants (<2 years, free)'
      });
      
      // Everyone else pays the same price (no child discount)
      // Use pricing.total to include base fare + port fees + taxes
      return ticketedPassengers * pricePerPassenger;
    };

    const totalPrice = calculateTotalPrice();

    console.log('Ferry pricing calculation:', {
      selectedClassPrice: selectedClass?.price,
      ferryPricing: selectedFerry?.pricing,
      passengers: { adults: searchParams.adults, children: searchParams.children, infants: searchParams.infants },
      calculatedTotalPrice: totalPrice
    });

    // Helper function to create FerryLocation objects
    const createLocation = (locationName: string): FerryLocation => ({
      name: CheckoutAdapter.formatLocationName(locationName),
      code: CheckoutAdapter.getLocationCode(locationName),
    });

    // Use current ferry store state for checkout item
    const item: UnifiedBookingItem = {
      id: selectedFerry?.id || "ferry-temp-id",
      type: "ferry",
      title: `${selectedFerry?.ferryName || "Ferry"} - ${
        selectedFerry?.route?.from?.name || "Port Blair"
      } to ${selectedFerry?.route?.to?.name || "Havelock"}`,
      location: `${CheckoutAdapter.formatLocationName(
        selectedFerry?.route?.from?.name || "Port Blair"
      )} → ${CheckoutAdapter.formatLocationName(
        selectedFerry?.route?.to?.name || "Havelock"
      )}`,
      time: selectedFerry?.schedule?.departureTime || "N/A",
      passengers: {
        adults: searchParams.adults,
        children: 0, // DEPRECATED: Always 0 in streamlined model
        infants: searchParams.infants,
      },
      price: totalPrice,
      date: searchParams.date || new Date().toISOString().split('T')[0],
      // CRITICAL: Add ferryId at item level for payment verification
      ferryId: selectedFerry?.id, // This will be "sealink-68afe5056bbf62f3db17a8c8"
      ferry: selectedFerry
        ? {
            // Core UnifiedFerryResult properties
            id: selectedFerry.id,
            operator: selectedFerry.operator,
            operatorFerryId:
              selectedFerry.operatorFerryId || selectedFerry.id || "",
            ferryName: selectedFerry.ferryName || "Unknown Ferry",
            route: {
              from: createLocation(selectedFerry.route?.from?.name || "Port Blair"),
              to: createLocation(selectedFerry.route?.to?.name || "Havelock"),
              fromCode:
                selectedFerry.route?.fromCode ||
                CheckoutAdapter.getLocationCode(
                  selectedFerry.route?.from?.name || "Port Blair"
                ),
              toCode:
                selectedFerry.route?.toCode ||
                CheckoutAdapter.getLocationCode(selectedFerry.route?.to?.name || "Havelock"),
            },
            schedule: selectedFerry.schedule
              ? {
                  departureTime: selectedFerry.schedule.departureTime,
                  arrivalTime: selectedFerry.schedule.arrivalTime,
                  duration: selectedFerry.schedule.duration,
                  date:
                    selectedFerry.schedule.date ||
                    new Date().toISOString().split('T')[0], // Fallback to today's date
                }
              : {
                  departureTime: "09:00",
                  arrivalTime: "11:30",
                  duration: "2h 30m",
                  date: new Date().toISOString().split('T')[0],
                },
            classes: selectedFerry.classes || [],
            pricing: selectedFerry.pricing || { adult: 0, child: 0, infant: 0 },
            features: selectedFerry.features || {
              hasAC: false,
              hasFood: false,
              hasWifi: false,
              supportsSeatSelection: false,
              supportsAutoAssignment: false,
            },
            operatorData: selectedFerry.operatorData || {
              originalResponse: {},
              bookingEndpoint: "",
            },
            isActive: selectedFerry.isActive ?? true,
            availability: selectedFerry.availability || { available: true, seatsLeft: 0 },
            // Additional properties for backward compatibility
            duration: selectedFerry.schedule?.duration || "2h 30m",
            selectedClass: selectedClass || undefined,
            selectedSeats: selectedSeats.map(seat => seat.number || seat.id || ''),
            fromLocation: CheckoutAdapter.formatLocationName(
              selectedFerry.route?.from?.name || "Port Blair"
            ),
            toLocation: CheckoutAdapter.formatLocationName(
              selectedFerry.route?.to?.name || "Havelock"
            ),
          }
        : undefined,
      selectedClass: selectedClass || undefined, // Change null to undefined
      selectedSeats: selectedSeats.map(seat => seat.number || seat.id || ''),
    };

    return {
      type: "ferry",
      items: [item],
      totalPassengers,
      totalPrice: totalPrice,
      requirements: {
        totalRequired: totalPassengers,
        bookings: [
          {
            title: item.title,
            passengers: totalPassengers,
            type: "ferry",
          },
        ],
      },
    };
  }

  /**
   * Get boat checkout data from store instance (FIXED)
   */
  private static getBoatCheckoutData(boatStore: any): UnifiedBookingData {
    const items: UnifiedBookingItem[] = boatStore.cart.map(
      (cartItem: BoatCartItem) => ({
        id: cartItem.id,
        type: "boat" as const,
        title:
          cartItem.boat.name ||
          `${cartItem.boat.route.from} to ${cartItem.boat.route.to}`,
        passengers: {
          adults: cartItem.searchParams.adults || 0,
          children: 0, // COMMENTED OUT: Children not handled for activities (boat bookings)
          infants: 0, // COMMENTED OUT: Infants not handled for activities (boat bookings)
        },
        price: cartItem.totalPrice,
        date: cartItem.searchParams.date || "",
        time: cartItem.selectedTime || "",
        location: cartItem.boat.route.from || "",
        boat: cartItem.boat,
        boatSearchParams: cartItem.searchParams,
        selectedTime: cartItem.selectedTime,
      })
    );

    const totalPassengers = items.reduce(
      (sum, item) =>
        sum +
        item.passengers.adults +
        item.passengers.children +
        item.passengers.infants,
      0
    );

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    return {
      type: "boat",
      items,
      totalPassengers,
      totalPrice,
      requirements: {
        totalRequired: totalPassengers,
        bookings: items.map((item) => ({
          title: item.title,
          passengers:
            item.passengers.adults +
            item.passengers.children +
            item.passengers.infants,
          type: "boat",
        })),
      },
    };
  }

  /**
   * FIXED: Get mixed checkout data
   */
  private static getMixedCheckoutData(stores: {
    activityStore: ReturnType<typeof useActivityStoreRQ.getState>;
    ferryStore: FerryStore;
    boatStore: any;
  }): UnifiedBookingData {
    // Only get data from stores that have items
    const activityData =
      stores.activityStore.cart.length > 0
        ? CheckoutAdapter.getActivityCheckoutData(stores.activityStore)
        : {
            items: [],
            totalPassengers: 0,
            totalPrice: 0,
            requirements: { totalRequired: 0, bookings: [] },
          };

    const ferryData = stores.ferryStore.selectedFerry
      ? CheckoutAdapter.getFerryCheckoutData(stores.ferryStore)
      : {
          items: [],
          totalPassengers: 0,
          totalPrice: 0,
          requirements: { totalRequired: 0, bookings: [] },
        };

    const boatData =
      stores.boatStore.cart?.length > 0
        ? CheckoutAdapter.getBoatCheckoutData(stores.boatStore)
        : {
            items: [],
            totalPassengers: 0,
            totalPrice: 0,
            requirements: { totalRequired: 0, bookings: [] },
          };

    return {
      type: "mixed",
      items: [...activityData.items, ...ferryData.items, ...boatData.items],
      totalPassengers:
        activityData.totalPassengers +
        ferryData.totalPassengers +
        boatData.totalPassengers,
      totalPrice:
        activityData.totalPrice + ferryData.totalPrice + boatData.totalPrice,
      requirements: {
        totalRequired:
          activityData.totalPassengers +
          ferryData.totalPassengers +
          boatData.totalPassengers,
        bookings: [
          ...activityData.requirements.bookings,
          ...ferryData.requirements.bookings,
          ...boatData.requirements.bookings,
        ],
      },
    };
  }


  /**
   * Format location name for display
   */
  private static formatLocationName(location: string): string {
    const locationMap: Record<string, string> = {
      "port-blair": "Port Blair",
      havelock: "Havelock",
      neil: "Neil Island",
      swaraj: "Havelock",
      shaheed: "Neil Island",
    };
    return locationMap[location.toLowerCase()] || location;
  }

  /**
   * Get location code for API calls
   */
  private static getLocationCode(location: string): string {
    const codeMap: Record<string, string> = {
      "port-blair": "PB",
      havelock: "SW",
      neil: "SH",
      swaraj: "SW",
      shaheed: "SH",
    };
    return codeMap[location.toLowerCase()] || location.toUpperCase();
  }


  /**
   * Calculate accurate pricing based on actual passenger ages
   * Universal pricing rule for ALL booking types:
   * - Infants (<2 years): Free, no seat, no ticket (travel with adult)
   * - Everyone else (≥2 years): Full price, seat required, ticket required
   */
  static calculateAccuratePricing(members: MemberDetails[], basePrice: number): {
    ticketedPassengers: number;
    freePassengers: number;
    totalPrice: number;
    breakdown: { name: string; age: number; price: number; needsTicket: boolean; needsSeat: boolean }[];
  } {
    let ticketedPassengers = 0;
    let freePassengers = 0;
    const breakdown: { name: string; age: number; price: number; needsTicket: boolean; needsSeat: boolean }[] = [];

    members.forEach((member) => {
      const age = Number(member.age) || 0;
      const isInfant = age < 2;
      const price = isInfant ? 0 : basePrice;
      const needsTicket = !isInfant;
      const needsSeat = !isInfant;
      
      if (isInfant) {
        freePassengers++;
      } else {
        ticketedPassengers++;
      }

      breakdown.push({
        name: member.fullName,
        age: age,
        price: price,
        needsTicket,
        needsSeat
      });
    });

    const totalPrice = ticketedPassengers * basePrice;

    console.log('Universal pricing calculation:', {
      basePrice,
      ticketedPassengers,
      freePassengers,
      totalPrice,
      breakdown,
      note: 'Infants (<2 years) are free and travel with adults'
    });

    return {
      ticketedPassengers,
      freePassengers,
      totalPrice,
      breakdown
    };
  }
}

/**
 * FIXED Hook - Now uses proper store instances instead of window objects
 */
export const useCheckoutAdapter = (searchParams: URLSearchParams) => {
  // Get store instances via proper hooks
  const activityStore = useActivityStoreRQ.getState();
  const ferryStore = useFerryStore.getState();
  const boatStore = useBoat();

  try {
    const bookingType = CheckoutAdapter.detectBookingType(searchParams);
    const bookingData = CheckoutAdapter.getUnifiedBookingData(bookingType, {
      activityStore,
      ferryStore,
      boatStore,
    });

    const requirements = CheckoutAdapter.getPassengerRequirements(bookingData);

    return {
      bookingType,
      bookingData,
      requirements,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("CheckoutAdapter error:", error);
    return {
      bookingType: "activity" as BookingType,
      bookingData: null,
      requirements: null,
      isLoading: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
