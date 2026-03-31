import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import NotificationService from "@/services/notifications/notificationService";

export async function GET(req: NextRequest) {
  try {
    // Optional: Basic security check (You can configure Vercel Cron with a secret header)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await getPayload({ config });

    // Calculate tomorrow's date string (YYYY-MM-DD format)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0]; // Use start of day comparison typically

    // Find confirmed bookings scheduled for tomorrow
    const upcomingBookings = await payload.find({
      collection: "bookings",
      where: {
        status: { equals: "confirmed" },
        serviceDate: { greater_than_equal: `${tomorrowStr}T00:00:00.000Z`, less_than_equal: `${tomorrowStr}T23:59:59.999Z` }
      },
      // If serviceDate is stored as just YYYY-MM-DD, you might use:
      // serviceDate: { equals: tomorrowStr } or a Contains/Like depending on how it's saved.
      // Payload typically saves dates in ISO format. We'll query using greater_than_equal.
    });

    let results = {
      totalFound: upcomingBookings.totalDocs,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    console.log(`Cron Reminders: Found ${upcomingBookings.totalDocs} bookings for tomorrow (${tomorrowStr})`);

    // We use a simple loop so we don't overwhelm the API rate limits of Plivo/Meta
    for (const booking of upcomingBookings.docs) {
      try {
        await NotificationService.sendBookingReminder(booking.id);
        results.successful++;
        
        // Wait 500ms between sends
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Booking ${booking.id}: ${error.message}`);
        console.error(`Failed to send reminder for booking ${booking.id}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminders triggered for ${tomorrowStr}`,
      results
    });
  } catch (error: any) {
    console.error("Cron Reminder Job failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
