// ==========================================
// ARCHIVED - REPLACED BY PHONEPE
// This Razorpay verification route is no longer active
// Active payment verification now uses PhonePe
// See: src/app/api/payments/phonepe/status/route.ts
// ==========================================

// app/api/payments/verify/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { FerryBookingService } from "@/services/ferryServices/ferryBookingService";
import { notificationManager } from "@/services/notifications/NotificationManager";
import type { BookingConfirmationData } from "@/services/notifications/channels/base";
import { CheckoutAdapter } from "@/utils/CheckoutAdapter";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
      sessionId,
    } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      console.error("Payment signature verification failed:", {
        expected: expectedSign,
        received: razorpay_signature,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      return NextResponse.json(
        { error: "Payment verification failed - invalid signature" },
        { status: 400 }
      );
    }

    // Get Payload CMS instance
    const payload = await getPayload({ config });

    // Debug: Log the structure of incoming booking data
    console.log("=== Payment Verification Debug ===");
    console.log(
      "Booking data structure:",
      JSON.stringify(bookingData, null, 2)
    );

    try {
      // Create payment record first
      const paymentRecord = await payload.create({
        collection: "payments",
        data: {
          transactionId: razorpay_payment_id, // Required field
          gateway: "razorpay", // Payment gateway used
          razorpayData: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
          amount: bookingData.totalPrice * 100, // Convert to paise
          status: "success",
          customerDetails: {
            name: bookingData.members?.[0]?.fullName || "",
            email: bookingData.members?.[0]?.email || "",
            phone: bookingData.members?.[0]?.whatsappNumber || "",
          },
          gatewayResponse: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            verified_at: new Date().toISOString(),
          },
        },
      });

      // Helper function to extract service date based on booking type
      const getServiceDate = (bookingData: any): string => {
        if (
          (bookingData.bookingType === "ferry" ||
            bookingData.bookingType === "boat" ||
            bookingData.bookingType === "activity") &&
          bookingData.items?.[0]?.date
        ) {
          return bookingData.items[0].date;
        } else if (bookingData.serviceDate) {
          return bookingData.serviceDate;
        }
        // Fallback to tomorrow's date if no date provided
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
      };

      // Process activities for activity bookings
      const processedActivities =
        bookingData.bookingType === "activity" && bookingData.items
          ? await Promise.all(
              bookingData.items.map(async (item: any) => {
                // Look up activity by slug to get ObjectId
                let activityId = null;
                if (item.activity?.slug) {
                  try {
                    const activityDoc = await payload.find({
                      collection: "activities",
                      where: {
                        slug: {
                          equals: item.activity.slug,
                        },
                      },
                      limit: 1,
                    });
                    activityId = activityDoc.docs[0]?.id || null;
                    console.log(
                      `Activity lookup: slug=${item.activity.slug}, found_id=${activityId}`
                    );
                  } catch (error) {
                    console.error(
                      `Failed to find activity with slug ${item.activity.slug}:`,
                      error
                    );
                  }
                } else if (item.activity?.id) {
                  activityId = item.activity.id;
                  console.log(`Using existing activity ID: ${activityId}`);
                }

                if (!activityId) {
                  console.error(`No activity ID found for:`, item.activity);
                  throw new Error(
                    `Activity not found: ${
                      item.activity?.slug || item.activity?.title || "Unknown"
                    }`
                  );
                }

                // Look up location by slug/id if provided
                let locationId = null;
                const locationData = item.activity?.coreInfo?.location?.[0];
                if (locationData) {
                  if (locationData.slug) {
                    try {
                      const locationDoc = await payload.find({
                        collection: "locations",
                        where: {
                          slug: {
                            equals: locationData.slug,
                          },
                        },
                        limit: 1,
                      });
                      locationId = locationDoc.docs[0]?.id || null;
                      console.log(
                        `Location lookup: slug=${locationData.slug}, found_id=${locationId}`
                      );
                    } catch (error) {
                      console.error(
                        `Failed to find location with slug ${locationData.slug}:`,
                        error
                      );
                    }
                  } else if (locationData.id) {
                    locationId = locationData.id;
                    console.log(`Using existing location ID: ${locationId}`);
                  }
                }

                return {
                  activity: activityId,
                  activityOption: item.searchParams?.activityType || "",
                  quantity: 1,
                  unitPrice: item.price || 0,
                  totalPrice: item.price || 0,
                  scheduledTime: item.time || "",
                  location: locationId,
                  passengers: {
                    adults:
                      item.passengers?.adults || item.searchParams?.adults || 0,
                    children: 0, // COMMENTED OUT: Children not handled for activities
                    infants: 0, // COMMENTED OUT: Infants not handled for activities
                  },
                };
              })
            )
          : [];

      // Create booking record with fixed data structure
      const bookingRecord = await payload.create({
        collection: "bookings",
        data: {
          bookingType: bookingData.bookingType || "activity",
          serviceDate: getServiceDate(bookingData),
          customerInfo: {
            primaryContactName:
              bookingData.contactDetails?.primaryName ||
              bookingData.primaryContactName ||
              bookingData.members?.[0]?.fullName ||
              "",
            customerEmail:
              bookingData.contactDetails?.email ||
              bookingData.customerEmail ||
              bookingData.members?.[0]?.email ||
              "",
            customerPhone:
              bookingData.contactDetails?.whatsapp ||
              bookingData.customerPhone ||
              bookingData.members?.[0]?.whatsappNumber ||
              "",
            nationality: bookingData.nationality || "Indian",
          },
          bookedActivities: processedActivities,

          // Handle boat bookings
          bookedBoats:
            bookingData.bookingType === "boat" && bookingData.items?.[0]
              ? [
                  {
                    boatRoute: bookingData.items[0].boat?.id || null,
                    boatName:
                      bookingData.items[0].boat?.name ||
                      bookingData.items[0].title ||
                      "Unknown Boat",
                    route: {
                      from:
                        bookingData.items[0].boat?.route?.from ||
                        bookingData.items[0].location ||
                        "Unknown",
                      to: bookingData.items[0].boat?.route?.to || "Unknown",
                    },
                    schedule: {
                      departureTime:
                        bookingData.items[0].selectedTime ||
                        bookingData.items[0].time ||
                        "Unknown",
                      duration:
                        bookingData.items[0].boat?.route?.minTimeAllowed ||
                        bookingData.items[0].boat?.minTimeAllowed ||
                        "Unknown",
                      travelDate: new Date(
                        bookingData.items[0].date || getServiceDate(bookingData)
                      ).toISOString(),
                    },
                    passengers: {
                      adults: bookingData.items[0].passengers?.adults || 0,
                      children: 0, // COMMENTED OUT: Children not handled for activities (boat bookings)
                      infants: 0, // COMMENTED OUT: Infants not handled for activities (boat bookings)
                    },
                    totalPrice:
                      bookingData.items[0].price || bookingData.totalPrice || 0,
                  },
                ]
              : [],

          // Handle ferry bookings
          bookedFerries:
            bookingData.bookingType === "ferry" && bookingData.items?.[0]
              ? [
                  {
                    operator: (["sealink", "makruzz", "greenocean"].includes(
                      bookingData.items[0].ferry?.operator
                    )
                      ? bookingData.items[0].ferry?.operator
                      : "greenocean") as "sealink" | "makruzz" | "greenocean",
                    ferryName:
                      bookingData.items[0].ferry?.ferryName ||
                      bookingData.items[0].title ||
                      "Unknown Ferry",
                    route: {
                      from:
                        bookingData.items[0].ferry?.route?.from?.name ||
                        bookingData.items[0].ferry?.route?.from ||
                        bookingData.items[0].ferry?.fromLocation ||
                        bookingData.items[0].fromLocation ||
                        bookingData.searchParams?.from ||
                        "Unknown",
                      to:
                        bookingData.items[0].ferry?.route?.to?.name ||
                        bookingData.items[0].ferry?.route?.to ||
                        bookingData.items[0].ferry?.toLocation ||
                        bookingData.items[0].toLocation ||
                        bookingData.searchParams?.to ||
                        "Unknown",
                      fromCode:
                        bookingData.items[0].ferry?.route?.from?.code ||
                        bookingData.items[0].ferry?.route?.fromCode ||
                        "",
                      toCode:
                        bookingData.items[0].ferry?.route?.to?.code ||
                        bookingData.items[0].ferry?.route?.toCode ||
                        "",
                    },
                    schedule: {
                      departureTime:
                        bookingData.items[0].ferry?.schedule?.departureTime ||
                        bookingData.items[0].time ||
                        "Unknown",
                      arrivalTime:
                        bookingData.items[0].ferry?.schedule?.arrivalTime ||
                        "Unknown",
                      duration:
                        bookingData.items[0].ferry?.schedule?.duration ||
                        "Unknown",
                      travelDate: new Date(
                        bookingData.items[0].date || getServiceDate(bookingData)
                      ).toISOString(),
                    },
                    selectedClass: {
                      classId:
                        bookingData.items[0].ferry?.selectedClass?.classId ||
                        bookingData.items[0].ferry?.selectedClass?.id ||
                        bookingData.items[0].selectedClass?.classId ||
                        bookingData.items[0].selectedClass?.id ||
                        "unknown",
                      className:
                        bookingData.items[0].ferry?.selectedClass?.className ||
                        bookingData.items[0].ferry?.selectedClass?.name ||
                        bookingData.items[0].selectedClass?.className ||
                        bookingData.items[0].selectedClass?.name ||
                        "Unknown Class",
                      price:
                        bookingData.items[0].ferry?.selectedClass?.price ||
                        bookingData.items[0].selectedClass?.price ||
                        0,
                    },
                    passengers: {
                      adults: bookingData.items[0].passengers?.adults || 0,
                      children: bookingData.items[0].passengers?.children || 0,
                      infants: bookingData.items[0].passengers?.infants || 0,
                    },
                    selectedSeats:
                      bookingData.items[0].ferry?.selectedSeats?.map(
                        (seat: any) => ({
                          seatNumber:
                            seat.number ||
                            seat.seatNumber ||
                            seat ||
                            "Auto-assigned",
                          seatId: seat.id || seat.seatId || "",
                          passengerName: "",
                        })
                      ) ||
                      bookingData.items[0].selectedSeats?.map((seat: any) => ({
                        seatNumber:
                          seat.number ||
                          seat.seatNumber ||
                          seat ||
                          "Auto-assigned",
                        seatId: seat.id || seat.seatId || "",
                        passengerName: "",
                      })) ||
                      [],
                    providerBooking: {
                      pnr: "",
                      operatorBookingId: "",
                      bookingStatus: "pending",
                      providerResponse: "",
                      errorMessage: "",
                    },
                    totalPrice:
                      bookingData.items[0].totalPrice ||
                      bookingData.totalPrice ||
                      0,
                  },
                ]
              : [],

          passengers:
            bookingData.members?.map((member: any, memberIndex: number) => ({
              isPrimary: memberIndex === 0,
              fullName: member.fullName,
              age: member.age,
              gender: member.gender,
              nationality: member.nationality || "Indian",
              passportNumber: member.passportNumber || "",
              whatsappNumber:
                memberIndex === 0
                  ? bookingData.contactDetails?.whatsapp ||
                    bookingData.customerPhone ||
                    member.whatsappNumber
                  : member.whatsappNumber,
              email:
                memberIndex === 0
                  ? bookingData.contactDetails?.email ||
                    bookingData.customerEmail ||
                    member.email
                  : member.email,
              assignedActivities:
                bookingData.bookingType === "ferry"
                  ? []
                  : bookingData.items?.map((item: any, itemIndex: number) => ({
                      activityIndex: itemIndex,
                    })) || [],
            })) || [],

          pricing: {
            subtotal: bookingData.totalPrice,
            taxes: 0,
            fees: 0,
            totalAmount: bookingData.totalPrice,
            currency: "INR",
          },
          status: "confirmed",
          paymentStatus: "paid",
          paymentTransactions: [paymentRecord.id],
          termsAccepted: bookingData.termsAccepted || false,
          communicationPreferences: {
            sendWhatsAppUpdates: true,
            sendEmailUpdates: true,
            language: "en",
          },
        },
      });

      // Handle ferry provider booking if this is a ferry booking
      let providerBookingResult = null;
      if (bookingData.bookingType === "ferry" && bookingData.items?.[0]) {
        try {
          const ferryItem = bookingData.items[0];

          // Use the correct ferry ID, not the session ID
          const actualFerryId = ferryItem.ferryId || ferryItem.ferry?.ferryId;
          if (!actualFerryId) {
            throw new Error(
              `Ferry ID not found in booking data. Session ID: ${ferryItem.id}. ` +
                `Expected ferryItem.ferryId or ferryItem.ferry.ferryId to contain the actual ferry ID. ` +
                `Available properties: ${Object.keys(ferryItem).join(", ")}`
            );
          }

          // Debug ferry data structure
          console.log("Ferry item structure for location mapping:", {
            ferryOperator: ferryItem.ferry?.operator,
            routeFrom: ferryItem.ferry?.route?.from,
            routeTo: ferryItem.ferry?.route?.to,
            fromLocation: ferryItem.ferry?.fromLocation,
            toLocation: ferryItem.ferry?.toLocation,
            fullFerryObject: ferryItem.ferry
          });

          const bookingRequest = {
            operator: ferryItem.ferry?.operator || "unknown",
            ferryId: actualFerryId,
            fromLocation: ferryItem.ferry?.route?.from?.name || ferryItem.ferry?.fromLocation || ferryItem.ferry?.from || "",
            toLocation: ferryItem.ferry?.route?.to?.name || ferryItem.ferry?.toLocation || ferryItem.ferry?.to || "",
            date: ferryItem.date,
            time: ferryItem.time,
            classId:
              ferryItem.ferry?.selectedClass?.classId ||
              ferryItem.ferry?.selectedClass?.id ||
              "",
            routeId: ferryItem.ferry?.routeData?.routeId || "1",
            passengers: {
              adults: (bookingData.members || []).filter((m: any) => m.age >= 2).length,
              children: 0, // Always 0 in streamlined model
              infants: (bookingData.members || []).filter((m: any) => m.age < 2).length
            },
            selectedSeats: ferryItem.ferry?.selectedSeats || [],
            passengerDetails: bookingData.members || [],
            paymentReference: razorpay_payment_id,
            totalAmount: bookingData.totalPrice,
          };

          console.log("🚢 Initiating ferry provider booking:", {
            operator: bookingRequest.operator,
            ferryId: bookingRequest.ferryId,
            passengers: bookingRequest.passengers,
            seats: bookingRequest.selectedSeats?.length || 0,
            paymentRef: razorpay_payment_id,
          });

          // Ferry booking with timeout
          const FERRY_BOOKING_TIMEOUT = 75000; // 75 seconds
          const ferryBookingPromise = FerryBookingService.bookFerry(
            bookingRequest as any
          );
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Ferry booking process timeout")),
              FERRY_BOOKING_TIMEOUT
            )
          );

          try {
            providerBookingResult = await Promise.race([
              ferryBookingPromise,
              timeoutPromise,
            ]);
          } catch (timeoutError: any) {
            if (timeoutError.message.includes("timeout")) {
              console.warn(
                `⏱️ Ferry booking process timed out after ${
                  FERRY_BOOKING_TIMEOUT / 1000
                } seconds`
              );
              providerBookingResult = {
                success: false,
                error:
                  "Ferry booking timed out. Your payment was successful, but the ferry booking is still processing.",
                errorType: "timeout",
                shouldRetry: false,
              };
            } else {
              throw timeoutError;
            }
          }

          // Handle booking results and update records
          if (!providerBookingResult.success) {
            console.error("❌ Ferry provider booking failed:", {
              error: providerBookingResult.error,
              errorType: (providerBookingResult as any).errorType,
            });

            // Update booking record with error details
            const currentBooking = await payload.findByID({
              collection: "bookings",
              id: bookingRecord.id,
            });

            if (
              currentBooking.bookedFerries &&
              currentBooking.bookedFerries.length > 0
            ) {
              const updatedFerries = [...currentBooking.bookedFerries];
              let bookingStatus: "failed" | "pending" = "failed";
              let errorMessage =
                providerBookingResult.error || "Provider booking failed";

              if ((providerBookingResult as any).errorType === "timeout") {
                bookingStatus = "pending";
                errorMessage = "Booking timed out - may still be processing";
              }

              updatedFerries[0] = {
                ...updatedFerries[0],
                providerBooking: {
                  ...updatedFerries[0].providerBooking,
                  bookingStatus,
                  errorMessage,
                },
              };

              await payload.update({
                collection: "bookings",
                id: bookingRecord.id,
                data: {
                  bookedFerries: updatedFerries,
                  status: "confirmed",
                  internalNotes: `Ferry booking failed: ${errorMessage} (${new Date().toISOString()})`,
                },
              });
            }
          } else {
            // Handle successful ferry booking
            console.log("✅ Ferry provider booking successful:", {
              providerBookingId: providerBookingResult.providerBookingId,
              pnr: providerBookingResult.confirmationDetails?.pnr,
            });

            const currentBooking = await payload.findByID({
              collection: "bookings",
              id: bookingRecord.id,
            });

            if (
              currentBooking.bookedFerries &&
              currentBooking.bookedFerries.length > 0
            ) {
              const updatedFerries = [...currentBooking.bookedFerries];
              const confirmationDetails =
                providerBookingResult.confirmationDetails;

              updatedFerries[0] = {
                ...updatedFerries[0],
                providerBooking: {
                  ...updatedFerries[0].providerBooking,
                  bookingStatus: "confirmed" as const,
                  pnr:
                    confirmationDetails?.pnr ||
                    providerBookingResult.providerBookingId,
                  operatorBookingId: providerBookingResult.providerBookingId,
                  providerResponse: JSON.stringify({
                    operator: confirmationDetails?.operator,
                    pnr: confirmationDetails?.pnr,
                    totalAmount: confirmationDetails?.totalAmount,
                  }),
                },
              };

              await payload.update({
                collection: "bookings",
                id: bookingRecord.id,
                data: {
                  bookedFerries: updatedFerries,
                  status: "confirmed",
                  internalNotes: `Ferry booking confirmed: PNR ${
                    confirmationDetails?.pnr ||
                    providerBookingResult.providerBookingId
                  } (${new Date().toISOString()})`,
                },
              });
            }
          }
        } catch (error) {
          console.error("❌ Ferry booking service error:", error);
          providerBookingResult = {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            errorType: "service_error",
            shouldRetry: false,
          };
        }
      }

      // Update payment record with booking reference
      await payload.update({
        collection: "payments",
        id: paymentRecord.id,
        data: {
          // bookingReference: bookingRecord.id,
          gatewayResponse: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            verified_at: new Date().toISOString(),
            ...(providerBookingResult && {
              ferryProviderBooking: {
                success: providerBookingResult.success,
                providerBookingId: providerBookingResult.providerBookingId,
                error: providerBookingResult.error,
              },
            }),
          },
        },
      });

      // Send booking confirmation notifications
      try {
        if (bookingRecord.customerInfo?.customerEmail) {
          const notificationStatus = (providerBookingResult?.success !== false) ? "confirmation" : "issue";
          console.log(`Sending booking ${notificationStatus} notification...`);

          const formatPhoneNumber = (phone: string): string => {
            if (!phone) return "";
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
            if (cleanPhone.startsWith("+91")) return cleanPhone;
            if (cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone)) {
              return "+91" + cleanPhone;
            }
            return phone;
          };

          const emailData: BookingConfirmationData = {
            bookingId: bookingRecord.bookingId || "",
            confirmationNumber: bookingRecord.confirmationNumber || "",
            customerName: bookingRecord.customerInfo.primaryContactName,
            customerEmail: bookingRecord.customerInfo.customerEmail,
            bookingDate: bookingRecord.bookingDate || "",
            serviceDate: getServiceDate(bookingData),
            totalAmount: bookingRecord.pricing.totalAmount,
            currency: bookingRecord.pricing.currency || "INR",
            bookingType: bookingData.bookingType || "mixed",
            items:
              bookingData.items?.map((item: any) => ({
                title:
                  item.title ||
                  (item.ferry?.ferryName
                    ? `Ferry: ${item.ferry.ferryName}`
                    : item.activity?.title || "Booking Item"),
                date: item.date || "",
                time: item.time || "",
                location: item.ferry
                  ? `${item.ferry.fromLocation} → ${item.ferry.toLocation}`
                  : item.activity?.coreInfo?.location?.[0]?.name,
                passengers: item.passengers
                  ? (item.passengers.adults || 0) +
                    (item.passengers.children || 0) +
                    (item.passengers.infants || 0)
                  : undefined,
              })) || [],
            passengers:
              bookingData.members?.map((member: any) => ({
                fullName: member.fullName,
                age: member.age,
                gender: member.gender,
              })) || [],
            specialRequests: bookingData.specialRequests,
            contactPhone: formatPhoneNumber(
              bookingRecord.customerInfo.customerPhone
            ),
          };

          const formattedPhone = formatPhoneNumber(
            bookingRecord.customerInfo.customerPhone
          );
          const hasValidPhone = !!(
            formattedPhone && formattedPhone.match(/^\+91[6-9]\d{9}$/)
          );

          const notificationResult =
            await notificationManager.sendBookingConfirmation(
              emailData,
              {
                email: bookingRecord.customerInfo.customerEmail,
                phone: hasValidPhone ? formattedPhone : undefined,
              },
              {
                sendEmailUpdates: true,
                sendWhatsAppUpdates: hasValidPhone,
                language: "en",
              }
            );

          if (notificationResult.email?.success) {
            console.log("Booking confirmation email sent successfully");
          } else {
            console.error(
              "Failed to send booking confirmation email:",
              notificationResult.email?.error
            );
          }

          if (hasValidPhone) {
            if (notificationResult.whatsapp?.success) {
              console.log("Booking confirmation WhatsApp sent successfully");
            } else {
              console.error(
                "Failed to send booking confirmation WhatsApp:",
                notificationResult.whatsapp?.error
              );
            }
          }
        } else {
          console.warn("No customer email found, skipping confirmation email");
        }
      } catch (emailError) {
        console.error("Email service error:", emailError);
        // Don't fail the booking process for email errors
      }

      // REMOVED: BookingSessions collection is deprecated
      // Future: Use PNR-based booking lookup instead

      console.log("Booking created successfully:", {
        bookingId: bookingRecord.bookingId,
        confirmationNumber: bookingRecord.confirmationNumber,
        paymentId: paymentRecord.transactionId,
      });

      // Determine overall booking status based on provider booking result
      const isProviderBookingRequired = bookingData.bookingType === "ferry";
      const isProviderBookingSuccessful = providerBookingResult?.success === true;
      
      // For ferry bookings, the overall success depends on provider booking
      const overallSuccess = !isProviderBookingRequired || isProviderBookingSuccessful;
      
      // Determine appropriate message and status
      let responseMessage: string;
      let bookingStatus: "confirmed" | "failed" | "pending";
      
      if (!isProviderBookingRequired) {
        // Non-ferry bookings (activities, boats) - payment success = booking success
        responseMessage = "Payment verified and booking confirmed successfully!";
        bookingStatus = "confirmed";
      } else if (isProviderBookingSuccessful) {
        // Ferry booking successful
        responseMessage = "Payment verified and ferry booking confirmed successfully!";
        bookingStatus = "confirmed";
      } else if ((providerBookingResult as any)?.errorType === "timeout") {
        // Ferry booking timed out - may still be processing
        responseMessage = "Payment successful but ferry booking is still processing. You will receive confirmation shortly.";
        bookingStatus = "pending";
      } else {
        // Ferry booking failed - categorize the error
        const errorMessage = providerBookingResult?.error || "Ferry booking failed";
        const errorType = (providerBookingResult as any)?.errorType || "unknown";
        
        // Categorize specific error types for better user messaging
        if (errorMessage.toLowerCase().includes("seats not available") || 
            errorMessage.toLowerCase().includes("seat") ||
            errorMessage.toLowerCase().includes("already booked")) {
          responseMessage = `Payment successful but selected seats are no longer available. Our team will help you with alternative seats or provide a full refund.`;
          bookingStatus = "failed";
        } else if (errorMessage.toLowerCase().includes("wallet balance") || 
                   errorMessage.toLowerCase().includes("insufficient") ||
                   errorMessage.toLowerCase().includes("balance")) {
          responseMessage = `Payment successful but there's a temporary issue with the ferry operator's system. Your booking will be processed shortly and you'll receive confirmation.`;
          bookingStatus = "pending";
        } else if (errorMessage.toLowerCase().includes("save passengers failed")) {
          responseMessage = `Payment successful but there was an issue processing passenger details. Our team will contact you to complete the booking.`;
          bookingStatus = "failed";
        } else {
          responseMessage = `Payment successful but ferry booking failed: ${errorMessage}. Our team will contact you for assistance.`;
          bookingStatus = "failed";
        }
      }

      return NextResponse.json({
        success: overallSuccess,
        message: responseMessage,
        booking: {
          bookingId: bookingRecord.bookingId,
          confirmationNumber: bookingRecord.confirmationNumber,
          status: bookingStatus,
          paymentStatus: bookingRecord.paymentStatus,
          totalAmount: bookingRecord.pricing.totalAmount,
          providerBooking: providerBookingResult
            ? {
                success: providerBookingResult.success,
                providerBookingId: providerBookingResult.providerBookingId,
                error: providerBookingResult.error,
                errorType: (providerBookingResult as any).errorType,
              }
            : null,
        },
        payment: {
          transactionId: paymentRecord.transactionId,
          status: paymentRecord.status,
        },
      });
    } catch (dbError) {
      console.error("Database operation failed:", dbError);

      return NextResponse.json(
        {
          error: "Failed to create booking record",
          details:
            dbError instanceof Error ? dbError.message : "Database error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
