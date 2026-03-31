import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { generateAndStorePDF } from "@/utils/generateAndStorePDF";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pnr = searchParams.get("pnr")?.trim();

    if (!pnr) {
      return NextResponse.json(
        { error: "PNR number is required" },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Search by confirmationNumber (internal PNR)
    let result = await payload.find({
      collection: "bookings",
      where: {
        confirmationNumber: { equals: pnr },
      },
      limit: 1,
    });

    // If not found, search by ferry provider PNR
    if (result.docs.length === 0) {
      result = await payload.find({
        collection: "bookings",
        where: {
          "bookedFerries.providerBooking.pnr": { equals: pnr },
        },
        limit: 1,
      });
    }

    if (result.docs.length === 0) {
      return NextResponse.json(
        { error: "No booking found for this PNR number" },
        { status: 404 }
      );
    }

    let booking = result.docs[0] as any;

    // If no pdfUrl stored, generate the PDF now and save it
    if (!booking.pdfUrl) {
      console.log("No pdfUrl found for booking, generating now:", booking.bookingId);
      await generateAndStorePDF(booking, payload);

      // Re-fetch to get updated pdfUrl
      const updated = await payload.findByID({
        collection: "bookings",
        id: booking.id,
      });
      booking = updated as any;
    }

    return NextResponse.json({
      success: true,
      booking: {
        bookingId: booking.bookingId,
        confirmationNumber: booking.confirmationNumber,
        customerName: booking.customerInfo?.primaryContactName || "N/A",
        status: booking.status,
        bookingDate: booking.bookingDate,
      },
      pdf: booking.pdfUrl
        ? {
            url: booking.pdfUrl,
            fileName: booking.pdfUrl.split("/").pop() || "booking.pdf",
          }
        : null,
    });
  } catch (error) {
    console.error("PNR lookup error:", error);
    return NextResponse.json(
      { error: "Failed to look up PNR" },
      { status: 500 }
    );
  }
}
