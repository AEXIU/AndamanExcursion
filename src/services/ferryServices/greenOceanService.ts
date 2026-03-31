import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
  SeatLayout,
} from "@/types/FerryBookingSession.types";
import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";
import { LocationMappingService } from "./locationMappingService";
import * as crypto from "crypto";

interface GreenOceanRouteData {
  departure: string;
  arraival: string; // Note: API has typo "arraival" instead of "arrival"
  arrival?: string; // Optional fallback in case they fix the typo
  ferry_name: string;
  ferry_id: number;
  class_name: string;
  class_id: number;
  route_id: number;
  seat_available: number;
  adult_seat_rate: number;
  infant_seat_rate: number;
  port_fee: number;
  port_fee_infant: number;
  port_fee_status: number;
  is_port_fee_included: number;
  gst_status: number;
  cgst: number;
  ugst: number;
}

interface GreenOceanRouteResponse {
  status: string;
  message: string;
  data: Record<string, GreenOceanRouteData[]>;
}

interface GreenOceanSeat {
  seat_no: string;
  seat_numbering: string;
  status: "available" | "booked";
}

interface GreenOceanSeatLayoutResponse {
  status: string;
  message: string;
  data: {
    layout: GreenOceanSeat[];
  };
}

export class GreenOceanService {
  private static readonly BASE_URL =
    process.env.GREEN_OCEAN_API_URL ||
    "https://tickets.greenoceanseaways.com/test-v-1.0-api/";
  private static readonly PUBLIC_KEY = process.env.GREEN_OCEAN_PUBLIC_KEY;
  private static readonly PRIVATE_KEY = process.env.GREEN_OCEAN_PRIVATE_KEY;

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Check if route is supported
    if (
      !LocationMappingService.isRouteSupported(
        "greenocean",
        params.from,
        params.to
      )
    ) {
      console.log(
        `Green Ocean does not support route: ${params.from} → ${params.to}`
      );
      return [];
    }

    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "greenocean");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const apiCall = async (): Promise<GreenOceanRouteResponse> => {
      // Use centralized location mapping
      const fromId = LocationMappingService.getGreenOceanLocation(params.from);
      const toId = LocationMappingService.getGreenOceanLocation(params.to);
      const travelDate = this.formatDate(params.date);

      // Create request data object first
      const requestData = {
        from_id: fromId,
        dest_to: toId,
        number_of_adults: params.adults,
        number_of_infants: params.infants,
        travel_date: travelDate,
        public_key: this.PUBLIC_KEY,
      };

      // Generate hash according to Green Ocean documentation
      const hashString = this.generateHash(requestData);


      // Add hash to request data
      const requestBody = {
        ...requestData,
        hash_string: hashString,
      };

      console.log(`Green Ocean: Searching route ${params.from} → ${params.to}`);

      const response = await fetch(`${this.BASE_URL}v1/route-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`Green Ocean response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Green Ocean error response:`, errorText);
        throw new Error(
          `Green Ocean API error: ${response.status} - ${errorText}`
        );
      }

      const responseText = await response.text();
      console.log(`Green Ocean response received`);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Green Ocean JSON parse error:`, parseError);
        throw new Error(
          `Green Ocean API returned invalid JSON: ${responseText.substring(
            0,
            100
          )}...`
        );
      }
    };

    try {
      const response = await FerryApiService.callWithRetry(
        apiCall,
        "GreenOcean"
      );

      if (response.status !== "success") {
        throw new Error(`Green Ocean API error: ${response.message}`);
      }

      const results = await this.transformToUnified(response.data, params);
      console.log(
        `Green Ocean found routes, transformed to ${results.length} unified results`
      );

      // Cache results
      FerryCache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error("Error searching Green Ocean:", error);
      throw error;
    }
  }

  static async getSeatLayout(
    routeId: number,
    ferryId: number,
    classId: number,
    travelDate: string,
    forceRefresh: boolean = false
  ): Promise<SeatLayout> {
    const apiCall = async (): Promise<GreenOceanSeatLayoutResponse> => {
      // Format travel date for the API
      const formattedDate = this.formatDate(travelDate);

      // Get location IDs for the hash (you might need to pass these as parameters)
      const fromId = 1; // You'll need to get this from the route context
      const toId = 2; // You'll need to get this from the route context

      const requestData = {
        from_id: fromId,
        dest_to: toId,
        ship_id: ferryId, // Note: API expects ship_id in request body
        ferry_id: ferryId, // But we use ferry_id for hash generation
        route_id: routeId,
        class_id: classId,
        travel_date: formattedDate,
        public_key: this.PUBLIC_KEY,
        bootstrap_css: true,
        html_response: false,
      };

      const hashString = this.generateSeatLayoutHash(requestData);

      const requestBody = {
        from_id: requestData.from_id,
        dest_to: requestData.dest_to,
        ship_id: requestData.ship_id, // Use ship_id in the actual request
        route_id: requestData.route_id,
        class_id: requestData.class_id,
        travel_date: requestData.travel_date,
        public_key: requestData.public_key,
        bootstrap_css: requestData.bootstrap_css,
        html_response: requestData.html_response,
        hash_string: hashString,
      };

      // Fixed: Add v1/ prefix to the endpoint
      const response = await fetch(`${this.BASE_URL}v1/seat-layout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Green Ocean seat layout error response:`, errorText);
        throw new Error(
          `Green Ocean seat layout API error: ${response.status} - ${errorText}`
        );
      }

      return response.json();
    };

    const response = await FerryApiService.callWithRetry(
      apiCall,
      "GreenOcean-SeatLayout"
    );

    // If force refresh, bypass any internal caching
    if (forceRefresh) {
      console.log("🔄 Force refresh requested for seat layout");
    }

    if (response.status !== "success") {
      throw new Error(`Green Ocean seat layout error: ${response.message}`);
    }

    return this.transformSeatLayout(response.data.layout);
  }

  // Updated: Hash generation matching API documentation exactly
  private static generateHash(requestData: any): string {
    // Hash sequence as per Green Ocean documentation
    const hashSequence =
      "from_id|dest_to|number_of_adults|number_of_infants|travel_date|public_key";
    const sequenceArray = hashSequence.split("|");

    let hashString = "";

    // Build hash string according to exact sequence with proper pipe separators
    sequenceArray.forEach((key) => {
      const value = requestData[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          hashString += value.join(",");
        } else {
          hashString += value.toString();
        }
      }
      // Add pipe separator after each element
      hashString += "|";
    });

    // Add private key at the end (no additional pipe needed)
    hashString += this.PRIVATE_KEY;



    // Create SHA512 hash and convert to lowercase
    const hash = crypto.createHash("sha512");
    hash.update(hashString, "utf-8");
    const generatedHash = hash.digest("hex").toLowerCase();


    return generatedHash;
  }

  private static async transformToUnified(
    data: Record<string, GreenOceanRouteData[]>,
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    const results: UnifiedFerryResult[] = [];

    for (const [routeId, routes] of Object.entries(data)) {
      // Group routes by ferry and departure time
      const ferryGroups = new Map<string, GreenOceanRouteData[]>();

      routes.forEach((route) => {
        const key = `${route.ferry_id}-${route.departure}`;
        if (!ferryGroups.has(key)) {
          ferryGroups.set(key, []);
        }
        ferryGroups.get(key)!.push(route);
      });

      for (const [ferryKey, ferryRoutes] of ferryGroups) {
        const primaryRoute = ferryRoutes[0];

        // Create classes from the different class types for this ferry
        const classes: FerryClass[] = [];
        let totalAvailableSeats = 0;

        for (const route of ferryRoutes) {
          // Note: Seat layout will be fetched on-demand during booking phase
          // This improves search performance significantly
          let seatLayout: SeatLayout | undefined;

          const baseFare = route.adult_seat_rate;
          const portFee = route.port_fee_status ? route.port_fee : 0;
          const totalPrice = baseFare + portFee;

          classes.push({
            id: route.class_id.toString(),
            name: route.class_name,
            price: totalPrice, // Legacy field - total price for backward compatibility
            availableSeats: route.seat_available,
            amenities: this.getAmenitiesForClass(route.class_name),
            seatLayout,
            pricing: {
              basePrice: baseFare, // Base fare without port fee
              taxes: 0,
              fees: portFee, // Port fee
              total: totalPrice, // Total including all fees
            },
          });

          totalAvailableSeats += route.seat_available;
        }

        const minPrice = Math.min(...classes.map((c) => c.price));
        const primaryClass = classes[0];

        results.push({
          id: `greenocean-${routeId}-${primaryRoute.ferry_id}`,
          operator: "greenocean" as const,
          operatorFerryId: primaryRoute.ferry_id.toString(),
          ferryName: primaryRoute.ferry_name,
          route: {
            from: {
              name: LocationMappingService.getDisplayName(params.from),
              code: LocationMappingService.getPortCode(params.from),
            },
            to: {
              name: LocationMappingService.getDisplayName(params.to),
              code: LocationMappingService.getPortCode(params.to),
            },
            fromCode: LocationMappingService.getPortCode(params.from),
            toCode: LocationMappingService.getPortCode(params.to),
          },
          schedule: {
            departureTime: this.formatTime(primaryRoute.departure),
            // Handle the API typo: "arraival" instead of "arrival"
            arrivalTime: this.formatTime(
              primaryRoute.arraival || primaryRoute.arrival || ""
            ),
            duration: this.calculateDuration(
              primaryRoute.departure,
              primaryRoute.arraival || primaryRoute.arrival || ""
            ),
            date: params.date,
          },
          classes,
          availability: {
            totalSeats: totalAvailableSeats,
            availableSeats: totalAvailableSeats,
            lastUpdated: new Date().toISOString(),
          },
          pricing: {
            baseFare: primaryRoute.adult_seat_rate,
            taxes: 0, // Green Ocean doesn't seem to have separate taxes
            portFee: primaryRoute.port_fee_status ? primaryRoute.port_fee : 0,
            total: minPrice,
            currency: "INR" as const,
          },
          features: {
            supportsSeatSelection: true,
            supportsAutoAssignment: false,
            hasAC: true,
          },
          operatorData: {
            originalResponse: { routeId, routes: ferryRoutes },
            bookingEndpoint: `${this.BASE_URL}v1/book-ticket`,
          },
          isActive: true,
        });
      }
    }

    return results;
  }

  private static transformSeatLayout(seats: GreenOceanSeat[]): SeatLayout {
    // Estimate rows based on seat numbering (assuming seats are numbered systematically)
    const maxSeatNumber = Math.max(
      ...seats.map((s) => parseInt(s.seat_no) || 0)
    );
    const estimatedRows = Math.ceil(maxSeatNumber / 4); // Assume 4 seats per row

    return {
      rows: estimatedRows,
      seatsPerRow: 4,
      seats: seats.map((seat, index) => ({
        id: seat.seat_no,
        number: seat.seat_numbering,
        seat_numbering: seat.seat_numbering,
        status: seat.status === "booked" ? "booked" : "available",
        type: this.determineSeatType(seat.seat_numbering),
        position: {
          row: Math.floor(index / 4) + 1,
          column: (index % 4) + 1,
        },
      })),
    };
  }

  private static determineSeatType(
    seatNumber: string
  ): "window" | "aisle" | "middle" {
    // Simple heuristic based on seat numbering pattern
    const lastChar = seatNumber.charAt(seatNumber.length - 1).toUpperCase();
    if (lastChar === "A" || lastChar === "F") return "window";
    if (lastChar === "C" || lastChar === "D") return "aisle";
    return "middle";
  }

  private static getAmenitiesForClass(className: string): string[] {
    const baseAmenities = ["AC"];

    if (className.toLowerCase().includes("economy")) {
      return [...baseAmenities, "Basic Seating"];
    }

    if (className.toLowerCase().includes("premium")) {
      return [...baseAmenities, "Comfortable Seating", "More Legroom"];
    }

    if (className.toLowerCase().includes("royal")) {
      return [
        ...baseAmenities,
        "Premium Seating",
        "Priority Boarding",
        "Refreshments",
      ];
    }

    return baseAmenities;
  }

  private static generateSeatLayoutHash(requestData: any): string {
    // Hash sequence as per PHP example for seat layout
    const hashSequence =
      "from_id|dest_to|ship_id|route_id|class_id|travel_date|public_key";
    const sequenceArray = hashSequence.split("|");

    let hashString = "";

    sequenceArray.forEach((key) => {
      const value = requestData[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          hashString += value.join(",");
        } else {
          hashString += value.toString();
        }
      }
      hashString += "|";
    });

    hashString += this.PRIVATE_KEY;



    const hash = crypto.createHash("sha512");
    hash.update(hashString, "utf-8");
    return hash.digest("hex").toLowerCase();
  }

  private static formatDate(isoDate: string): string {
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  }

  private static formatTime(time: string): string {
    // Handle the typo in API response: "arraival" instead of "arrival"
    if (!time || typeof time !== "string") {
      console.warn("Invalid time format received:", time);
      return "00:00";
    }

    // Convert "06:30 AM" to "06:30"
    const [timePart, period] = time.split(" ");
    if (!timePart || !period) {
      console.warn("Invalid time format:", time);
      return "00:00";
    }

    const [hours, minutes] = timePart.split(":");
    if (!hours || !minutes) {
      console.warn("Invalid time parts:", timePart);
      return "00:00";
    }

    let hour = parseInt(hours);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  }

  private static calculateDuration(departure: string, arrival: string): string {
    const depTime = this.formatTime(departure);
    const arrTime = this.formatTime(arrival);

    const depDate = new Date(`2000-01-01T${depTime}:00`);
    const arrDate = new Date(`2000-01-01T${arrTime}:00`);

    const diffMs = arrDate.getTime() - depDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  // Update for GreenOceanService.bookTicket method
  /**
   * Book ticket using Green Ocean API with enhanced error handling and timeout management
   */
  async bookTicket(bookingData: {
    ship_id: number;
    from_id: number;
    dest_to: number;
    route_id: number;
    class_id: number;
    number_of_adults: number;
    number_of_infants: number;
    travel_date: string; // DD-MM-YYYY format
    seat_id: number[];
    passenger_prefix: string[];
    passenger_name: string[];
    passenger_age: string[];
    gender: string[];
    nationality: string[];
    passport_numb: string[];
    passport_expairy: string[]; // Note: API has typo
    country: string[];
    infant_prefix: string[];
    infant_name: string[];
    infant_age: string[];
    infant_gender: string[];
    public_key: string;
    hash_string?: string; // Optional - will be generated if not provided
  }): Promise<any> {
    try {
      console.log("🎫 Green Ocean: Creating ticket booking...", {
        ship_id: bookingData.ship_id,
        passengers: bookingData.number_of_adults,
        infants: bookingData.number_of_infants,
        seats: bookingData.seat_id,
        travel_date: bookingData.travel_date,
      });

      // Generate hash if not provided
      const hashSequence =
        "ship_id|from_id|dest_to|route_id|class_id|number_of_adults|number_of_infants|travel_date|seat_id|public_key";
      const hashString = this.generateBookingHash(bookingData, hashSequence);

      const requestData = {
        ...bookingData,
        hash_string: hashString,
      };

      console.log("🔐 Green Ocean booking: hash generated");

      // Use the enhanced booking API call with longer timeout
      const response = await FerryApiService.callBookingApi(async () => {
        const apiUrl = `${GreenOceanService.BASE_URL}v1/book-ticket`;


        // Use the enhanced fetch with timeout
        const apiResponse = await FerryApiService.fetchWithTimeout(
          apiUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": "Ferry-Booking-System/1.0",
            },
            body: JSON.stringify(requestData),
          },
          30000 // 30 second timeout for booking operations
        );

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          console.error(`Green Ocean API HTTP Error:`, {
            status: apiResponse.status,
            statusText: apiResponse.statusText,
            response: errorText,
          });
          throw new Error(
            `HTTP ${apiResponse.status}: ${apiResponse.statusText} - ${errorText}`
          );
        }

        const responseText = await apiResponse.text();
        console.log(`Green Ocean booking response received`);

        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error(`Green Ocean JSON parse error:`, parseError);
          throw new Error(
            `Invalid JSON response: ${responseText.substring(0, 100)}`
          );
        }
      }, "GreenOcean-BookTicket");

      console.log("🔍 Green Ocean API Response:", {
        status: response?.status,
        message: response?.message,
        pnr: response?.pnr,
        hasPdf: !!response?.pdf_base64,
        pdfLength: response?.pdf_base64?.length || 0,
      });

      if (response?.status === "success" && response?.pnr) {
        console.log("✅ Green Ocean booking successful:", {
          pnr: response.pnr,
          totalAmount: response.total_amount,
          ferryId: response.ferry_id,
          hasPdf: !!response.pdf_base64,
          pdfLength: response.pdf_base64?.length || 0,
        });

        return {
          status: "success",
          pnr: response.pnr,
          total_amount: response.total_amount,
          total_commission: response.total_commission,
          adult_no: response.adult_no,
          infant_no: response.infant_no,
          ferry_id: response.ferry_id,
          travel_date: response.travel_date,
          message: response.message,
          data: response.data,
          pdf_base64: response.pdf_base64, // ✅ CRITICAL FIX: Include PDF in return!
        };
      } else {
        // Handle various error scenarios
        console.error("❌ Green Ocean booking failed:", {
          status: response?.status,
          message: response?.message,
          errorlist: response?.errorlist,
        });

        let errorMessage = "Green Ocean booking failed";

        if (response?.message) {
          errorMessage = response.message;
        } else if (response?.errorlist?.input) {
          errorMessage = Array.isArray(response.errorlist.input)
            ? response.errorlist.input.join(", ")
            : response.errorlist.input;
        } else if (response?.errorlist) {
          errorMessage = JSON.stringify(response.errorlist);
        }

        return {
          status: "failed",
          message: errorMessage,
          errorlist: response?.errorlist || [],
          originalResponse: response,
        };
      }
    } catch (error) {
      console.error("🚨 Green Ocean booking error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
        isTimeout: error instanceof Error && error.message.includes("timeout"),
      });

      // Provide more specific error messages
      let errorMessage = "Green Ocean booking failed";

      if (error instanceof Error && error.message.includes("timeout")) {
        errorMessage =
          "Green Ocean booking timed out. The booking may still be processing. Please check your booking status or contact support.";
      } else if (error instanceof Error && error.message.includes("network")) {
        errorMessage =
          "Network error occurred while booking. Please try again.";
      } else if (error instanceof Error && error.message.includes("JSON")) {
        errorMessage =
          "Invalid response from Green Ocean API. Please try again.";
      } else {
        errorMessage = error instanceof Error ? error.message : "Unknown error";
      }

      return {
        status: "failed",
        message: errorMessage,
        error: error,
        isTimeout: error instanceof Error && error.message.includes("timeout"),
        isNetworkError:
          error instanceof Error && error.message.includes("network"),
      };
    }
  }

  /**
   * Generate booking hash for Green Ocean API - Enhanced version with better debugging
   */
  private generateBookingHash(requestData: any, hashSequence: string): string {
    const keys = hashSequence.split("|");
    let hashString = "";



    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let value = "";

      if (key === "seat_id") {
        // Handle seat_id array - join with commas
        value =
          Array.isArray(requestData[key]) && requestData[key].length > 0
            ? requestData[key].join(",")
            : "";
      } else {
        // Handle zero values properly (critical fix)
        const rawValue = requestData[key];

        if (rawValue === 0 || rawValue === "0") {
          value = "0"; // Explicitly convert zero to string "0"
        } else if (
          rawValue === null ||
          rawValue === undefined ||
          rawValue === ""
        ) {
          value = ""; // Keep null/undefined/empty as empty string
        } else {
          value = String(rawValue); // Convert everything else to string
        }
      }

      hashString += value;
      hashString += "|";


    }

    // Add private key at the end
    hashString += GreenOceanService.PRIVATE_KEY;



    // Use SHA-512 as specified in the API documentation
    const crypto = require("crypto");
    const hash = crypto
      .createHash("sha512")
      .update(hashString, "utf8")
      .digest("hex")
      .toLowerCase();


    return hash;
  }
}
