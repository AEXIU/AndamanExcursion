// src/app/api/payments/phonepe/callback/route.ts
// PhonePe Callback Handler — Updated for v2 API compatibility

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { phonePeServiceV2 } from "@/services/payments/phonePeServiceV2";

/**
 * PhonePe Callback Handler
 *
 * This endpoint receives asynchronous notifications from PhonePe
 * about payment status changes. It's a backup mechanism - the main
 * booking processing happens in the status check API after redirect.
 *
 * This handler just updates payment records and logs events.
 */
export async function POST(req: NextRequest) {
  try {
    const responseBody = await req.text();

    console.log("PhonePe callback received:", {
      bodyLength: responseBody.length,
    });

    let bodyData;
    try {
      bodyData = JSON.parse(responseBody);
    } catch (parseError) {
      console.error("Failed to parse callback body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Extract base64 response and signature
    const base64Response = bodyData?.response || responseBody;
    const xVerifyHeader = req.headers.get("X-VERIFY") || req.headers.get("x-verify") || bodyData?.["x-verify"];

    if (!xVerifyHeader) {
      console.error("Missing X-VERIFY / x-verify header in callback");
      return NextResponse.json(
        { error: "Missing verification header" },
        { status: 401 }
      );
    }

    // Verify signature using the v2 service (supports both v1 and v2 formats)
    const isValid = phonePeServiceV2.validateCallback(base64Response, xVerifyHeader);

    if (!isValid) {
      console.error("Invalid PhonePe callback signature");
      return NextResponse.json(
        { error: "Invalid callback signature" },
        { status: 401 }
      );
    }

    console.log("Callback signature validated successfully");

    // Decode the response if it's base64
    let callbackPayload;
    try {
      const decoded = Buffer.from(base64Response, "base64").toString("utf-8");
      callbackPayload = JSON.parse(decoded);
    } catch {
      // If not base64, use the parsed body directly
      callbackPayload = bodyData;
    }

    const merchantOrderId =
      callbackPayload?.data?.merchantTransactionId ||
      callbackPayload?.payload?.merchantOrderId ||
      bodyData?.payload?.merchantOrderId;

    const state =
      callbackPayload?.data?.state ||
      callbackPayload?.payload?.state ||
      bodyData?.payload?.state;

    const phonepeTransactionId =
      callbackPayload?.data?.transactionId ||
      callbackPayload?.payload?.phonepeTransactionId;

    if (!merchantOrderId) {
      console.error("Callback missing merchant order ID");
      return NextResponse.json(
        { error: "Missing merchant order ID" },
        { status: 400 }
      );
    }

    console.log("Callback data extracted:", {
      merchantOrderId,
      state,
      phonepeTransactionId,
    });

    // Update payment record with callback data
    const payload = await getPayload({ config });

    const paymentRecords = await payload.find({
      collection: "payments",
      where: {
        "phonepeData.merchantOrderId": { equals: merchantOrderId },
      },
      limit: 1,
    });

    if (paymentRecords.docs && paymentRecords.docs.length > 0) {
      const paymentRecord = paymentRecords.docs[0];

      // Update payment record with callback data (must update entire nested object)
      const updatedPhonepeData = {
        ...(paymentRecord.phonepeData || {}),
        phonepeTransactionId: phonepeTransactionId,
        callbackData: JSON.stringify(callbackPayload),
        callbackReceivedAt: new Date().toISOString(),
      };

      await payload.update({
        collection: "payments",
        id: paymentRecord.id,
        data: {
          status:
            state === "SUCCESS" || state === "COMPLETED"
              ? "success"
              : state === "FAILED"
              ? "failed"
              : "pending",
          phonepeData: updatedPhonepeData,
        },
      });

      console.log("Payment record updated from callback:", {
        orderId: merchantOrderId,
        status: state,
      });
    } else {
      console.warn("Payment record not found for callback:", merchantOrderId);
    }

    // Always return 200 OK to PhonePe
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("PhonePe callback handling error:", error.message);

    // Still return 200 to prevent PhonePe from retrying
    return NextResponse.json(
      {
        success: false,
        error: "Internal error",
        logged: true,
      },
      { status: 200 }
    );
  }
}
