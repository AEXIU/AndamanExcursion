// src/services/ferryServices/sealinkService.ts
import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";
import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
  SeatLayout,
} from "@/types/FerryBookingSession.types";
import { LocationMappingService } from "./locationMappingService";

interface SealinkTripData {
  id: string;
  tripId: number;
  vesselID: number;
  aTime: { hour: number; minute: number };
  dTime: { hour: number; minute: number };
  from: string;
  to: string;
  pClass: Record<string, SealinkSeat>;
  bClass: Record<string, SealinkSeat>;
  fares: {
    pBaseFare: number;
    bBaseFare: number;
    infantFare: number;
  };
}

interface SealinkSeat {
  isBlocked: number;
  isBooked: number;
  number: string;
  tier: string;
}

interface SealinkApiResponse {
  err: string | null;
  data: SealinkTripData[] | null;
}

interface SealinkBookingRequest {
  id: string;
  tripId: number;
  vesselID: number;
  from: string;
  to: string;
  bookingTS: number;
  paxDetail: {
    email: string;
    phone: string;
    gstin: string;
    pax: Array<{
      name: string;
      age: string;
      gender: string;
      nationality: string;
      photoId: string;
      expiry: string;
      seat: string;
      tier: string;
    }>;
    infantPax: any[];
  };
  userData: {
    apiUser: {
      userName: string;
      agency: string;
      token: string;
      walletBalance: number;
    };
  };
  paymentData: {
    gstin: string;
  };
}

export class SealinkService {
  // Use production URLs and correct credentials
  private static readonly BASE_URL =
    process.env.SEALINK_API_URL || "http://api.dev.gonautika.com:8012/";
  // Use environment variables for credentials
  private static readonly USERNAME = process.env.SEALINK_USERNAME || "";
  private static readonly TOKEN = process.env.SEALINK_TOKEN || "";

  private static readonly tripDataCache = new Map<string, SealinkTripData>();

  /**
   * Validate credentials with more robust checking
   */
  private static validateCredentials(): { username: string; token: string } {
    if (!this.USERNAME || !this.TOKEN) {
      throw new Error(
        "Sealink credentials not found. Please set SEALINK_USERNAME and SEALINK_TOKEN in your .env file"
      );
    }

    console.log("Sealink: Credentials validated");

    return {
      username: this.USERNAME,
      token: this.TOKEN,
    };
  }

