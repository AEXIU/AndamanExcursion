// src/app/api/payments/phonepe/redirect-handler/route.ts
// Handles POST redirect from PhonePe after payment completion

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // PhonePe sends transaction data in the POST body
    const formData = await req.formData();
    const merchantTransactionId = formData.get("transactionId") || formData.get("merchantTransactionId");
    
    console.log("PhonePe redirect POST received:", {
      merchantTransactionId,
      allFormData: Object.fromEntries(formData.entries()),
    });

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${req.headers.get("host")}`;
    
    // Redirect to client-side return page with transaction ID
    const returnUrl = new URL("/checkout/payment-return", baseUrl);
    if (merchantTransactionId) {
      returnUrl.searchParams.set("merchantTransactionId", merchantTransactionId.toString());
    }

    // Redirect user to client page for status checking
    return NextResponse.redirect(returnUrl.toString());
  } catch (error: any) {
    console.error("PhonePe redirect handler error:", error);
    
    // Redirect to checkout with error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const errorUrl = new URL("/checkout?step=2&error=payment-redirect-failed", baseUrl);
    return NextResponse.redirect(errorUrl.toString());
  }
}

// Also handle GET for testing
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const merchantTransactionId = searchParams.get("merchantTransactionId");
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${req.headers.get("host")}`;
  const returnUrl = new URL("/checkout/payment-return", baseUrl);
  
  if (merchantTransactionId) {
    returnUrl.searchParams.set("merchantTransactionId", merchantTransactionId);
  }
  
  return NextResponse.redirect(returnUrl.toString());
}
