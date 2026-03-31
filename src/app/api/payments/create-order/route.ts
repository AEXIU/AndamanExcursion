// ==========================================
// ARCHIVED - REPLACED BY PHONEPE
// This Razorpay route is no longer active
// Active payment creation now uses PhonePe
// See: src/app/api/payments/phonepe/create-order/route.ts
// ==========================================

// app/api/payments/create-order/route.ts
import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = "INR",
      receipt,
      bookingData,
    } = await request.json();

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount provided" },
        { status: 400 }
      );
    }

    // Get user info from headers
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const forwarded = headersList.get("x-forwarded-for");

    // Fix IP detection for localhost/development
    let ip = forwarded ? forwarded.split(",")[0].trim() : "";

    // If no forwarded IP or localhost, use a dummy Indian IP for testing
    if (
      !ip ||
      ip === "127.0.0.1" ||
      ip === "::ffff:127.0.0.1" ||
      ip === "::1"
    ) {
      ip =
        process.env.NODE_ENV === "development"
          ? "103.21.124.1" // Dummy Indian IP for testing
          : request.headers.get("x-forwarded-for") || "";
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        booking_type: bookingData?.bookingType || "activity",
        activity_count: bookingData?.activities?.length || 0,
        passenger_count: bookingData?.members?.length || 0,
        user_ip: ip,
        user_agent: userAgent.substring(0, 100), // Limit length
        country: "IN", // Explicitly set country
        payment_region: "domestic", // Help with domestic detection
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // Log order creation for debugging
    console.log("Razorpay order created:", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      ip: ip, // Log the IP being used
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