  /**
   * Enhanced authentication test with exact Postman format
   */
  private static async testAuthentication(): Promise<boolean> {
    try {
      console.log("Testing Sealink authentication...");

      const { username, token } = this.validateCredentials();

      // Use exact format from Postman getProfile endpoint
      const apiCall = async (): Promise<any> => {
        const response = await FerryApiService.fetchWithTimeout(
          `${this.BASE_URL}getProfile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "AndamanExcursion/1.0",
              Accept: "application/json",
            },
            body: JSON.stringify({
              userName: username,
              token: token,
            }),
          },
          10000 // 10 second timeout for auth test
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check if authentication was successful
        if (data.err) {
          throw new Error(`Auth failed: ${data.err}`);
        }

        return data.data;
      };

      const result = await FerryApiService.callWithRetry(
        apiCall,
        "Sealink-Auth",
        false
      );

      console.log("Sealink authentication successful:", {
        username: result.userName || username,
        walletBalance: result.walletBalance,
      });

      return true;
    } catch (error) {
      console.error("Sealink authentication failed:", error);
      return false;
    }
  }

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    console.log(
      `Sealink Service: Starting search for ${params.from} → ${params.to} on ${params.date}`
    );

    const { username, token } = this.validateCredentials();

    // Check if route is supported
    if (
      !LocationMappingService.isRouteSupported(
        "sealink",
        params.from,
        params.to
      )
    ) {
      console.log(
        `Sealink does not support route: ${params.from} → ${params.to}`
      );
      return [];
    }

    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "sealink");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      console.log(`Sealink: Using cached results for ${cacheKey}`);
      return cached;
    }

    // Format date correctly (dd-mm-yyyy as per Postman)
    const formattedDate = this.formatDateForSealink(params.date);

    const apiCall = async (): Promise<SealinkApiResponse> => {
      // Use proper location mapping for Sealink API
      const fromLocation = LocationMappingService.getSealinkLocation(
        params.from
      );
      const toLocation = LocationMappingService.getSealinkLocation(params.to);

      console.log(`Sealink location mapping:`, {
        originalFrom: params.from,
        mappedFrom: fromLocation,
        originalTo: params.to,
        mappedTo: toLocation,
      });

      const response = await FerryApiService.fetchWithTimeout(
        `${this.BASE_URL}getTripData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "AndamanExcursion/1.0",
            Accept: "application/json",
          },
          body: JSON.stringify({
            date: formattedDate,
            from: fromLocation, // Use mapped location name
            to: toLocation, // Use mapped location name
            userName: username,
            token: token,
          }),
        },
        8000
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    };

    try {
      const result = await FerryApiService.callWithRetry(
        apiCall,
        "Sealink-Search",
        false
      );

      if (result.err) {
        console.error("Sealink search API error:", result.err);
        if (result.err.includes("Token Validation Failed")) {
          throw new Error(
            "Sealink authentication failed. Please check credentials."
          );
        }
        throw new Error(`Sealink search failed: ${result.err}`);
      }

      if (!result.data || !Array.isArray(result.data)) {
        console.log("No trips found for Sealink");
        return [];
      }

      // Cache trip data for later use in booking
      result.data.forEach((trip) => {
        this.tripDataCache.set(trip.id, trip);
      });

      const unifiedResults = result.data.map((trip) =>
        this.transformToUnifiedFormat(trip, params)
      );

      // Cache results
      FerryCache.set(cacheKey, unifiedResults);

      console.log(`Sealink: Found ${unifiedResults.length} trips`);
      return unifiedResults;
    } catch (error) {
      console.error("Sealink search error:", error);
      return [];
    }
  }

  /**
   * Format date in dd-mm-yyyy format as required by Sealink API
   */
  private static formatDateForSealink(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
  }

  private static transformToUnifiedFormat(
    trip: SealinkTripData,
    params: FerrySearchParams
  ): UnifiedFerryResult {
    const pClassSeats = Object.values(trip.pClass || {});
    const bClassSeats = Object.values(trip.bClass || {});

    const pAvailable = pClassSeats.filter(
      (seat) => seat.isBooked === 0 && seat.isBlocked === 0
    ).length;
    const bAvailable = bClassSeats.filter(
      (seat) => seat.isBooked === 0 && seat.isBlocked === 0
    ).length;

    const fuelSurcharge = 550;

    const classes: FerryClass[] = [];

    if (pClassSeats.length > 0) {
      const pTotal = trip.fares.pBaseFare + fuelSurcharge;
      classes.push({
        id: `${trip.id}-premium`,
        name: "Premium",
        price: pTotal,
        availableSeats: pAvailable,
        amenities: ["Air Conditioning", "Comfortable Seating"],
        seatLayout: this.createSeatLayout(pClassSeats, "P"),
        pricing: {
          basePrice: trip.fares.pBaseFare,
          taxes: 0,
          fees: 0,
          fuelSurcharge: fuelSurcharge,
          total: pTotal,
        },
      });
    }

    if (bClassSeats.length > 0) {
      const bTotal = trip.fares.bBaseFare + fuelSurcharge;
      classes.push({
        id: `${trip.id}-business`,
        name: "Business",
        price: bTotal,
        availableSeats: bAvailable,
        amenities: ["Premium Seating", "Air Conditioning", "Priority Boarding"],
        seatLayout: this.createSeatLayout(bClassSeats, "B"),
        pricing: {
          basePrice: trip.fares.bBaseFare,
          taxes: 0,
          fees: 0,
          fuelSurcharge: fuelSurcharge,
          total: bTotal,
        },
      });
    }

    return {
      id: `sealink-${trip.id}`,
      operator: "sealink",
      operatorFerryId: trip.id,
      ferryName: trip.vesselID === 1 ? "Sealink" : "Nautika",
      route: {
        from: { name: trip.from, code: this.getLocationCode(trip.from) },
        to: { name: trip.to, code: this.getLocationCode(trip.to) },
        fromCode: this.getLocationCode(trip.from),
        toCode: this.getLocationCode(trip.to),
      },
      schedule: {
        departureTime: this.formatTime(trip.dTime),
        arrivalTime: this.formatTime(trip.aTime),
        duration: this.calculateDuration(trip.dTime, trip.aTime),
        date: params.date,
      },
      classes,
      availability: {
        totalSeats: pClassSeats.length + bClassSeats.length,
        availableSeats: pAvailable + bAvailable,
        lastUpdated: new Date().toISOString(),
      },
      pricing: {
        baseFare: Math.min(trip.fares.pBaseFare, trip.fares.bBaseFare),
        taxes: 0,
        portFee: 0,
        total: Math.min(trip.fares.pBaseFare, trip.fares.bBaseFare) + fuelSurcharge,
        currency: "INR",
      },
      features: {
        supportsSeatSelection: true,
        supportsAutoAssignment: true,
        hasWiFi: false,
        hasAC: true,
        mealIncluded: false,
      },
      operatorData: {
        originalResponse: {
          ...trip,
          tripId: trip.tripId,
          vesselID: trip.vesselID,
        },
        bookingEndpoint: "bookSeats",
      },
      isActive: true,
    };
  }

