// import Razorpay from "razorpay";
// import crypto from "crypto";
// import { NextRequest, NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { getPayload } from "payload";
// import config from "@/payload.config";
// import { FerryBookingService } from "@/services/ferryServices/ferryBookingService";
// import { notificationManager } from "@/services/notifications/NotificationManager";
// import type {
//   BookingConfirmationData,
//   BookingStatusUpdateData,
//   PaymentFailedData,
// } from "@/services/notifications/channels/base";

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function POST(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const action = searchParams.get("action");

//     switch (action) {
//       case "create-order":
//         return await handleCreateOrder(request);
//       case "verify":
//         return await handleVerifyPayment(request);
//       case "webhook":
//         return await handleWebhook(request);
//       default:
//         return NextResponse.json(
//           { error: "Invalid action. Use: create-order, verify, or webhook" },
//           { status: 400 }
//         );
//     }
//   } catch (error) {
//     console.error("Payments API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// async function handleCreateOrder(request: NextRequest) {
//   try {
//     const {
//       amount,
//       currency = "INR",
//       receipt,
//       bookingData,
//     } = await request.json();

//     // Validate required fields
//     if (!amount || amount <= 0) {
//       return NextResponse.json(
//         { error: "Invalid amount provided" },
//         { status: 400 }
//       );
//     }

//     // Get user info from headers
//     const headersList = await headers();
//     const userAgent = headersList.get("user-agent") || "";
//     const forwarded = headersList.get("x-forwarded-for");

//     // Fix IP detection for localhost/development
//     let ip = forwarded ? forwarded.split(",")[0].trim() : "";

//     // If no forwarded IP or localhost, use a dummy Indian IP for testing
//     if (
//       !ip ||
//       ip === "127.0.0.1" ||
//       ip === "::ffff:127.0.0.1" ||
//       ip === "::1"
//     ) {
//       ip =
//         process.env.NODE_ENV === "development"
//           ? "103.21.124.1" // Dummy Indian IP for testing
//           : request.headers.get("x-forwarded-for") || "";
//     }

//     // Create Razorpay order
//     const orderOptions = {
//       amount: Math.round(amount * 100), // Convert to paise and ensure integer
//       currency,
//       receipt: receipt || `receipt_${Date.now()}`,
//       notes: {
//         booking_type: bookingData?.bookingType || "activity",
//         activity_count: bookingData?.activities?.length || 0,
//         passenger_count: bookingData?.members?.length || 0,
//         user_ip: ip,
//         user_agent: userAgent.substring(0, 100), // Limit length
//         country: "IN", // Explicitly set country
//         payment_region: "domestic", // Help with domestic detection
//       },
//     };

//     const order = await razorpay.orders.create(orderOptions);

//     // Log order creation for debugging
//     console.log("Razorpay order created:", {
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       receipt: order.receipt,
//       ip: ip, // Log the IP being used
//     });

//     return NextResponse.json({
//       success: true,
//       order: {
//         id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         receipt: order.receipt,
//       },
//     });
//   } catch (error) {
//     console.error("Razorpay order creation failed:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to create payment order",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// async function handleVerifyPayment(request: NextRequest) {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingData,
//       sessionId,
//     } = await request.json();

//     // Validate required fields
//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return NextResponse.json(
//         { error: "Missing required payment verification fields" },
//         { status: 400 }
//       );
//     }

//     // Verify Razorpay signature
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//       .update(sign.toString())
//       .digest("hex");

//     if (razorpay_signature !== expectedSign) {
//       console.error("Payment signature verification failed:", {
//         expected: expectedSign,
//         received: razorpay_signature,
//         orderId: razorpay_order_id,
//         paymentId: razorpay_payment_id,
//       });

//       return NextResponse.json(
//         { error: "Payment verification failed - invalid signature" },
//         { status: 400 }
//       );
//     }

//     // Get Payload CMS instance
//     const payload = await getPayload({ config });

//     // Process ferry bookings if applicable
//     if (bookingData.bookingType === "ferry" && bookingData.items?.[0]) {
//       const ferryItem = bookingData.items[0];

//       // Extract ferry ID correctly
//       const actualFerryId = ferryItem.ferryId || ferryItem.ferry?.ferryId;

//       if (!actualFerryId) {
//         console.error(
//           "Ferry ID not found in booking data. Session ID:",
//           sessionId
//         );
//         console.error(
//           "Available ferry item properties:",
//           Object.keys(ferryItem)
//         );
//         throw new Error("Ferry booking data is incomplete - missing ferry ID");
//       }

//       console.log(`🚢 Processing ferry booking for ferry ID: ${actualFerryId}`);

//       try {
//         // TODO: Fix ferry booking service call with proper parameters
//         console.log(
//           "🚢 Ferry booking would be processed here for:",
//           actualFerryId
//         );
//         // const ferryBookingResult = await FerryBookingService.bookFerry(...);
//       } catch (ferryError) {
//         console.error("❌ Ferry booking failed:", ferryError);
//         // Continue with payment processing even if ferry booking fails
//       }
//     }

//     // Create payment and booking records (simplified version)
//     const paymentRecord = await payload.create({
//       collection: "payments",
//       data: {
//         razorpayData: {
//           razorpayOrderId: razorpay_order_id,
//           razorpayPaymentId: razorpay_payment_id,
//           razorpaySignature: razorpay_signature,
//         },
//         amount: bookingData.totalPrice * 100,
//         currency: "INR",
//         paymentMethod: "other",
//         status: "success",
//         paymentDate: new Date().toISOString(),
//         customerDetails: {
//           customerName: bookingData.members?.[0]?.fullName || "",
//           customerEmail: bookingData.members?.[0]?.email || "",
//           customerPhone: bookingData.members?.[0]?.whatsappNumber || "",
//         },
//         gatewayResponse: {
//           razorpay_order_id,
//           razorpay_payment_id,
//           razorpay_signature,
//           verified_at: new Date().toISOString(),
//         },
//       },
//     });

//     // Send confirmation notifications
//     try {
//       // TODO: Fix notification data structure to match interface
//       console.log("📧 Booking confirmation would be sent here");
//       // await notificationManager.sendBookingConfirmation(confirmationData);
//     } catch (notificationError) {
//       console.error(
//         "Failed to send confirmation notifications:",
//         notificationError
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Payment verified and booking confirmed successfully!",
//       booking: {
//         // ✅ Wrap in booking object
//         bookingId: paymentRecord.id,
//         confirmationNumber: `AE${Date.now().toString().slice(-6)}`, // ✅ Generate confirmation number
//       },
//       paymentId: razorpay_payment_id,
//     });
//   } catch (error) {
//     console.error("Payment verification error:", error);
//     return NextResponse.json(
//       {
//         error: "Payment verification failed",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// async function handleWebhook(request: NextRequest) {
//   try {
//     const body = await request.text();
//     const signature = request.headers.get("x-razorpay-signature");

//     if (!signature) {
//       console.error("Webhook signature missing");
//       return NextResponse.json({ error: "Signature missing" }, { status: 400 });
//     }

//     // Verify webhook signature
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
//       .update(body)
//       .digest("hex");

//     if (signature !== expectedSignature) {
//       console.error("Webhook signature verification failed");
//       return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
//     }

//     const event = JSON.parse(body);
//     console.log(
//       "Razorpay webhook event:",
//       event.event,
//       event.payload?.payment?.entity?.id
//     );

//     const payload = await getPayload({ config });

//     switch (event.event) {
//       case "payment.captured":
//         await handlePaymentCaptured(event.payload.payment.entity, payload);
//         break;

//       case "payment.failed":
//         await handlePaymentFailed(event.payload.payment.entity, payload);
//         break;

//       case "order.paid":
//         await handleOrderPaid(
//           event.payload.order.entity,
//           event.payload.payment.entity,
//           payload
//         );
//         break;

//       case "refund.created":
//         await handleRefundCreated(event.payload.refund.entity, payload);
//         break;

//       default:
//         console.log("Unhandled webhook event:", event.event);
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Webhook processing error:", error);
//     return NextResponse.json(
//       { error: "Webhook processing failed" },
//       { status: 500 }
//     );
//   }
// }

// // Webhook handler functions (simplified versions)
// async function handlePaymentCaptured(paymentEntity: any, payload: any) {
//   try {
//     const payments = await payload.find({
//       collection: "payments",
//       where: {
//         "razorpayData.razorpayPaymentId": {
//           equals: paymentEntity.id,
//         },
//       },
//       limit: 1,
//     });

//     if (payments.docs.length === 0) {
//       console.error(
//         "Payment record not found for payment ID:",
//         paymentEntity.id
//       );
//       return;
//     }

//     const paymentRecord = payments.docs[0];

//     await payload.update({
//       collection: "payments",
//       id: paymentRecord.id,
//       data: {
//         status: "success",
//         paymentMethod: paymentEntity.method || "unknown",
//         paymentDate: new Date(paymentEntity.created_at * 1000).toISOString(),
//         amount: paymentEntity.amount,
//       },
//     });

//     console.log("Payment captured and updated:", paymentEntity.id);
//   } catch (error) {
//     console.error("Error handling payment captured:", error);
//   }
// }

// async function handlePaymentFailed(paymentEntity: any, payload: any) {
//   try {
//     console.log("Payment failed:", paymentEntity.id);
//     // Handle payment failure logic here
//   } catch (error) {
//     console.error("Error handling payment failed:", error);
//   }
// }

// async function handleOrderPaid(
//   orderEntity: any,
//   paymentEntity: any,
//   payload: any
// ) {
//   try {
//     console.log("Order paid:", orderEntity.id, paymentEntity.id);
//     // Handle order paid logic here
//   } catch (error) {
//     console.error("Error handling order paid:", error);
//   }
// }

// async function handleRefundCreated(refundEntity: any, payload: any) {
//   try {
//     console.log("Refund created:", refundEntity.id);
//     // Handle refund logic here
//   } catch (error) {
//     console.error("Error handling refund created:", error);
//   }
// }

// // Handle CORS preflight requests
// export async function OPTIONS() {
//   return new NextResponse(null, { status: 200 });
// }
