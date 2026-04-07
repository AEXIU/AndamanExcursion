import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";
import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
  SeatLayout,
} from "@/types/FerryBookingSession.types";
import { LocationMappingService } from "./locationMappingService";

interface MakruzzLoginResponse {
  data: {
    token: string;
    agent_data: {
      agent_name: string;
      business_name: string;
      business_email: string;
      agent_contact: string;
    };
  };
  msg: string;
  code: string;
}

interface MakruzzScheduleData {
  id: string;
  source_location_id: string;
  destination_location_id: string;
  departure_time: string;
  arrival_time: string;
  from_date: string;
  to_date: string;
  ship_title: string;
  ship_class_title: string;
  ship_class_id: string; // ✅ ADD: Missing field for class ID
  total_seat: string;
  ship_class_price: string;
  seat: number;
  "cgst%": number;
  cgst_amount: number;
  "ugst%": number;
  ugst_amount: number;
  psf: number;
  commision: string;
  fuel_surcharge?: number | string;
}

interface MakruzzScheduleResponse {
  data: MakruzzScheduleData[];
  msg: string;
  code: string;
}

interface MakruzzBookingResponse {
  data: {
    booking_id: number;
    schedule_id: string;
    class_id: string;
    travel_date: string;
  };
  msg: string;
  code: string;
}

interface MakruzzConfirmResponse {
  data: {
    pnr: string;
  };
  msg: string;
  code: string;
}

export class MakruzzService {
  private static readonly BASE_URL =
    process.env.MAKRUZZ_API_URL || "https://staging.makruzz.com/booking_api/";
  private static readonly USERNAME = process.env.MAKRUZZ_USERNAME;
  private static readonly PASSWORD = process.env.MAKRUZZ_PASSWORD;
  private static authToken: string | null = null;
  private static tokenExpiry: Date | null = null;

