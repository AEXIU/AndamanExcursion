// src/app/api/payments/phonepe/status/route.ts
// PhonePe v2 API - Payment Status Check and Booking Processing
import { NextRequest, NextResponse } from "next/server";
import { phonePeServiceV2 } from "@/services/payments/phonePeServiceV2";
import { getPayload } from "payload";
import config from "@payload-config";
import NotificationService from "@/services/notifications/notificationService";
import { FerryBookingService } from "@/services/ferryServices/ferryBookingService";
import { generateAndStorePDF } from "@/utils/generateAndStorePDF";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    // Check merchantOrderId first (v2 primary param), then merchantTransactionId (backward compatibility)
    const merchantOrderId = searchParams.get("merchantOrderId") || searchParams.get("merchantTransactionId");

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: "Merchant Order ID is required" },
        { status: 400 }
      );
    }

    console.log(
      "Checking PhonePe v2 payment status for order:",
      merchantOrderId
    );

    // Check payment status with PhonePe v2 API
    const statusResponse = await phonePeServiceV2.checkPaymentStatus(
      merchantOrderId
    );

    console.log("PhonePe v2 status response:", {
      merchantOrderId,
      state: statusResponse.state,
      code: statusResponse.code,
      success: statusResponse.success,
      orderId: statusResponse.orderId,
    });

    // Get payment record from database
    const payload = await getPayload({ config });
    const paymentRecords = await payload.find({
      collection: "payments",
      where: {
        "phonepeData.merchantOrderId": { equals: merchantOrderId },
      },
      limit: 1,
    });

    if (!paymentRecords.docs || paymentRecords.docs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentRecord = paymentRecords.docs[0];

    // Debug: Log payment record structure
    console.log("Payment record found:", {
      id: paymentRecord.id,
      hasBookingData: !!paymentRecord.bookingData,
      bookingDataType: typeof paymentRecord.bookingData,
    });

    // Parse bookingData if it's a string
    let bookingData: any = paymentRecord.bookingData;
    if (typeof bookingData === "string") {
      try {
        bookingData = JSON.parse(bookingData);
        console.log("Parsed bookingData from string");
      } catch (e) {
        console.error("Failed to parse bookingData:", e);
      }
    }

    if (!bookingData) {
      console.error("No booking data found in payment record");
      return NextResponse.json(
        { success: false, error: "Booking data not found in payment record" },
        { status: 400 }
      );
    }

    console.log("Booking data retrieved:", {
      bookingType: bookingData.bookingType,
      hasItems: !!bookingData.items,
      itemsLength: bookingData.items?.length,
      hasContactDetails: !!bookingData.contactDetails,
      hasMembers: !!bookingData.members,
    });

    // Update payment record with status
    // Get existing phonepeData and merge with new data to avoid conflicts
    const existingPhonepeData = (paymentRecord as any).phonepeData || {};

    // v2 API: state is SUCCESS/FAILED/PENDING/EXPIRED, also accept COMPLETED for backward compatibility
    const isSuccess = statusResponse.state === "SUCCESS" ||
      statusResponse.state === "COMPLETED" ||
      statusResponse.success;
    const isFailed = statusResponse.state === "FAILED" || statusResponse.state === "EXPIRED";

    await payload.update({
      collection: "payments",
      id: paymentRecord.id,
      data: {
        status: isSuccess ? "success" : isFailed ? "failed" : "pending",
        phonepeData: {
          ...existingPhonepeData,
          phonepeTransactionId: statusResponse.orderId || merchantOrderId,
          statusCheckData: JSON.stringify(statusResponse),
        },
      },
    });

    // If payment is successful, process the booking
    if (isSuccess) {
      console.log("Payment successful, processing booking...");

      // IDEMPOTENCY GUARD: Check if booking already exists for this order
      const existingBookings = await payload.find({
        collection: "bookings",
        where: {
          paymentTransactions: { contains: paymentRecord.id },
        },
        limit: 1,
      });

      if (existingBookings.docs && existingBookings.docs.length > 0) {
        const existingBooking = existingBookings.docs[0];
        console.log("Booking already exists for this order (idempotency guard):", {
          bookingId: existingBooking.id,
          merchantOrderId,
        });

        return NextResponse.json({
          success: true,
          status: statusResponse.state || "SUCCESS",
          transactionId: statusResponse.orderId || merchantOrderId,
          orderId: statusResponse.orderId || merchantOrderId,
          booking: existingBooking,
          message: "Payment successful and booking confirmed",
        });
      }

      try {
        // Process booking based on type
        const bookingResult = await processBooking(
          bookingData,
          merchantOrderId,
          paymentRecord.id
        );

        // Send confirmation notifications
        if (bookingResult.success && bookingResult.booking) {
          try {
            console.log("Sending booking confirmation notifications...");
            const notificationResult = await NotificationService.sendBookingConfirmation(
              bookingResult.booking.id
            );
            console.log("Notification results:", notificationResult);
          } catch (notifError) {
            console.error("Failed to send notifications:", notifError);
            // Don't fail the booking if notifications fail
          }
        }

        return NextResponse.json({
          success: true,
          status: statusResponse.state || "SUCCESS",
          transactionId: statusResponse.orderId || merchantOrderId,
          orderId: statusResponse.orderId || merchantOrderId,
          booking: bookingResult.booking,
          providerBooking: bookingResult.providerBooking || null,
          message: bookingResult.success
            ? "Payment successful and booking confirmed"
            : "Payment successful but booking needs manual processing",
        });
      } catch (bookingError: any) {
        console.error("Booking processing error:", bookingError);
        console.error("Error details:", {
          message: bookingError?.message,
          stack: bookingError?.stack,
          type: typeof bookingError,
          isError: bookingError instanceof Error,
        });

        // ✅ CRITICAL FIX: Safely extract error message with fallback
        const errorMessage = bookingError?.message ||
          (typeof bookingError === 'string' ? bookingError : 'Unknown booking error');

        // Payment succeeded but booking failed - create failed booking record
        const failedBooking = await createFailedBookingRecord(
          payload,
          bookingData,
          merchantOrderId,
          paymentRecord.id,
          bookingError
        );

        // Determine user-friendly error message and details based on error type
        const { userMessage, errorType, requiresRefund } = categorizeBookingError(
          errorMessage,
          bookingData.bookingType
        );

        console.error("⚠️ POST-PAYMENT BOOKING FAILURE:", {
          errorType,
          requiresRefund,
          transactionId: statusResponse.orderId || merchantOrderId,
          bookingId: failedBooking.id,
          errorMessage: errorMessage,
        });

        return NextResponse.json({
          success: false,
          status: statusResponse.state || "SUCCESS",
          transactionId: statusResponse.orderId || merchantOrderId,
          orderId: statusResponse.orderId || merchantOrderId,
          booking: failedBooking,
          error: "Booking processing failed",
          errorType,
          requiresRefund,
          details: errorMessage,
          message: userMessage,
        });
      }
    }

    // Payment not successful yet
    if (isFailed) {
      try {
        const customerName = bookingData.contactDetails?.primaryName || bookingData.members?.[0]?.fullName || "Customer";
        const customerEmail = bookingData.contactDetails?.email || bookingData.members?.[0]?.email || "";
        const customerPhone = bookingData.contactDetails?.whatsapp || bookingData.contactDetails?.whatsappNumber || bookingData.contactDetails?.phone || bookingData.members?.[0]?.whatsapp || bookingData.members?.[0]?.phone || "";
        const amount = bookingData.totalPrice || bookingData.items?.[0]?.price || 0;
        
        await NotificationService.sendPaymentFailedNotification(
          customerEmail,
          customerName,
          amount,
          statusResponse.message || "Payment failed or was cancelled",
          bookingData.bookingType,
          customerPhone
        );
      } catch (notifErr) {
        console.error("Failed to send payment failure notification:", notifErr);
      }
    }

    return NextResponse.json({
      success: false,
      status: statusResponse.state || "PENDING",
      transactionId: statusResponse.orderId || merchantOrderId,
      orderId: statusResponse.orderId || merchantOrderId,
      message: isFailed
        ? "Payment failed. Please try again."
        : "Payment is still processing...",
    });
  } catch (error: any) {
    console.error("PhonePe status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Status check failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function to process booking based on type
async function processBooking(
  bookingData: any,
  orderId: string,
  paymentId: string
) {
  const payload = await getPayload({ config });

  // Determine booking type
  const bookingType = bookingData.bookingType;
  const items = bookingData.items || [];

  if (bookingType === "ferry" && items.length > 0) {
    // Process ferry booking with external API
    const ferryItem = items[0];

    console.log("Ferry item structure:", {
      hasId: !!ferryItem.id,
      hasFerryId: !!ferryItem.ferryId,
      hasFerry: !!ferryItem.ferry,
      ferryKeys: Object.keys(ferryItem.ferry || {}),
      itemKeys: Object.keys(ferryItem),
      ferryItem: JSON.stringify(ferryItem, null, 2),
    });

    const ferryId =
      ferryItem.ferryId || ferryItem.ferry?.ferryId || ferryItem.ferry?.id;

    if (!ferryId) {
      console.error("Ferry ID extraction failed:", { ferryItem });
      throw new Error("Ferry ID not found in booking data");
    }

    console.log("Extracted ferry ID:", ferryId);

    // Extract operator from ferry data
    const operator = ferryItem.ferry.operator as
      | "sealink"
      | "makruzz"
      | "greenocean";

    // Count passengers based on ACTUAL member ages (universal pricing model)
    // Infants (< 2 years): FREE, no ticket
    // Adults (≥ 2 years): Full price, ticket required
    const adults = (bookingData.members || []).filter((m: any) => m.age >= 2).length;
    const children = 0; // Always 0 in streamlined universal model
    const infants = (bookingData.members || []).filter((m: any) => m.age < 2).length;

    console.log("Passenger categorization by actual ages:", {
      totalMembers: bookingData.members?.length || 0,
      adults,
      children,
      infants,
      memberAges: (bookingData.members || []).map((m: any) => m.age),
    });

    // Build FerryBookingRequest object
    const bookingRequest = {
      operator: operator,
      ferryId: ferryId,
      fromLocation: ferryItem.ferry.route.from.name,
      toLocation: ferryItem.ferry.route.to.name,
      date: ferryItem.date,
      time: ferryItem.time,
      classId: ferryItem.selectedClass?.id || ferryItem.ferry.selectedClass?.id,
      routeId: ferryItem.ferry.operatorFerryId?.toString(),
      passengers: {
        adults,
        children,
        infants,
      },
      selectedSeats: ferryItem.selectedSeats || [],
      passengerDetails: bookingData.members.map((member: any) => ({
        fullName: member.fullName,
        age: member.age,
        gender: member.gender,
        nationality: member.nationality,
        passportNumber: member.passportNumber,
        whatsappNumber: bookingData.contactDetails?.whatsapp || member.whatsapp,
        phoneCountryCode: member.phoneCountryCode || "+91",
        phoneCountry: member.phoneCountry || "India",
        email: bookingData.contactDetails?.email || member.email,
        fpassport: member.fpassport,
        fexpdate: member.fexpdate,
        fcountry: member.fcountry,
      })),
      paymentReference: orderId,
      totalAmount: ferryItem.price,
    };

    console.log("Booking request prepared:", {
      operator: bookingRequest.operator,
      ferryId: bookingRequest.ferryId,
      passengers: bookingRequest.passengers,
      passengerCount: bookingRequest.passengerDetails.length,
    });

    // Call ferry booking service with proper request object
    const ferryBookingResult = await FerryBookingService.bookFerry(
      bookingRequest
    );

    // Determine booking status based on provider booking result
    // Use "pending" when payment succeeded but provider booking failed (needs manual processing)
    const bookingStatus = ferryBookingResult.success ? "confirmed" : "pending";
    const providerBookingStatus = ferryBookingResult.success
      ? "confirmed"
      : "failed";

    // Create booking record with full details (matching old Razorpay implementation)
    const booking = await payload.create({
      collection: "bookings",
      depth: 2, // Populate relationships
      data: {
        bookingType: "ferry",
        serviceDate: ferryItem.date,
        customerInfo: {
          primaryContactName:
            bookingData.contactDetails?.primaryName ||
            bookingData.members?.[0]?.fullName ||
            "",
          customerEmail: bookingData.contactDetails?.email || "",
          customerPhone: bookingData.contactDetails?.whatsapp || "",
          nationality: bookingData.nationality || "Indian",
        },

        // Ferry booking details
        bookedFerries: [
          {
            operator: ferryItem.ferry.operator as
              | "sealink"
              | "makruzz"
              | "greenocean",
            ferryName:
              ferryItem.ferry?.ferryName || ferryItem.title || "Unknown Ferry",
            route: {
              from:
                ferryItem.ferry?.route?.from?.name ||
                ferryItem.ferry?.fromLocation ||
                "Unknown",
              to:
                ferryItem.ferry?.route?.to?.name ||
                ferryItem.ferry?.toLocation ||
                "Unknown",
              fromCode:
                ferryItem.ferry?.route?.from?.code ||
                ferryItem.ferry?.route?.fromCode ||
                "",
              toCode:
                ferryItem.ferry?.route?.to?.code ||
                ferryItem.ferry?.route?.toCode ||
                "",
            },
            schedule: {
              departureTime:
                ferryItem.ferry?.schedule?.departureTime ||
                ferryItem.time ||
                "Unknown",
              arrivalTime: ferryItem.ferry?.schedule?.arrivalTime || "Unknown",
              duration: ferryItem.ferry?.schedule?.duration || "Unknown",
              travelDate: new Date(ferryItem.date).toISOString(),
            },
            selectedClass: {
              classId:
                ferryItem.selectedClass?.id ||
                ferryItem.ferry?.selectedClass?.id ||
                "unknown",
              className:
                ferryItem.selectedClass?.name ||
                ferryItem.ferry?.selectedClass?.name ||
                "Unknown Class",
              price:
                ferryItem.selectedClass?.price ||
                ferryItem.ferry?.selectedClass?.price ||
                0,
            },
            passengers: {
              adults: ferryItem.passengers?.adults || 0,
              children: ferryItem.passengers?.children || 0,
              infants: ferryItem.passengers?.infants || 0,
            },
            selectedSeats: (ferryItem.selectedSeats || []).map((seat: any) => ({
              seatNumber:
                seat.number || seat.seatNumber || seat || "Auto-assigned",
              seatId: seat.id || seat.seatId || "",
              passengerName: "",
            })),
            providerBooking: {
              pnr: ferryBookingResult.pnr || "",
              operatorBookingId: ferryBookingResult.providerBookingId || "",
              bookingStatus: providerBookingStatus,
              providerResponse: JSON.stringify(
                (() => {
                  // Strip large binary data (pdf_base64) and nested providerResponse
                  // to keep the textarea field within size limits
                  const { confirmationDetails, ...rest } = ferryBookingResult as any;
                  if (confirmationDetails) {
                    const { providerResponse: nested, ...confirmRest } = confirmationDetails;
                    // Also strip pdf_base64 from nested providerResponse if present
                    let cleanNested = undefined;
                    if (nested && typeof nested === 'object') {
                      const { pdf_base64, originalResponse, ...nestedRest } = nested;
                      cleanNested = nestedRest;
                    }
                    return { ...rest, confirmationDetails: { ...confirmRest, providerResponse: cleanNested } };
                  }
                  return rest;
                })()
              ),
              errorMessage: ferryBookingResult.success
                ? ""
                : ferryBookingResult.error || "Booking failed",
            },
            totalPrice: ferryItem.price || 0,
          },
        ],

        // Passenger details - Extract ticket numbers from provider response
        passengers: (bookingData.members || []).map(
          (member: any, memberIndex: number) => {
            // Extract ticket number from confirmationDetails.tickets array
            let ticketNumber = ferryBookingResult.pnr || ""; // Default to PNR

            // Try to get individual ticket number from confirmationDetails
            if (ferryBookingResult.confirmationDetails?.tickets?.[memberIndex]) {
              ticketNumber = ferryBookingResult.confirmationDetails.tickets[memberIndex].ticketNumber || ticketNumber;
            }

            return {
              isPrimary: memberIndex === 0,
              fullName: member.fullName,
              age: member.age,
              gender: member.gender,
              nationality: member.nationality || "Indian",
              passportNumber: member.passportNumber || "",
              passportExpiry: member.fexpdate || member.passportExpiry || "",
              ticketNumber: ticketNumber, // Add ticket number field
              whatsappNumber:
                memberIndex === 0
                  ? bookingData.contactDetails?.whatsapp || member.whatsappNumber
                  : member.whatsappNumber,
              email:
                memberIndex === 0
                  ? bookingData.contactDetails?.email || member.email
                  : member.email,
              assignedActivities: [],
            };
          }
        ),

        // Pricing details - Extract breakdown from selectedClass pricing if available
        pricing: {
          subtotal: ferryItem.price,
          baseFare: ferryItem.selectedClass?.pricing?.basePrice ||
            ferryItem.ferry?.selectedClass?.pricing?.basePrice ||
            ferryItem.price,
          taxes: ferryItem.selectedClass?.pricing?.taxes ||
            ferryItem.ferry?.selectedClass?.pricing?.taxes || 0,
          fees: ferryItem.selectedClass?.pricing?.fees ||
            ferryItem.ferry?.selectedClass?.pricing?.fees || 0,
          utgst: 0, // UTGST typically 0% for ferry services
          cgst: 0,  // CGST typically 0% for ferry services
          psf: ferryItem.selectedClass?.pricing?.fees ||
            ferryItem.ferry?.selectedClass?.pricing?.fees || 0, // PSF is usually the fees
          totalAmount: ferryItem.price,
          currency: "INR",
          hsnCode: "996411", // HSN/SAC code for passenger transport by waterways
          paymentMode: "PhonePe", // Payment mode used
        },

        status: bookingStatus,
        paymentStatus: "paid",
        paymentTransactions: [paymentId],
        termsAccepted: true,
        communicationPreferences: {
          sendWhatsAppUpdates: true,
          sendEmailUpdates: true,
          language: "en",
        },
      },
    });

    console.log("Ferry booking created successfully:", {
      id: booking.id,
      bookedFerries: booking.bookedFerries?.length,
      passengers: booking.passengers?.length,
      pricing: booking.pricing,
    });

    // Auto-generate and save PDF to database (from file 1)
    await generateAndStorePDF(booking, payload);

    console.log(
      "Full ferry booking object being returned:",
      JSON.stringify(
        {
          bookedFerries: booking.bookedFerries,
          passengers: booking.passengers,
          pricing: booking.pricing,
          customerInfo: booking.customerInfo,
        },
        null,
        2
      )
    );

    return {
      success: ferryBookingResult.success,
      booking: booking,
      providerBooking: ferryBookingResult,
    };
  } else {
    // For activity/boat bookings - create booking record with full details
    const firstItem = items[0] || {};

    // Process activities for booking
    const bookedActivities =
      bookingType === "activity" && items.length > 0
        ? items.map((item: any) => {
          console.log("Processing activity item for booking:", {
            price: item.price,
            time: item.time,
            passengers: item.passengers,
            searchParams: item.searchParams,
          });

          return {
            activity: item.activity?.id || null,
            activityOption: item.searchParams?.activityType || "",
            quantity: 1,
            unitPrice: item.price || 0,
            totalPrice: item.price || 0,
            scheduledTime: item.time || "",
            location: item.location?.id || null,
            passengers: {
              adults: item.passengers?.adults || 0,
              children: 0,
              infants: 0,
            },
          };
        })
        : [];

    console.log("Processed bookedActivities:", bookedActivities);

    // Process boats for booking
    const bookedBoats =
      bookingType === "boat" && firstItem
        ? [
          {
            boatRoute: firstItem.boat?.id || null,
            boatName:
              firstItem.boat?.name || firstItem.title || "Unknown Boat",
            route: {
              from:
                firstItem.boat?.route?.from ||
                firstItem.location ||
                "Unknown",
              to: firstItem.boat?.route?.to || "Unknown",
            },
            schedule: {
              departureTime:
                firstItem.selectedTime || firstItem.time || "Unknown",
              duration:
                firstItem.boat?.route?.minTimeAllowed ||
                firstItem.boat?.minTimeAllowed ||
                "Unknown",
              travelDate: new Date(
                firstItem.date || new Date()
              ).toISOString(),
            },
            passengers: {
              adults: firstItem.passengers?.adults || 0,
              children: 0,
              infants: 0,
            },
            totalPrice: firstItem.price || 0,
          },
        ]
        : [];

    console.log("Creating booking with data:", {
      bookingType,
      customerInfo: {
        primaryContactName:
          bookingData.contactDetails?.primaryName ||
          bookingData.members?.[0]?.fullName ||
          "",
        customerEmail: bookingData.contactDetails?.email || "",
      },
      bookedActivitiesCount: bookedActivities.length,
      passengersCount: (bookingData.members || []).length,
      pricing: {
        subtotal: bookingData.totalPrice || firstItem.price || 0,
        totalAmount: bookingData.totalPrice || firstItem.price || 0,
      },
    });

    const booking = await payload.create({
      collection: "bookings",
      depth: 2, // Populate relationships
      data: {
        bookingType: bookingType,
        serviceDate: firstItem.date || new Date().toISOString().split("T")[0],
        customerInfo: {
          primaryContactName:
            bookingData.contactDetails?.primaryName ||
            bookingData.members?.[0]?.fullName ||
            "",
          customerEmail: bookingData.contactDetails?.email || "",
          customerPhone: bookingData.contactDetails?.whatsapp || "",
          nationality: bookingData.nationality || "Indian",
        },

        bookedActivities: bookedActivities,
        bookedBoats: bookedBoats,

        // Passenger details
        passengers: (bookingData.members || []).map(
          (member: any, memberIndex: number) => ({
            isPrimary: memberIndex === 0,
            fullName: member.fullName,
            age: member.age,
            gender: member.gender,
            nationality: member.nationality || "Indian",
            passportNumber: member.passportNumber || "",
            passportExpiry: member.fexpdate || member.passportExpiry || "",
            whatsappNumber:
              memberIndex === 0
                ? bookingData.contactDetails?.whatsapp || member.whatsappNumber
                : member.whatsappNumber,
            email:
              memberIndex === 0
                ? bookingData.contactDetails?.email || member.email
                : member.email,
            assignedActivities:
              bookingType === "activity"
                ? items.map((item: any, itemIndex: number) => ({
                  activityIndex: itemIndex,
                }))
                : [],
          })
        ),

        pricing: {
          subtotal: bookingData.totalPrice || firstItem.price || 0,
          baseFare: bookingData.totalPrice || firstItem.price || 0,
          taxes: 0,
          fees: 0,
          utgst: 0,
          cgst: 0,
          psf: 0,
          totalAmount: bookingData.totalPrice || firstItem.price || 0,
          currency: "INR",
          hsnCode: bookingType === "boat" ? "996411" : "998551", // 996411 for boat/water transport, 998551 for recreational/activity services
          paymentMode: "PhonePe",
        },

        status: "confirmed",
        paymentStatus: "paid",
        paymentTransactions: [paymentId],
        termsAccepted: true,
        communicationPreferences: {
          sendWhatsAppUpdates: true,
          sendEmailUpdates: true,
          language: "en",
        },
      },
    });

    console.log("Booking created successfully:", {
      id: booking.id,
      bookedActivities: booking.bookedActivities?.length,
      passengers: booking.passengers?.length,
      pricing: booking.pricing,
    });

    // Auto-generate and save PDF to database (from file 1)
    await generateAndStorePDF(booking, payload);

    console.log(
      "Full booking object being returned:",
      JSON.stringify(
        {
          bookedActivities: booking.bookedActivities,
          passengers: booking.passengers,
          pricing: booking.pricing,
          customerInfo: booking.customerInfo,
        },
        null,
        2
      )
    );

    return {
      success: true,
      booking: booking,
    };
  }
}

// Helper function to create failed booking record
async function createFailedBookingRecord(
  payload: any,
  bookingData: any,
  orderId: string,
  paymentId: string,
  error: any
) {
  try {
    const firstItem = bookingData.items?.[0] || {};
    return await payload.create({
      collection: "bookings",
      data: {
        bookingId: orderId,
        confirmationNumber: orderId,
        status: "pending",
        paymentStatus: "paid",
        bookingType: bookingData.bookingType || "ferry",
        serviceDate: firstItem.date || new Date().toISOString().split("T")[0],
        customerInfo: {
          primaryContactName:
            bookingData.contactDetails?.primaryName ||
            bookingData.members?.[0]?.fullName ||
            "Unknown",
          customerEmail: bookingData.contactDetails?.email || "unknown@example.com",
          customerPhone: bookingData.contactDetails?.whatsapp || "0000000000",
          nationality: bookingData.nationality || "Indian",
        },
        passengers: (bookingData.members || []).map(
          (member: any, idx: number) => ({
            isPrimary: idx === 0,
            fullName: member.fullName || "Unknown",
            age: member.age || 0,
            gender: member.gender || "Male",
            nationality: member.nationality || "Indian",
            assignedActivities: [],
          })
        ),
        pricing: {
          subtotal: bookingData.totalPrice || firstItem.price || 0,
          totalAmount: bookingData.totalPrice || firstItem.price || 0,
          currency: "INR",
        },
        paymentTransactions: [paymentId],
        termsAccepted: true,
        internalNotes: `Booking failed: ${error?.message || "Unknown error"}. Payment was successful — requires manual processing or refund.`,
      },
    });
  } catch (fallbackError) {
    console.error("Failed to create failed booking record:", fallbackError);
    // Return a minimal object so the caller doesn't crash
    return { id: orderId, status: "failed", error: error?.message };
  }
}

/**
 * Categorize booking errors to provide user-friendly messages
 */
function categorizeBookingError(
  errorMessage: string,
  bookingType: string
): {
  userMessage: string;
  errorType: string;
  requiresRefund: boolean;
} {
  const lowerError = errorMessage.toLowerCase();

  // Seat already booked - most common post-payment failure
  if (
    lowerError.includes("already booked") ||
    lowerError.includes("seat") && lowerError.includes("not available") ||
    lowerError.includes("seats are taken")
  ) {
    return {
      errorType: "SEAT_UNAVAILABLE",
      requiresRefund: true,
      userMessage:
        "⚠️ Payment Successful - Seat Selection Issue\n\n" +
        "Your payment of ₹{amount} has been successfully processed. However, the seats you selected are no longer available as they were booked by another customer during checkout.\n\n" +
        "What happens next:\n" +
        "✓ Your payment is safe and secure\n" +
        "✓ Our team will contact you within 2 hours\n" +
        "✓ We'll offer you alternative seats on the same ferry\n" +
        "✓ If alternatives aren't suitable, we'll process a full refund within 5-7 business days\n\n" +
        "You'll receive an email at {email} with next steps.\n\n" +
        "For immediate assistance, call us at +91-XXXX-XXXX\n" +
        "Booking Reference: {bookingId}",
    };
  }

  // Capacity/availability issues
  if (
    lowerError.includes("capacity") ||
    lowerError.includes("full") ||
    lowerError.includes("no availability") ||
    lowerError.includes("sold out")
  ) {
    return {
      errorType: "CAPACITY_FULL",
      requiresRefund: true,
      userMessage:
        "⚠️ Payment Successful - Ferry Fully Booked\n\n" +
        "Your payment has been processed, but unfortunately this ferry has reached full capacity.\n\n" +
        "What happens next:\n" +
        "✓ Our team will contact you within 2 hours\n" +
        "✓ We'll suggest alternative ferry timings\n" +
        "✓ If no alternatives work, full refund in 5-7 business days\n\n" +
        "Booking Reference: {bookingId}",
    };
  }

  // Date/schedule issues
  if (
    lowerError.includes("date") ||
    lowerError.includes("schedule") ||
    lowerError.includes("cancelled") ||
    lowerError.includes("not operating")
  ) {
    return {
      errorType: "SCHEDULE_ISSUE",
      requiresRefund: true,
      userMessage:
        "⚠️ Payment Successful - Schedule Change\n\n" +
        "Your payment was successful, but there's an issue with the ferry schedule.\n\n" +
        "What happens next:\n" +
        "✓ Our team will contact you within 2 hours\n" +
        "✓ We'll help you book an alternative ferry\n" +
        "✓ Full refund available if needed (5-7 business days)\n\n" +
        "Booking Reference: {bookingId}",
    };
  }

  // API/technical errors
  if (
    lowerError.includes("timeout") ||
    lowerError.includes("connection") ||
    lowerError.includes("network") ||
    lowerError.includes("api")
  ) {
    return {
      errorType: "TECHNICAL_ERROR",
      requiresRefund: false,
      userMessage:
        "⚠️ Payment Successful - Processing Your Booking\n\n" +
        "Your payment was successful but we encountered a technical issue while confirming your booking.\n\n" +
        "What happens next:\n" +
        "✓ Our team is actively processing your booking\n" +
        "✓ You'll receive confirmation within 1-2 hours\n" +
        "✓ No action needed from your side\n\n" +
        "Booking Reference: {bookingId}",
    };
  }

  // Generic/unknown error
  return {
    errorType: "UNKNOWN",
    requiresRefund: false,
    userMessage:
      "⚠️ Payment Successful - Booking Being Processed\n\n" +
      "Your payment was successful. We're currently processing your booking and will confirm shortly.\n\n" +
      "What happens next:\n" +
      "✓ Our team will review and process your booking\n" +
      "✓ You'll receive confirmation within 2-4 hours\n" +
      "✓ If any issues arise, we'll contact you immediately\n\n" +
      "Booking Reference: {bookingId}\n\n" +
      "For questions, contact us at +91-XXXX-XXXX",
  };
}