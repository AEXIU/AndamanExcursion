// src/app/api/payments/phonepe/refund/route.ts
// PhonePe Refund API — Initiate and check refund status

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { phonePeServiceV2 } from "@/services/payments/phonePeServiceV2";

/**
 * POST - Initiate a refund for a payment
 * Body: { merchantOrderId, amount?, reason? }
 * If amount is omitted, full refund is issued based on the payment record.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantOrderId, amount, reason } = body;

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: "merchantOrderId is required" },
        { status: 400 }
      );
    }

    // Look up payment record
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

    // Prevent duplicate refunds
    if (paymentRecord.status === "refunded") {
      return NextResponse.json(
        { success: false, error: "Payment has already been refunded" },
        { status: 409 }
      );
    }

    // Only allow refunds on successful payments
    if (paymentRecord.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot refund a payment with status: ${paymentRecord.status}`,
        },
        { status: 400 }
      );
    }

    // Calculate refund amount: use provided amount or full payment amount
    // Payment amount is stored in paise, convert to rupees for the service
    const refundAmountRupees = amount || (paymentRecord.amount / 100);

    console.log("Initiating refund:", {
      merchantOrderId,
      refundAmountRupees,
      originalAmountPaise: paymentRecord.amount,
      reason,
    });

    // Call PhonePe refund API
    const refundResult = await phonePeServiceV2.initiateRefund({
      merchantOrderId,
      amount: refundAmountRupees,
      reason: reason || "Customer requested refund",
    });

    // Update payment record with refund details
    await payload.update({
      collection: "payments",
      id: paymentRecord.id,
      data: {
        status: refundResult.success ? "refunded" : paymentRecord.status,
        refundDetails: {
          refundId: refundResult.refundId || "",
          refundAmount: Math.round(refundAmountRupees * 100), // Store in paise
          refundStatus: refundResult.success ? "initiated" : "failed",
          refundReason: reason || "Customer requested refund",
          refundedAt: new Date().toISOString(),
        },
      },
    });

    console.log("Refund processed:", {
      merchantOrderId,
      refundId: refundResult.refundId,
      success: refundResult.success,
      state: refundResult.state,
    });

    return NextResponse.json({
      success: refundResult.success,
      refundId: refundResult.refundId,
      state: refundResult.state,
      amount: refundAmountRupees,
      message: refundResult.message,
    });
  } catch (error: any) {
    console.error("Refund API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Refund processing failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check refund status for an order
 * Query: ?merchantOrderId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const merchantOrderId = req.nextUrl.searchParams.get("merchantOrderId");

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: "merchantOrderId is required" },
        { status: 400 }
      );
    }

    // Check refund status with PhonePe
    const statusResult = await phonePeServiceV2.checkRefundStatus(merchantOrderId);

    // Also fetch local payment record for refund details
    const payload = await getPayload({ config });
    const paymentRecords = await payload.find({
      collection: "payments",
      where: {
        "phonepeData.merchantOrderId": { equals: merchantOrderId },
      },
      limit: 1,
    });

    const localRefundDetails = paymentRecords.docs?.[0]?.refundDetails || null;

    return NextResponse.json({
      success: statusResult.success,
      state: statusResult.state,
      orderId: statusResult.orderId,
      refundDetails: statusResult.refundDetails,
      localRefundDetails,
    });
  } catch (error: any) {
    console.error("Refund status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Refund status check failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
