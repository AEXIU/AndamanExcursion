// src/app/api/payments/phonepe/webhook/route.ts
// PhonePe Webhook Handler - Receives payment status updates from PhonePe

import { NextRequest, NextResponse } from "next/server";
import { phonePeServiceV2 } from "@/services/payments/phonePeServiceV2";
import { getPayload } from "payload";
import config from "@payload-config";
import crypto from "crypto";

/**
 * PhonePe Webhook Handler
 * 
 * PhonePe sends payment status updates to this endpoint.
 * This is crucial for production as it provides real-time payment updates
 * without requiring the user to return to your site.
 * 
 * @see https://developer.phonepe.com/v1/reference/server-to-server-callback
 */
export async function POST(req: NextRequest) {
  try {
    console.log("📥 PhonePe webhook received");

    // Get the raw body for signature verification
    const body = await req.text();
    
    // Parse the JSON body
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (e) {
      console.error("Failed to parse webhook body:", e);
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    // PhonePe sends data in this format:
    // {
    //   "response": "base64_encoded_response",
    //   "x-verify": "signature"
    // }
    const base64Response = webhookData.response;
    const receivedSignature = req.headers.get("x-verify") || webhookData["x-verify"];

    if (!base64Response || !receivedSignature) {
      console.error("Missing response or signature in webhook");
      return NextResponse.json(
        { success: false, error: "Invalid webhook format" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(base64Response, receivedSignature);
    
    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("✅ Webhook signature verified");

    // Decode the base64 response
    const decodedResponse = Buffer.from(base64Response, "base64").toString("utf-8");
    const paymentData = JSON.parse(decodedResponse);

    console.log("PhonePe webhook data:", {
      merchantOrderId: paymentData.data?.merchantTransactionId,
      state: paymentData.data?.state,
      orderId: paymentData.data?.transactionId,
      amount: paymentData.data?.amount,
    });

    // Extract payment info
    const merchantOrderId = paymentData.data?.merchantTransactionId;
    const paymentState = paymentData.data?.state;
    const phonePeOrderId = paymentData.data?.transactionId;

    if (!merchantOrderId) {
      console.error("No merchant order ID in webhook data");
      return NextResponse.json(
        { success: false, error: "Missing merchant order ID" },
        { status: 400 }
      );
    }

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
      console.error("Payment record not found for:", merchantOrderId);
      // Still return success to PhonePe to avoid retries
      return NextResponse.json({
        success: true,
        message: "Payment record not found",
      });
    }

    const paymentRecord = paymentRecords.docs[0];

    // Update payment record with webhook data
    const existingPhonepeData = (paymentRecord as any).phonepeData || {};

    await payload.update({
      collection: "payments",
      id: paymentRecord.id,
      data: {
        status:
          paymentState === "SUCCESS" || paymentState === "COMPLETED"
            ? "success"
            : paymentState === "FAILED"
            ? "failed"
            : "pending",
        phonepeData: {
          ...existingPhonepeData,
          phonepeTransactionId: phonePeOrderId,
          webhookData: JSON.stringify(paymentData),
          webhookReceivedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`✅ Payment record updated via webhook: ${merchantOrderId}`);

    // If payment is successful and booking hasn't been processed yet
    if (
      (paymentState === "SUCCESS" || paymentState === "COMPLETED") &&
      paymentRecord.status !== "success"
    ) {
      console.log("Payment successful via webhook, triggering booking processing");

      // Trigger the status check endpoint to process the booking
      // This reuses existing logic instead of duplicating it
      try {
        const statusCheckUrl = new URL(
          `/api/payments/phonepe/status?merchantTransactionId=${merchantOrderId}`,
          req.url
        );

        await fetch(statusCheckUrl.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("✅ Booking processing triggered via status check");
      } catch (error) {
        console.error("Failed to trigger booking processing:", error);
        // Don't fail the webhook response
      }
    }

    // Always return success to PhonePe to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error: any) {
    console.error("❌ PhonePe webhook error:", error);

    // Always return success to PhonePe to avoid retries
    // Log the error internally for investigation
    return NextResponse.json({
      success: true,
      message: "Webhook received",
    });
  }
}

/**
 * Verify PhonePe webhook signature
 * 
 * PhonePe signs webhook payloads using HMAC-SHA256 with your salt key.
 * Formula: SHA256(base64Response + "/pg/v1/pay" + saltKey) + "###" + saltIndex
 * 
 * @param base64Response - Base64 encoded response from PhonePe
 * @param receivedSignature - Signature from PhonePe webhook
 * @returns boolean - True if signature is valid
 */
function verifyWebhookSignature(
  base64Response: string,
  receivedSignature: string
): boolean {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

  if (!saltKey) {
    console.error("PHONEPE_SALT_KEY not configured");
    return false;
  }

  try {
    // Try multiple endpoint paths for v1/v2 compatibility
    const endpoints = ["/pg/v1/pay", "/pg/v1/callback", "/pg/v2/pay"];

    for (const endpoint of endpoints) {
      const stringToHash = base64Response + endpoint + saltKey;
      const calculatedHash = crypto
        .createHash("sha256")
        .update(stringToHash)
        .digest("hex");

      const expectedSignature = `${calculatedHash}###${saltIndex}`;

      if (expectedSignature === receivedSignature) {
        return true;
      }
    }

    // In dev mode, allow through with a warning
    if (process.env.PHONEPE_DEV_MODE === "true") {
      console.warn("⚠️ Webhook signature mismatch in dev mode — allowing anyway");
      return true;
    }

    console.error("Webhook signature mismatch — none of the endpoint paths matched");
    return false;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Health check endpoint for webhook URL verification
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "PhonePe webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
