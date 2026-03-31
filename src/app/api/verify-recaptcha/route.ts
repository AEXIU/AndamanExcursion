import { NextRequest, NextResponse } from "next/server";

interface RecaptchaVerificationResponse {
  success: boolean;
  score?: number;        // v3 only
  action?: string;      // v3 only
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "reCAPTCHA token is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "reCAPTCHA not configured" },
        { status: 500 }
      );
    }

    // Verify token with Google (works for both v2 and v3)
    const verificationResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
        }),
      }
    );

    const result: RecaptchaVerificationResponse = await verificationResponse.json();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "reCAPTCHA verification failed",
          details: result["error-codes"],
        },
        { status: 400 }
      );
    }

    // v2 checkbox: no score — success alone is sufficient
    // v3 invisible: has score, but we're not using v3 here
    return NextResponse.json({
      success: true,
      message: "reCAPTCHA verification successful",
    });
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