  /**
   * CORRECTED: Book seats with exact format from working curl
   */
  static async bookSeats(bookingData: SealinkBookingRequest): Promise<any> {
    try {
      console.log("Sealink: Creating seat booking...", {
        tripId: bookingData.tripId,
        passengers: bookingData.paxDetail.pax.length,
        seats: bookingData.paxDetail.pax.map((p) => p.seat),
      });

      // Test authentication first
      const authOk = await this.testAuthentication();
      if (!authOk) {
        throw new Error(
          "Sealink authentication failed. Please check credentials."
        );
      }

      const { username, token } = this.validateCredentials();

      // CORRECTED: Use exact Sealink API structure as per working curl example
      const bookingToken = token;

      // Separate seats by class for the API
      const pClassSeats: string[] = [];
      const bClassSeats: string[] = [];

      // Validate and separate seats by class
      console.log("Seat validation for Sealink booking:");
      bookingData.paxDetail.pax.forEach((passenger, index) => {
        console.log(
          `  Passenger ${index + 1}: tier=${passenger.tier}, seat=${
            passenger.seat
          }`
        );

        if (
          (passenger.tier === "P" || passenger.tier === "L") &&
          passenger.seat
        ) {
          pClassSeats.push(passenger.seat);
        } else if (
          (passenger.tier === "B" || passenger.tier === "R") &&
          passenger.seat
        ) {
          bClassSeats.push(passenger.seat);
        }
      });

      console.log("Seat arrays prepared:", {
        pClassSeats,
        bClassSeats,
        totalSeats: pClassSeats.length + bClassSeats.length,
        totalPassengers: bookingData.paxDetail.pax.length,
      });

      const requestBody = {
        bookingData: [
          {
            bookingTS: bookingData.bookingTS,
            id: bookingData.id,
            tripId: bookingData.tripId,
            vesselID: bookingData.vesselID,
            from: bookingData.from,
            to: bookingData.to,
            paxDetail: {
              email: bookingData.paxDetail.email,
              phone: bookingData.paxDetail.phone,
              gstin: bookingData.paxDetail.gstin || "",
              pax: bookingData.paxDetail.pax.map((passenger, index) => ({
                id: index + 1,
                name: passenger.name,
                age: passenger.age.toString(),
                gender: passenger.gender, // M/F
                nationality: "India",
                passport: passenger.photoId || "", // Use passport field, not photoId
                tier:
                  passenger.tier === "R"
                    ? "B"
                    : passenger.tier === "L"
                    ? "P"
                    : passenger.tier, // Convert R->B, L->P for API
                seat: passenger.seat || "",
                isCancelled: 0,
              })),
              infantPax: (bookingData.paxDetail.infantPax || []).map(
                (infant, index) => ({
                  id: index + 1,
                  name: infant.name,
                  dobTS: Math.floor(
                    new Date(infant.dob || "2022-01-01").getTime() / 1000
                  ),
                  dob: infant.dob || "2022-01-01",
                  gender: infant.gender || "M",
                  nationality: "India",
                  passport: "",
                  isCancelled: 0,
                })
              ),
              bClassSeats,
              pClassSeats,
            },
            userData: {
              apiUser: {
                userName: username,
                agency: bookingData.userData.apiUser.agency || "",
                token: bookingToken,
                walletBalance: bookingData.userData.apiUser.walletBalance || 0,
              },
            },
            paymentData: {
              gstin: bookingData.paymentData.gstin || "",
            },
          },
        ],
        userName: username,
        token: bookingToken,
      };

      const firstBooking = requestBody.bookingData[0];
      console.log("Sealink booking request (matching API documentation):", {
        isCorrectStructure: !!requestBody.bookingData,
        tripId: firstBooking.tripId,
        vesselID: firstBooking.vesselID,
        passengersCount: firstBooking.paxDetail.pax.length,
        tierFormat: firstBooking.paxDetail.pax.map((p: any) => p.tier),
        seatNumbers: firstBooking.paxDetail.pax.map((p: any) => p.seat),
        nationalityFormat: firstBooking.paxDetail.pax[0]?.nationality,
        from: firstBooking.from,
        to: firstBooking.to,
        hasRootAuth: !!(requestBody.userName && requestBody.token),
        pClassSeats: firstBooking.paxDetail.pClassSeats,
        bClassSeats: firstBooking.paxDetail.bClassSeats,
      });

      console.log("Seat/Tier validation details:", {
        requestedSeats: firstBooking.paxDetail.pax.map(
          (p) => `${p.seat}(${p.tier})`
        ),
        pClassSeatsArray: firstBooking.paxDetail.pClassSeats,
        bClassSeatsArray: firstBooking.paxDetail.bClassSeats,
        totalSeatsRequested: firstBooking.paxDetail.pax.length,
      });



      const response = await this.fetchWithRetry(
        `${this.BASE_URL}bookSeats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/plain", // FIXED: Use text/plain as required by Sealink API
            "User-Agent": "AndamanExcursion/1.0",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        },
        90000 // Keep longer timeout
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Sealink booking HTTP error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 500),
        });
        throw new Error(
          `Sealink booking HTTP error: ${
            response.status
          } - ${errorText.substring(0, 200)}`
        );
      }

      const responseText = await response.text();
      console.log("Sealink booking raw response:", responseText);

      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Sealink booking JSON parse error:", parseError);
        throw new Error(
          `Invalid JSON response: ${responseText.substring(0, 200)}...`
        );
      }

      // Handle array response (as shown in working curl)
      if (Array.isArray(parsedResponse)) {
        const bookingResult = parsedResponse[0];

        if (bookingResult && bookingResult.seatStatus && bookingResult.pnr) {
          console.log("Sealink booking successful:", {
            pnr: bookingResult.pnr,
            seatStatus: bookingResult.seatStatus,
            index: bookingResult.index,
          });

          return {
            seatStatus: bookingResult.seatStatus,
            pnr: bookingResult.pnr,
            index: bookingResult.index || 0,
            requestData: bookingResult.requestData,
          };
        } else if (bookingResult && bookingResult.err) {
          console.error("Sealink booking API error:", bookingResult.err);
          throw new Error(`Sealink booking failed: ${bookingResult.err}`);
        } else if (bookingResult && bookingResult.seatStatus === false) {
          // Handle failed booking with seatStatus: false
          console.error(
            "Sealink booking failed - seats not available:",
            bookingResult
          );

          // Try to extract error details from requestData if available
          let errorMessage = "Seat booking failed";
          let requestedSeats: string[] = [];

          // Try to extract more detailed error information
          if (bookingResult.requestData) {
            try {
              const requestData = JSON.parse(bookingResult.requestData);
              requestedSeats = [
                ...(requestData.paxDetail?.bClassSeats || []),
                ...(requestData.paxDetail?.pClassSeats || []),
              ];

              if (requestedSeats.length > 0) {
                errorMessage = `Seats not available: ${requestedSeats.join(
                  ", "
                )}. These seats may already be booked or do not exist.`;
              } else {
                errorMessage =
                  "No seats were requested or seat selection failed.";
              }

              console.error("Sealink seat booking failure details:", {
                requestedBClassSeats: requestData.paxDetail?.bClassSeats,
                requestedPClassSeats: requestData.paxDetail?.pClassSeats,
                tripId: requestData.tripId,
                vesselID: requestData.vesselID,
                from: requestData.from,
                to: requestData.to,
              });
            } catch (parseError) {
              console.warn(
                "Could not parse requestData for error details:",
                parseError
              );
              errorMessage = "Booking failed - unable to parse error details";
            }
          }

          throw new Error(errorMessage);
        }
      }

      // Handle single object response
      if (parsedResponse.seatStatus && parsedResponse.pnr) {
        return parsedResponse;
      }

      // Handle error response
      if (parsedResponse.err) {
        console.error("Sealink booking API error:", parsedResponse.err);

        // If token validation failed, provide more detailed debugging info
        if (parsedResponse.err.includes("Token Validation Failed")) {
          console.error("Token validation failed. Check SEALINK_TOKEN in .env");

          throw new Error(
            `Sealink token validation failed. Please check your SEALINK_TOKEN in .env file. ` +
              `The token might be expired or invalid for the booking API. ` +
              `Current token length: ${bookingToken.length} characters.`
          );
        }

        throw new Error(`Sealink booking failed: ${parsedResponse.err}`);
      }

      console.error("Unexpected Sealink response format:", parsedResponse);
      throw new Error(
        `Unexpected response format: ${JSON.stringify(parsedResponse)}`
      );
    } catch (error) {
      console.error("Sealink booking API error:", error);

      // Enhanced error handling for timeouts
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new Error(
          "Sealink booking request timed out. This may indicate server issues or network problems. Please try again or contact support."
        );
      }

      throw error;
    }
  }

  /**
   * CRITICAL: Fetch with proper retry logic and timeout handling
   */
  private static async fetchWithRetry(
    url: string,
    options: RequestInit,
    timeout: number = 90000
  ): Promise<Response> {
    const maxRetries = 2;
    let lastError: Error = new Error("Unknown error occurred");

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Sealink fetch attempt ${attempt}/${maxRetries} (timeout: ${timeout}ms)`
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.warn(`Aborting request after ${timeout}ms`);
        }, timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error as Error;

        console.warn(`Sealink fetch attempt ${attempt} failed:`, {
          error: lastError.message,
          isAbortError: lastError.name === "AbortError",
          willRetry:
            attempt < maxRetries && !this.isNonRetryableError(lastError),
        });

        // Don't retry on authentication errors or client errors
        if (this.isNonRetryableError(lastError)) {
          break;
        }

        // Don't retry timeouts to prevent double bookings
        if (lastError.name === "AbortError" && attempt === 1) {
          console.warn("Not retrying timeout to prevent double booking");
          break;
        }

        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(Math.pow(2, attempt) * 1000, 3000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // Transform AbortError to timeout error
    if (lastError.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw lastError;
  }

  /**
   * Check if error should not be retried
   */
  private static isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("invalid credentials") ||
      message.includes("bad request") ||
      message.includes("not found") ||
      message.includes("token validation failed")
    );
  }

  static async getSeatLayout(
    ferryId: string,
    classId: string,
    travelDate: string
  ): Promise<SeatLayout> {
    console.log(
      `SealinkService: Getting seat layout for ferry ${ferryId}, class ${classId}`
    );

    // Extract original trip ID if it has "sealink-" prefix
    const originalTripId = ferryId.startsWith("sealink-")
      ? ferryId.replace("sealink-", "")
      : ferryId;

    console.log(
      `SealinkService: Looking for trip data with ID: ${originalTripId}`
    );
    console.log(
      `SealinkService: Available cached trip IDs:`,
      Array.from(this.tripDataCache.keys())
    );

    const cachedTripData = this.tripDataCache.get(originalTripId);

    if (cachedTripData) {
      console.log(
        `SealinkService: Found cached trip data for ${originalTripId}`
      );
      return this.extractSeatLayoutFromTripData(cachedTripData, classId);
    }

    // If not in cache, try to re-fetch trip data using stored search params
    console.log(
      `SealinkService: Trip data not found in cache for ${originalTripId}`
    );

    // Try to reconstruct search parameters from the ferry ID and travel date
    const searchResult = await this.refetchTripDataForSeatLayout(
      originalTripId,
      travelDate
    );

    if (searchResult) {
      console.log(
        `SealinkService: Successfully re-fetched trip data for ${originalTripId}`
      );
      return this.extractSeatLayoutFromTripData(searchResult, classId);
    }

    throw new Error(
      `Trip data not found for ferry ID: ${ferryId} (original: ${originalTripId}). ` +
        `Unable to re-fetch trip data. This may happen if the trip is no longer available ` +
        `or if the search parameters cannot be reconstructed.`
    );
  }

  /**
   * Re-fetch trip data when cache is empty for seat layout requests
   */
  private static async refetchTripDataForSeatLayout(
    tripId: string,
    travelDate: string
  ): Promise<SealinkTripData | null> {
    try {
      console.log(
        `SealinkService: Attempting to re-fetch trip data for ${tripId} on ${travelDate}`
      );

      const { username, token } = this.validateCredentials();
      const formattedDate = this.formatDateForSealink(travelDate);

      const commonRoutes = [
        { from: "Port Blair", to: "Swaraj Dweep" },
        { from: "Port Blair", to: "Shaheed Dweep" },
        { from: "Swaraj Dweep", to: "Port Blair" },
        { from: "Shaheed Dweep", to: "Port Blair" },
        { from: "Swaraj Dweep", to: "Shaheed Dweep" },
        { from: "Shaheed Dweep", to: "Swaraj Dweep" },
      ];

      for (const route of commonRoutes) {
        try {
          const apiCall = async (): Promise<SealinkApiResponse> => {
            const response = await FerryApiService.fetchWithTimeout(
              `${this.BASE_URL}getTripData`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent": "AndamanExcursion/1.0",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  date: formattedDate,
                  from: route.from,
                  to: route.to,
                  userName: username,
                  token: token,
                }),
              },
              12000
            );

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            return await response.json();
          };

          const result = await FerryApiService.callWithRetry(
            apiCall,
            "Sealink-Refetch",
            false
          );

          if (result.err) {
            continue;
          }

          if (result.data && Array.isArray(result.data)) {
            const targetTrip = result.data.find((trip) => trip.id === tripId);

            if (targetTrip) {
              // Cache all trips from this search
              result.data.forEach((trip) => {
                this.tripDataCache.set(trip.id, trip);
              });

              return targetTrip;
            }
          }
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error(`SealinkService: Error re-fetching trip data:`, error);
      return null;
    }
  }