  /**
   * Get seat layout from Makruzz API
   */
  static async getSeatLayout(
    scheduleId: string,
    classId: string,
    travelDate: string
  ): Promise<SeatLayout> {
    await this.ensureAuthenticated();

    console.log(`🪑 Makruzz: Fetching seat layout for schedule ${scheduleId}, class ${classId}`);

    const requestBody = {
      data: {
        schedule_id: scheduleId,
        class_id: classId,
        travel_date: travelDate,
      },
    };

    const response = await fetch(`${this.BASE_URL}get_seats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Mak_Authorization: this.authToken || "",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Makruzz seat layout error:`, errorText);
      throw new Error(`Makruzz seat layout API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`✅ Makruzz seat layout: ${responseData.data?.length || 0} seats`);

    if (responseData.code !== "200") {
      throw new Error(`Makruzz seat layout error: ${responseData.msg}`);
    }

    // Transform to unified SeatLayout format
    const seats = (responseData.data || []).map((seat: any) => ({
      id: seat.seat_id,
      number: seat.seat_id,
      displayNumber: seat.seat_id,
      status: seat.status === "booked" ? "booked" : "available",
    }));

    return {
      rows: 0,
      seatsPerRow: 0,
      seats,
      operatorData: {
        makruzz: {
          seats: responseData.data || [],
        },
      },
    };
  }

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    console.log(
      `🚢 Makruzz Service: Starting search for ${params.from} → ${params.to} on ${params.date}`
    );

    // Check if route is supported
    if (
      !LocationMappingService.isRouteSupported(
        "makruzz",
        params.from,
        params.to
      )
    ) {
      console.log(
        `❌ Makruzz does not support route: ${params.from} → ${params.to}`
      );
      return [];
    }

    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "makruzz");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      console.log(`📦 Makruzz: Using cached results for ${cacheKey}`);
      return cached;
    }

    // Ensure we're authenticated
    await this.ensureAuthenticated();
    console.log(`🔑 Makruzz: Token status: ${this.authToken ? "valid" : "missing"}`);

    const apiCall = async (): Promise<MakruzzScheduleResponse> => {
      // Use centralized location mapping
      const fromLocationId = LocationMappingService.getMakruzzLocation(
        params.from
      );
      const toLocationId = LocationMappingService.getMakruzzLocation(params.to);

      const requestBody = {
        data: {
          trip_type: "single_trip",
          from_location: fromLocationId,
          to_location: toLocationId,
          travel_date: params.date, // Already in YYYY-MM-DD format
          no_of_passenger: (params.adults + params.children).toString(),
        },
      };

      console.log(`🔗 Makruzz API URL: ${this.BASE_URL}schedule_search`);
      console.log(`📝 Makruzz request body:`, requestBody);

      const response = await fetch(`${this.BASE_URL}schedule_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Mak_Authorization: this.authToken || "",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📊 Makruzz response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Makruzz error response:`, errorText);
        throw new Error(`Makruzz API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log(`📨 Makruzz response received`);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ Makruzz JSON parse error:`, parseError);
        throw new Error(
          `Makruzz API returned invalid JSON: ${responseText.substring(
            0,
            100
          )}...`
        );
      }
    };

    try {
      const response = await FerryApiService.callWithRetry(apiCall, "Makruzz");

      if (response.code !== "200") {
        console.error(`❌ Makruzz API error: ${response.msg}`);
        throw new Error(`Makruzz API error: ${response.msg}`);
      }

      console.log(
        `✅ Makruzz API success: Found ${response.data?.length || 0} schedules`
      );
      const results = this.transformToUnified(response.data, params);
      console.log(
        `🔄 Makruzz transformation: ${response.data.length} schedules → ${results.length} unified results`
      );

      // Cache results
      FerryCache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error("💥 Error searching Makruzz:", error);
      throw error;
    }
  }

  static async ensureAuthenticated(): Promise<void> {
    // Check if token is still valid (assuming 1 hour validity)
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }

    console.log("🔐 Makruzz: Authenticating...");

    if (!this.USERNAME || !this.PASSWORD) {
      throw new Error("Makruzz credentials not configured");
    }

    const loginBody = {
      data: {
        username: this.USERNAME,
        password: this.PASSWORD,
      },
    };

    console.log(`📝 Makruzz login request: username=${this.USERNAME ? "set" : "missing"}`);

    const response = await fetch(`${this.BASE_URL}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Makruzz login error:`, errorText);
      throw new Error(
        `Makruzz login failed: ${response.status} - ${errorText}`
      );
    }

    const loginResponse: MakruzzLoginResponse = await response.json();
    console.log(`📨 Makruzz login response: code=${loginResponse.code}`);

    if (loginResponse.code !== "200") {
      throw new Error(`Makruzz login failed: ${loginResponse.msg}`);
    }

    this.authToken = loginResponse.data.token;
    this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    console.log(`✅ Makruzz authentication successful`);
  }

  private static transformToUnified(
    data: MakruzzScheduleData[],
    params: FerrySearchParams
  ): UnifiedFerryResult[] {
    console.log("🚢 Starting Makruzz transformation with class consolidation");
    console.log(`   Raw schedules: ${data.length}`);

    // Group schedules by vessel and departure time
    const groupedSchedules = new Map<string, MakruzzScheduleData[]>();

    data.forEach((schedule) => {
      // Create a unique key for vessel + departure time
      const groupKey = `${schedule.id}-${schedule.departure_time}-${schedule.ship_title}`;

      if (!groupedSchedules.has(groupKey)) {
        groupedSchedules.set(groupKey, []);
      }
      groupedSchedules.get(groupKey)!.push(schedule);
    });

    console.log(
      `   Grouped into ${groupedSchedules.size} unique vessels/times`
    );

    const results: UnifiedFerryResult[] = [];

    // Process each group (vessel + departure time)
    groupedSchedules.forEach((schedules, groupKey) => {
      // Use the first schedule for common data
      const primarySchedule = schedules[0];

      console.log(
        `🚢 Processing group: ${primarySchedule.ship_title} at ${primarySchedule.departure_time}`
      );
      console.log(`   Classes in group: ${schedules.length}`);

      // Create unified ferry ID
      const ferryId = `makruzz-${primarySchedule.id
        }-${primarySchedule.ship_title.toLowerCase().replace(/\s+/g, "")}-${params.date
        }`;

      // Calculate duration (same for all classes in group)
      const [depHour, depMin] = primarySchedule.departure_time
        .split(":")
        .map(Number);
      const [arrHour, arrMin] = primarySchedule.arrival_time
        .split(":")
        .map(Number);
      const depMinutes = depHour * 60 + depMin;
      const arrMinutes = arrHour * 60 + arrMin;
      const durationMinutes = arrMinutes - depMinutes;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const duration = `${hours}h ${minutes}m`;

      // Consolidate all classes from the group
      const classes: FerryClass[] = schedules.map((schedule) => {
        const baseFare = parseFloat(schedule.ship_class_price);
        const cgstAmount = schedule.cgst_amount || 0;
        const ugstAmount = schedule.ugst_amount || 0;
        const psfAmount = schedule.psf || 0;
        const fuelSurchargeAmount = schedule.fuel_surcharge ? parseFloat(schedule.fuel_surcharge.toString()) : 300;
        const totalPrice = baseFare + cgstAmount + ugstAmount + psfAmount + fuelSurchargeAmount;

        console.log(
          `   Class: ${schedule.ship_class_title} - ₹${totalPrice} (${schedule.seat} seats)`
        );

        return {
          id: schedule.ship_class_id.toString(),
          name: schedule.ship_class_title,
          price: totalPrice,
          availableSeats: schedule.seat,
          amenities: this.getClassAmenities(schedule.ship_class_title),
          pricing: {
            basePrice: baseFare,
            taxes: cgstAmount + ugstAmount,
            fees: psfAmount,
            fuelSurcharge: fuelSurchargeAmount,
            total: totalPrice,
          },
        };
      });

      // Sort classes by price (ascending)
      classes.sort((a, b) => a.price - b.price);

      // Calculate aggregate availability and pricing
      const totalSeats = parseInt(primarySchedule.total_seat);
      const availableSeats = classes.reduce(
        (sum, cls) => sum + cls.availableSeats,
        0
      );
      const minPrice = Math.min(...classes.map((cls) => cls.price));
      const maxPrice = Math.max(...classes.map((cls) => cls.price));

      // Use the cheapest class for base pricing info
      const cheapestClass = classes[0];

      const result: UnifiedFerryResult = {
        id: ferryId,
        operator: "makruzz",
        operatorFerryId: primarySchedule.id,
        ferryName: primarySchedule.ship_title,
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
          departureTime: primarySchedule.departure_time.substring(0, 5), // HH:MM
          arrivalTime: primarySchedule.arrival_time.substring(0, 5), // HH:MM
          duration,
          date: params.date,
        },
        classes, // All classes consolidated here
        availability: {
          totalSeats,
          availableSeats,
          lastUpdated: new Date().toISOString(),
        },
        pricing: {
          baseFare: cheapestClass.pricing.basePrice,
          taxes: cheapestClass.pricing.taxes || 0,
          portFee: cheapestClass.pricing.fees || 0,
          total: minPrice, // Show starting from price
          currency: "INR",
        },
        features: {
          // Seat selection is available for Makruzz Pearl, Regular Makruzz, and Makruzz Gold
          supportsSeatSelection: true,
          supportsAutoAssignment: true,
          hasAC: true,
          hasWiFi: false,
          mealIncluded: classes.some((cls) => this.hasMealIncluded(cls.name)),
        },
        operatorData: {
          originalResponse: schedules, // Store all schedules for this group
          bookingEndpoint: `${this.BASE_URL}savePassengers`,
          authToken: this.authToken || undefined,
        },
        isActive: availableSeats > 0,
      };

      console.log(
        `✅ Consolidated Makruzz result: ${result.ferryName} ${result.schedule.departureTime} → ${result.schedule.arrivalTime}`
      );
      console.log(
        `   Classes: ${classes
          .map((c) => `${c.name} (₹${c.price})`)
          .join(", ")}`
      );
      console.log(`   Price range: ₹${minPrice} - ₹${maxPrice}`);
      console.log(`   Total seats: ${availableSeats}/${totalSeats}`);

      results.push(result);
    });

    console.log(
      `🎯 Makruzz consolidation complete: ${data.length} schedules → ${results.length} unified results`
    );
    return results;
  }

  /**
   * Get amenities based on class name
   */
  private static getClassAmenities(className: string): string[] {
    const baseAmenities = ["AC", "Comfortable Seating"];

    switch (className.toLowerCase()) {
      case "premium":
        return [...baseAmenities, "Standard Service"];
      case "deluxe":
        return [...baseAmenities, "Premium Service", "Complimentary Snacks"];
      case "royal":
        return [
          ...baseAmenities,
          "Luxury Service",
          "Fine Dining",
          "Priority Boarding",
        ];
      default:
        return baseAmenities;
    }
  }

  /**
   * Check if class includes meal
   */
  private static hasMealIncluded(className: string): boolean {
    return ["deluxe", "royal"].includes(className.toLowerCase());
  }

  /**
   * Book passengers using Makruzz API (two-step process: save + confirm)
   */
  static async bookSeats(bookingData: {
    scheduleId: string;
    classId: string;
    travelDate: string;
    passengers: Array<{
      title: string;
      name: string;
      age: number;
      gender: string;
      nationality: string;
      fcountry?: string;
      fpassport?: string;
      fexpdate?: string;
    }>;
    contactDetails: {
      email: string;
      phone: string;
      name: string;
    };
    totalFare: number;
  }): Promise<{
    success: boolean;
    pnr?: string;
    bookingId?: number;
    error?: string;
  }> {
    try {
      console.log("🎫 Makruzz: Starting booking process...", {
        scheduleId: bookingData.scheduleId,
        passengers: bookingData.passengers.length,
        totalFare: bookingData.totalFare,
      });

      // Ensure we're authenticated
      await this.ensureAuthenticated();

      // VALIDATE CRITICAL FIELDS BEFORE API CALL
      console.log("🔍 Validating booking data...");

      // Ensure class_id is numeric
      if (isNaN(parseInt(bookingData.classId))) {
        throw new Error(
          `Invalid class_id: "${bookingData.classId}" must be numeric. Check your unified result transformation.`
        );
      }

      // Step 1: Save passengers with FIXED data format
      const saveResponse = await this.savePassengers(bookingData);

      if (!saveResponse.success || !saveResponse.bookingId) {
        throw new Error(saveResponse.error || "Failed to save passengers");
      }

      console.log(
        `✅ Makruzz: Passengers saved with booking ID: ${saveResponse.bookingId}`
      );

      // Step 2: Confirm booking
      const confirmResponse = await this.confirmBooking(saveResponse.bookingId);

      if (!confirmResponse.success || !confirmResponse.pnr) {
        throw new Error(confirmResponse.error || "Failed to confirm booking");
      }

      console.log(
        `✅ Makruzz: Booking confirmed with PNR: ${confirmResponse.pnr}`
      );

      return {
        success: true,
        pnr: confirmResponse.pnr,
        bookingId: saveResponse.bookingId,
      };
    } catch (error) {
      console.error("🚨 Makruzz booking error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Step 1: Save passengers to Makruzz
   */
  private static async savePassengers(bookingData: {
    scheduleId: string;
    classId: string;
    travelDate: string;
    passengers: Array<{
      title: string;
      name: string;
      age: number;
      gender: string;
      nationality: string;
      fcountry?: string;
      fpassport?: string;
      fexpdate?: string;
    }>;
    contactDetails: {
      email: string;
      phone: string;
      name: string;
    };
    totalFare: number;
  }): Promise<{
    success: boolean;
    bookingId?: number;
    error?: string;
  }> {
    const passengerData: Record<string, any> = {};

    bookingData.passengers.forEach((passenger, index) => {
      passengerData[`${index + 1}`] = {
        title: passenger.title.toUpperCase(), // Ensure uppercase
        name: passenger.name,
        age: passenger.age.toString(),
        sex: passenger.gender.toLowerCase(), // ✅ FIXED: Must be lowercase
        nationality: passenger.nationality.toLowerCase(), // ✅ FIXED: Must be lowercase
        fcountry: passenger.fcountry || "",
        fpassport: passenger.fpassport || "",
        fexpdate: passenger.fexpdate || "",
      };
    });

    // ✅ FIXED: Correct request format
    const requestBody = {
      data: {
        passenger: passengerData,
        c_name: bookingData.contactDetails.name,
        c_mobile: bookingData.contactDetails.phone,
        c_email: bookingData.contactDetails.email,
        p_contact: "123456",
        c_remark: "Online booking via Andaman Excursion",
        no_of_passenger: bookingData.passengers.length.toString(),
        schedule_id: bookingData.scheduleId, // Should be "763"
        travel_date: bookingData.travelDate, // Should be "2025-08-23"
        class_id: bookingData.classId, // ✅ FIXED: Now should be "19", not "makruzz-763-royal"
        fare: bookingData.totalFare.toString(),
        tc_check: true,
      },
    };

    console.log("📝 Makruzz save passengers request: passengers=", bookingData.passengers.length);

    // Debug the critical fields
    console.log("🔍 Critical fields being sent:");
    console.log(
      `  schedule_id: "${requestBody.data.schedule_id
      }" (type: ${typeof requestBody.data.schedule_id})`
    );
    console.log(
      `  class_id: "${requestBody.data.class_id}" (type: ${typeof requestBody
        .data.class_id})`
    );
    console.log(`  travel_date: "${requestBody.data.travel_date}"`);
    console.log(`  no_of_passenger: "${requestBody.data.no_of_passenger}"`);

