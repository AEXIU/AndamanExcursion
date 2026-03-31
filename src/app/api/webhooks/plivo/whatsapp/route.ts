/**
 * Plivo WhatsApp Webhook Endpoint
 *
 * Receives delivery status callbacks from Plivo for WhatsApp messages.
 * Configure this URL in Plivo Console: https://your-domain.com/api/webhooks/plivo/whatsapp
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      MessageUUID,
      Status,
      From,
      To,
      ErrorCode,
      ErrorMessage,
    } = body;

    console.log("Plivo WhatsApp webhook:", {
      messageUuid: MessageUUID,
      status: Status,
      from: From,
      to: To,
      errorCode: ErrorCode || undefined,
      errorMessage: ErrorMessage || undefined,
    });

    // Handle different delivery statuses
    switch (Status?.toLowerCase()) {
      case "sent":
        console.log(`Message ${MessageUUID} sent to ${To}`);
        break;
      case "delivered":
        console.log(`Message ${MessageUUID} delivered to ${To}`);
        break;
      case "read":
        console.log(`Message ${MessageUUID} read by ${To}`);
        break;
      case "failed":
      case "undelivered":
        console.error(`Message ${MessageUUID} failed:`, {
          to: To,
          errorCode: ErrorCode,
          errorMessage: ErrorMessage,
        });
        break;
      default:
        console.log(`Message ${MessageUUID} status: ${Status}`);
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("Plivo webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}

// Plivo may also send GET requests for verification
export async function GET() {
  return NextResponse.json(
    { service: "Plivo WhatsApp Webhook", status: "active" },
    { status: 200 }
  );
}
