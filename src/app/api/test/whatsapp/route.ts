// app/api/test/whatsapp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WhatsAppNotificationChannel } from "@/services/notifications/channels/whatsapp";

export async function GET() {
  const whatsapp = new WhatsAppNotificationChannel();

  return NextResponse.json({
    service: "Plivo WhatsApp",
    enabled: whatsapp.isEnabled(),
    config: {
      hasAuthId: !!process.env.PLIVO_AUTH_ID,
      hasAuthToken: !!process.env.PLIVO_AUTH_TOKEN,
      hasFromNumber: !!process.env.PLIVO_WHATSAPP_NUMBER,
    },
    endpoints: {
      test: {
        method: "POST",
        url: "/api/test/whatsapp",
        body: {
          phone: "+918600713587",
          template: "all | hello | enquiry | booking_confirmation | payment_failed | reminder | status_update"
        }
      }
    },
    webhook: "/api/webhooks/plivo/whatsapp",
    timestamp: new Date().toISOString(),
  });
}

// Helper: build test payloads for each template
function getTestPayloads(phone: string) {
  const ts = Date.now().toString().slice(-6);
  return {
    enquiry: {
      type: "enquiry_confirmation" as const,
      recipient: phone,
      data: {
        fullName: "Test User",
        enquiryId: `ENQ${ts}`,
        email: "test@example.com",
        phone: phone,
        selectedPackage: "Island Tour Package",
        message: "Test enquiry message",
        submissionDate: new Date().toISOString(),
      },
    },
    booking_confirmation: {
      type: "booking_confirmation" as const,
      recipient: phone,
      data: {
        customerName: "Test User",
        confirmationNumber: `AE2025${ts}`,
        bookingType: "ferry",
        bookingDate: new Date().toISOString(),
        totalAmount: 4500,
        items: [{
          location: "Port Blair to Havelock Island",
          date: new Date().toISOString(),
          time: "08:30 AM",
          passengers: 2
        }]
      },
    },
    payment_failed: {
      type: "payment_failed" as const,
      recipient: phone,
      data: {
        customerName: "Test User",
        attemptedAmount: 4500,
        failureReason: "Insufficient funds",
        bookingId: `BK${ts}`,
        paymentMethod: "Credit Card"
      },
    },
    reminder: {
      type: "booking_reminder" as const,
      recipient: phone,
      data: {
        customerName: "Test User",
        confirmationNumber: `BK${ts}`,
        updateDate: new Date().toISOString(),
        oldStatus: "confirmed",
        newStatus: "reminder"
      },
    },
    status_update: {
      type: "booking_status_update" as const,
      recipient: phone,
      data: {
        customerName: "Test User",
        confirmationNumber: `BK${ts}`,
        oldStatus: "Confirmed",
        newStatus: "Completed",
        updateDate: new Date().toISOString(),
        message: "Your trip has been completed successfully!"
      },
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, template = "enquiry" } = body;

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required",
          example: { phone: "+918600713587", template: "all" }
        },
        { status: 400 }
      );
    }

    const whatsapp = new WhatsAppNotificationChannel();

    if (!whatsapp.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: "WhatsApp not enabled",
          config: {
            hasAuthId: !!process.env.PLIVO_AUTH_ID,
            hasAuthToken: !!process.env.PLIVO_AUTH_TOKEN,
            hasFromNumber: !!process.env.PLIVO_WHATSAPP_NUMBER,
          },
        },
        { status: 500 }
      );
    }

    const payloads = getTestPayloads(phone);

    // ── "all" mode: send every template and collect results ──
    if (template === "all") {
      const templateNames = ["enquiry", "booking_confirmation", "payment_failed", "reminder", "status_update"] as const;
      const results: Record<string, { success: boolean; messageId?: string; error?: string }> = {};
      let allSuccess = true;

      for (const name of templateNames) {
        console.log(`[ALL] Sending ${name} template to ${phone}`);
        try {
          const result = await whatsapp.send(payloads[name] as any);
          results[name] = {
            success: result.success,
            messageId: result.messageId,
            error: result.error,
          };
          if (!result.success) allSuccess = false;
        } catch (err) {
          results[name] = {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
          allSuccess = false;
        }
        // Small delay between sends to avoid rate limits
        await new Promise((r) => setTimeout(r, 1000));
      }

      return NextResponse.json({
        success: allSuccess,
        message: allSuccess ? "All templates sent!" : "Some templates failed",
        results,
      });
    }

    // ── Single template mode ──
    let result;
    console.log(`Sending ${template} template to ${phone}`);

    switch (template) {
      case "hello":
        result = await whatsapp.sendHelloWorld(phone);
        break;

      case "enquiry":
      case "booking_confirmation":
      case "payment_failed":
      case "reminder":
      case "status_update":
        result = await whatsapp.send(payloads[template as keyof typeof payloads] as any);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid template. Use: all, hello, enquiry, booking_confirmation, payment_failed, reminder, status_update"
          },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${template} template sent successfully!`,
        messageUuid: result.messageId,
        template: template,
        details: result.metadata,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error,
        template: template
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}