    const response = await fetch(`${this.BASE_URL}savePassengers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Mak_Authorization: this.authToken || "",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Makruzz save passengers error:", errorText);
      return {
        success: false,
        error: `Save passengers failed: ${response.status} - ${errorText}`,
      };
    }

    const responseText = await response.text();
    console.log("📨 Makruzz save passengers response received");

    try {
      const responseData = JSON.parse(responseText);
      console.log("📨 Makruzz save passengers: code=", responseData.code);

      if (responseData.code !== "200") {
        return {
          success: false,
          error: `Save passengers failed: ${responseData.msg}`,
        };
      }

      return {
        success: true,
        bookingId: responseData.data.booking_id,
      };
    } catch (parseError) {
      console.error("❌ Failed to parse Makruzz response:", parseError);
      return {
        success: false,
        error: `Invalid response format: ${responseText.substring(0, 200)}...`,
      };
    }
  }

  /**
   * Step 2: Confirm booking with Makruzz
   */
  private static async confirmBooking(bookingId: number): Promise<{
    success: boolean;
    pnr?: string;
    error?: string;
  }> {
    const requestBody = {
      data: {
        booking_id: bookingId.toString(),
      },
    };

    console.log("📝 Makruzz confirm booking request:", requestBody);

    const response = await fetch(`${this.BASE_URL}confirm_booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Mak_Authorization: this.authToken || "",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Makruzz confirm booking error:", errorText);
      return {
        success: false,
        error: `Confirm booking failed: ${response.status} - ${errorText}`,
      };
    }

    const responseData: MakruzzConfirmResponse = await response.json();
    console.log("📨 Makruzz confirm booking: code=", responseData.code);

    if (responseData.code !== "200") {
      return {
        success: false,
        error: `Confirm booking failed: ${responseData.msg}`,
      };
    }

    return {
      success: true,
      pnr: responseData.data.pnr,
    };
  }

  /**
   * Get ticket PDF from Makruzz (if available)
   */
  static async getTicketPDF(bookingId: string): Promise<{
    success: boolean;
    pdfBase64?: string;
    error?: string;
  }> {
    try {
      await this.ensureAuthenticated();

      const requestBody = {
        data: {
          booking_id: bookingId,
        },
      };

      const response = await fetch(`${this.BASE_URL}download_ticket_pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Mak_Authorization: this.authToken || "",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`❌ Makruzz PDF download failed: ${response.status}`);
        return {
          success: false,
          error: `PDF download failed: ${response.status}`,
        };
      }

      const pdfBase64 = await response.text();
      console.log(
        `✅ Makruzz PDF downloaded successfully (${pdfBase64.length} chars)`
      );

      return {
        success: true,
        pdfBase64,
      };
    } catch (error) {
      console.error("❌ Makruzz PDF download error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
