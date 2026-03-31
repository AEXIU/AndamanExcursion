// src/app/api/payments/phonepe/create-order/route.ts
// PhonePe Payment Order Creation - Checkout API v2 (OAuth)

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { phonePeServiceV2 } from "@/services/payments/phonePeServiceV2";

export async function POST(req: NextRequest) {
  try {
    const { amount, bookingData } = await req.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!bookingData) {
      return NextResponse.json(
        { success: false, error: "Booking data is required" },
        { status: 400 }
      );
    }

    // Generate unique merchant order ID
    const merchantOrderId = phonePeServiceV2.generateMerchantOrderId();

    // Build URLs for PhonePe redirect
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    // PhonePe v2: Redirect URL after payment completion
    const redirectUrl = `${baseUrl}/checkout/payment-return?merchantOrderId=${merchantOrderId}`;

    console.log("PhonePe v2 URLs configured:", { baseUrl, redirectUrl });

    console.log("Creating PhonePe v2 payment order:", {
      merchantOrderId,
      amount: amount,
      bookingType: bookingData.bookingType,
    });

    // Initiate payment with PhonePe v2 API (OAuth Checkout)
    const paymentResult = await phonePeServiceV2.initiatePayment({
      amount: amount,
      merchantOrderId: merchantOrderId,
      redirectUrl: redirectUrl,
      metaInfo: {
        udf1: bookingData.bookingType || "booking",
        udf2: bookingData.contactDetails?.email || "",
      },
    });

    if (!paymentResult.success || !paymentResult.redirectUrl) {
      throw new Error("Failed to get checkout URL from PhonePe");
    }

    // Create initial payment record in Payload CMS
    const payload = await getPayload({ config });

    await payload.create({
      collection: "payments",
      data: {
        transactionId: merchantOrderId,
        gateway: "phonepe",
        phonepeData: {
          merchantOrderId: merchantOrderId,
          phonepeTransactionId: paymentResult.orderId || merchantOrderId,
          redirectUrl: redirectUrl,
          checkoutUrl: paymentResult.redirectUrl,
        },
        amount: Math.round(amount * 100),
        status: "pending",
        customerDetails: {
          name: bookingData.contactDetails?.primaryName || "",
          email: bookingData.contactDetails?.email || "",
          phone: bookingData.contactDetails?.whatsapp || "",
        },
        bookingData: bookingData,
        gatewayResponse: {
          provider: "phonepe-v2",
          state: paymentResult.state,
        },
      },
    });

    console.log("PhonePe v2 payment order created successfully:", {
      merchantOrderId,
      phonepeOrderId: paymentResult.orderId,
      hasRedirectUrl: !!paymentResult.redirectUrl,
    });

    return NextResponse.json({
      success: true,
      merchantOrderId: merchantOrderId,
      merchantTransactionId: merchantOrderId, // For backward compatibility
      redirectUrl: paymentResult.redirectUrl, // URL to redirect user to
      amount: amount,
      state: paymentResult.state,
    });
  } catch (error: any) {
    console.error("PhonePe order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Payment initiation failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