  private static extractSeatLayoutFromTripData(
    tripData: SealinkTripData,
    classId: string
  ): SeatLayout {
    let seats: any[];
    let tier: string;

    if (classId.includes("premium") || classId.includes("P")) {
      seats = Object.values(tripData.pClass || {});
      tier = "P";
    } else {
      seats = Object.values(tripData.bClass || {});
      tier = "B";
    }

    return this.createSeatLayout(seats, tier);
  }

  private static createSeatLayout(seats: any[], tier: string): SeatLayout {
    return {
      rows: 0, // No longer needed - visual layout determines arrangement
      seatsPerRow: 0, // No longer needed - visual layout determines arrangement
      seats: seats.map((seat) => ({
        id: seat.number,
        number: seat.number,
        seat_numbering: seat.number,
        status:
          seat.isBooked === 1
            ? "booked"
            : seat.isBlocked === 1
            ? "blocked"
            : "available",
        // No seat type assumptions - visual layout will determine this
        tier: tier as "B" | "P",
        // Remove hardcoded position - visual layout will handle positioning
      })),
      // Store original Sealink data for the simplified transformer
      operatorData: {
        sealink: {
          // This will be populated by the calling method with full trip data
          id: "", // Will be set by caller
          tripId: 0, // Will be set by caller
          from: "", // Will be set by caller
          to: "", // Will be set by caller
          dTime: { hour: 0, minute: 0 }, // Will be set by caller
          aTime: { hour: 0, minute: 0 }, // Will be set by caller
          vesselID: 0, // Will be set by caller
          fares: {
            pBaseFare: 0,
            bBaseFare: 0,
            pBaseFarePBHLNL: 0,
            bBaseFarePBHLNL: 0,
            pIslanderFarePBHLNL: 0,
            bIslanderFarePBHLNL: 0,
            infantFare: 0,
          },
          bClass: {},
          pClass: {},
        },
      },
    };
  }

