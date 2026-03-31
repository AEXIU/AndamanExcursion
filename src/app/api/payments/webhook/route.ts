// ==========================================
// ARCHIVED - REPLACED BY PHONEPE
// This Razorpay webhook route is no longer active
// Active webhook handling now uses PhonePe
// See: src/app/api/payments/phonepe/callback/route.ts
// ==========================================

// app/api/payments/webhook/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import { notificationManager } from "@/services/notifications/NotificationManager";
import type {
  BookingStatusUpdateData,
  PaymentFailedData,
} from "@/services/notifications/channels/base";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Webhook signature missing");
      return NextResponse.json({ error: "Signature missing" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log(
      "Razorpay webhook event:",
      event.event,
      event.payload?.payment?.entity?.id
    );

    const payload = await getPayload({ config });

    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity, payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity, payload);
        break;

      case "order.paid":
        await handleOrderPaid(
          event.payload.order.entity,
          event.payload.payment.entity,
          payload
        );
        break;

      case "refund.created":
        await handleRefundCreated(event.payload.refund.entity, payload);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(paymentEntity: any, payload: any) {
  try {
    // Find payment record by Razorpay payment ID
    const payments = await payload.find({
      collection: "payments",
      where: {
        "razorpayData.razorpayPaymentId": {
          equals: paymentEntity.id,
        },
      },
      limit: 1,
    });

    if (payments.docs.length === 0) {
      console.error(
        "Payment record not found for payment ID:",
        paymentEntity.id
      );
      return;
    }

    const paymentRecord = payments.docs[0];

    // Update payment record with additional details
    await payload.update({
      collection: "payments",
      id: paymentRecord.id,
      data: {
        status: "success",
        paymentMethod: paymentEntity.method || "unknown",
        paymentDate: new Date(paymentEntity.created_at * 1000).toISOString(),
        amount: paymentEntity.amount,
        razorpayData: {
          ...paymentRecord.razorpayData,
          razorpayWebhookData: paymentEntity,
        },
        gatewayResponse: {
          ...paymentRecord.gatewayResponse,
          webhook_captured_at: new Date().toISOString(),
          payment_method: paymentEntity.method,
          bank: paymentEntity.bank,
          card_id: paymentEntity.card_id,
          vpa: paymentEntity.vpa,
        },
      },
    });

    // Update associated booking status if needed
    if (paymentRecord.bookingReference) {
      // Get current booking to check status before update
      const currentBooking = await payload.findByID({
        collection: "bookings",
        id: paymentRecord.bookingReference,
      });

      const oldStatus = currentBooking.status;

      await payload.update({
        collection: "bookings",
        id: paymentRecord.bookingReference,
        data: {
          paymentStatus: "paid",
          status: "confirmed",
        },
      });

      // Send status update email if status changed
      if (
        oldStatus !== "confirmed" &&
        currentBooking.customerInfo?.customerEmail
      ) {
        try {
          console.log(
            "Sending booking status update email (payment captured)..."
          );

          const statusUpdateData: BookingStatusUpdateData = {
            bookingId: currentBooking.bookingId,
            confirmationNumber: currentBooking.confirmationNumber,
            customerName: currentBooking.customerInfo.primaryContactName,
            customerEmail: currentBooking.customerInfo.customerEmail,
            oldStatus: oldStatus,
            newStatus: "confirmed",
            message:
              "Your payment has been processed successfully and your booking is now confirmed!",
            updateDate: new Date().toISOString(),
          };

          const emailResult = await notificationManager.sendBookingStatusUpdate(
            statusUpdateData,
            { email: currentBooking.customerInfo.customerEmail },
            {
              sendEmailUpdates: true,
              sendWhatsAppUpdates: false,
              language: "en",
            }
          );

          if (!emailResult.email?.success) {
            console.error(
              "Failed to send status update email:",
              emailResult.email?.error
            );
            // Log to booking record for admin visibility
            await payload.update({
              collection: "bookings",
              id: paymentRecord.bookingReference,
              data: {
                internalNotes: `${
                  currentBooking.internalNotes || ""
                }\nStatus update email failed: ${emailResult.email?.error}`,
              },
            });
          }
        } catch (emailError) {
          console.error("Status update email service error:", emailError);
        }
      }
    }

    console.log("Payment captured successfully updated:", paymentEntity.id);
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

async function handlePaymentFailed(paymentEntity: any, payload: any) {
  try {
    // Find payment record by Razorpay order ID
    const payments = await payload.find({
      collection: "payments",
      where: {
        "razorpayData.razorpayOrderId": {
          equals: paymentEntity.order_id,
        },
      },
      limit: 1,
    });

    if (payments.docs.length === 0) {
      console.error(
        "Payment record not found for order ID:",
        paymentEntity.order_id
      );
      return;
    }

    const paymentRecord = payments.docs[0];

    // Update payment record
    await payload.update({
      collection: "payments",
      id: paymentRecord.id,
      data: {
        status: "failed",
        paymentMethod: paymentEntity.method || "unknown",
        paymentDate: new Date(paymentEntity.created_at * 1000).toISOString(),
        amount: paymentEntity.amount,
        razorpayData: {
          ...paymentRecord.razorpayData,
          razorpayWebhookData: paymentEntity,
          failureReason: paymentEntity.error_reason,
          failureDescription: paymentEntity.error_description,
        },
        gatewayResponse: {
          ...paymentRecord.gatewayResponse,
          webhook_failed_at: new Date().toISOString(),
          error_code: paymentEntity.error_code,
          error_reason: paymentEntity.error_reason,
          error_description: paymentEntity.error_description,
        },
      },
    });

    // Update associated booking status and send email
    if (paymentRecord.bookingReference) {
      const booking = await payload.findByID({
        collection: "bookings",
        id: paymentRecord.bookingReference,
      });

      await payload.update({
        collection: "bookings",
        id: paymentRecord.bookingReference,
        data: {
          paymentStatus: "failed",
          status: "pending", // Keep as pending to allow retry
        },
      });

      // Send payment failed email
      if (booking.customerInfo?.customerEmail) {
        try {
          console.log("Sending payment failed notification email...");
          const paymentFailedData: PaymentFailedData = {
            customerEmail: booking.customerInfo.customerEmail,
            customerName: booking.customerInfo.primaryContactName,
            attemptedAmount: paymentEntity.amount / 100, // Convert from paisa to rupees
            failureReason:
              paymentEntity.error_description || paymentEntity.error_reason,
            bookingType: booking.bookingType || "ferry",
            currency: "INR",
          };

          const emailResult =
            await notificationManager.sendPaymentFailedNotification(
              paymentFailedData
            );

          if (!emailResult.email?.success) {
            console.error(
              "Failed to send payment failed email:",
              emailResult.email?.error
            );
          }
        } catch (emailError) {
          console.error("Payment failed email service error:", emailError);
        }
      }
    }

    console.log("Payment failed successfully updated:", paymentEntity.id);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

async function handleOrderPaid(
  orderEntity: any,
  paymentEntity: any,
  payload: any
) {
  // This is similar to payment.captured but for order-level events
  console.log("Order paid event processed:", orderEntity.id);
}

async function handleRefundCreated(refundEntity: any, payload: any) {
  try {
    // Find payment record by Razorpay payment ID
    const payments = await payload.find({
      collection: "payments",
      where: {
        "razorpayData.razorpayPaymentId": {
          equals: refundEntity.payment_id,
        },
      },
      limit: 1,
    });

    if (payments.docs.length === 0) {
      console.error(
        "Payment record not found for refund payment ID:",
        refundEntity.payment_id
      );
      return;
    }

    const paymentRecord = payments.docs[0];

    // Update payment record with refund details
    await payload.update({
      collection: "payments",
      id: paymentRecord.id,
      data: {
        status:
          refundEntity.amount === paymentRecord.amount
            ? "refunded"
            : "partially_refunded",
        refundDetails: {
          refundId: refundEntity.id,
          refundAmount: refundEntity.amount,
          refundDate: new Date(refundEntity.created_at * 1000).toISOString(),
          refundReason: refundEntity.notes?.reason || "Customer request",
          refundStatus: "processed",
        },
        gatewayResponse: {
          ...paymentRecord.gatewayResponse,
          refund_created_at: new Date().toISOString(),
          refund_id: refundEntity.id,
        },
      },
    });

    // Update associated booking status
    if (paymentRecord.bookingReference) {
      await payload.update({
        collection: "bookings",
        id: paymentRecord.bookingReference,
        data: {
          paymentStatus:
            refundEntity.amount === paymentRecord.amount
              ? "refunded"
              : "partially_refunded",
          status: "cancelled",
        },
      });
    }

    console.log("Refund processed:", refundEntity.id);
  } catch (error) {
    console.error("Error handling refund created:", error);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