  private static formatTime(time: { hour: number; minute: number }): string {
    return `${time.hour.toString().padStart(2, "0")}:${time.minute
      .toString()
      .padStart(2, "0")}`;
  }

  private static calculateDuration(
    departure: { hour: number; minute: number },
    arrival: { hour: number; minute: number }
  ): string {
    const depMinutes = departure.hour * 60 + departure.minute;
    const arrMinutes = arrival.hour * 60 + arrival.minute;
    const diffMinutes = arrMinutes - depMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  private static getLocationCode(locationName: string): string {
    const codeMap: Record<string, string> = {
      "Port Blair": "PB",
      "Swaraj Dweep": "HL",
      "Shaheed Dweep": "NL",
    };
    return codeMap[locationName] || "??";
  }

  /**
   * Get cached trip data by ID (for booking service)
   */
  static getCachedTripData(tripId: string): SealinkTripData | undefined {
    return this.tripDataCache.get(tripId);
  }

  /**
   * Check if trip data is cached
   */
  static hasCachedTripData(tripId: string): boolean {
    return this.tripDataCache.has(tripId);
  }

  /**
   * Get all cached trip IDs (for debugging)
   */
  static getCachedTripIds(): string[] {
    return Array.from(this.tripDataCache.keys());
  }

  /**
   * Get ticket PDF from Sealink/Nautika API
   * @param pnr The PNR (booking reference) from the booking response
   * @returns Base64-encoded PDF or error
   */
  static async getTicketPDF(pnr: string): Promise<{
    success: boolean;
    pdfBase64?: string;
    error?: string;
  }> {
    try {
      console.log(`Sealink: Fetching PDF for PNR: ${pnr}`);

      const { username, token } = this.validateCredentials();

      const requestBody = {
        pnr: pnr,
        userName: username,
        token: token,
      };

      console.log("Sealink PDF request:", {
        endpoint: `${this.BASE_URL}getPnrPdf`,
        pnr: pnr,
      });

      const response = await this.fetchWithRetry(
        `${this.BASE_URL}getPnrPdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "AndamanExcursion/1.0",
            Accept: "application/json, application/pdf, */*",
          },
          body: JSON.stringify(requestBody),
        },
        30000 // 30 second timeout for PDF generation
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Sealink PDF download failed: ${response.status}`, errorText.substring(0, 200));
        return {
          success: false,
          error: `PDF download failed: ${response.status} - ${errorText.substring(0, 100)}`,
        };
      }

      // Check content type to determine response format
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/pdf")) {
        // Direct PDF response - convert to base64
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        console.log(`Sealink PDF downloaded successfully (${base64.length} chars, direct PDF)`);
        return {
          success: true,
          pdfBase64: base64,
        };
      } else if (contentType.includes("application/json")) {
        // JSON response - may contain base64 PDF or error
        const jsonResponse = await response.json();

        if (jsonResponse.err) {
          console.error("Sealink PDF API error:", jsonResponse.err);
          return {
            success: false,
            error: `Sealink PDF API error: ${jsonResponse.err}`,
          };
        }

        // Check for base64 PDF in response
        if (jsonResponse.pdf || jsonResponse.pdfBase64 || jsonResponse.data) {
          const pdfData = jsonResponse.pdf || jsonResponse.pdfBase64 || jsonResponse.data;
          console.log(`Sealink PDF downloaded successfully (${pdfData.length} chars, JSON response)`);
          return {
            success: true,
            pdfBase64: pdfData,
          };
        }

        console.warn("Sealink PDF response has no PDF data:", Object.keys(jsonResponse));
        return {
          success: false,
          error: "No PDF data in response",
        };
      } else {
        // Unknown content type - try to read as text/base64 or JSON
        const textResponse = await response.text();

        // Check if it looks like base64 PDF (starts with PDF magic bytes in base64)
        if (textResponse.startsWith("JVBERi")) {
          console.log(`Sealink PDF downloaded successfully (${textResponse.length} chars, text response)`);
          return {
            success: true,
            pdfBase64: textResponse,
          };
        }

        // Check if it's JSON response with text/plain content type (common API quirk)
        if (textResponse.startsWith("{") || textResponse.startsWith("[")) {
          try {
            const jsonResponse = JSON.parse(textResponse);

            // Check for error in JSON
            if (jsonResponse.err || jsonResponse.error) {
              console.error("Sealink PDF API error (JSON in text/plain):", jsonResponse.err || jsonResponse.error);
              return {
                success: false,
                error: `Sealink PDF API error: ${jsonResponse.err || jsonResponse.error}`,
              };
            }

            // Check for PDF data in various formats
            const pdfData = jsonResponse.pdf || jsonResponse.pdfBase64 || jsonResponse.data || jsonResponse.pdfData;
            if (pdfData && typeof pdfData === "string" && pdfData.length > 100) {
              console.log(`Sealink PDF downloaded successfully (${pdfData.length} chars, JSON in text/plain)`);
              return {
                success: true,
                pdfBase64: pdfData,
              };
            }

            // If the response is echoing back the request (pnr, userName, token), the API endpoint may not support PDF
            if (jsonResponse.pnr && jsonResponse.userName && jsonResponse.token) {
              console.warn("Sealink PDF API appears to be echoing request - endpoint may not be implemented");
              console.warn("Response keys:", Object.keys(jsonResponse));
              return {
                success: false,
                error: "Sealink PDF endpoint not available (request echoed back). Contact Sealink support.",
              };
            }

            console.warn("Sealink PDF response has no PDF data:", Object.keys(jsonResponse));
            return {
              success: false,
              error: "No PDF data in response",
            };
          } catch (parseError) {
            // Not valid JSON, continue to other checks
            console.warn("Failed to parse as JSON:", parseError);
          }
        }

        // Check if it's raw base64 (long string without JSON structure)
        if (textResponse.length > 1000 && !textResponse.includes("{")) {
          console.log(`Sealink PDF downloaded successfully (${textResponse.length} chars, raw base64)`);
          return {
            success: true,
            pdfBase64: textResponse,
          };
        }

        console.warn("Sealink PDF unknown response format:", textResponse.substring(0, 200));
        return {
          success: false,
          error: `Unknown response format: ${contentType}. Response preview: ${textResponse.substring(0, 100)}`,
        };
      }
    } catch (error) {
      console.error("Sealink PDF download error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
