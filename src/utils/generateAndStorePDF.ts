import { PDFService } from "@/services/pdfService";
import { BookingPDFData } from "@/components/pdf/types/booking.types";
import { UTApi, UTFile } from "uploadthing/server";

const uploadthingToken = process.env.UPLOADTHING_TOKEN;

if (!uploadthingToken) {
  console.warn("⚠️ UPLOADTHING_TOKEN is not set - PDF uploads will fail");
}

const utapi = new UTApi({
  token: uploadthingToken,
});

/**
 * Generates a PDF for a confirmed booking, uploads it to UploadThing,
 * and saves the URL to the booking record in the database.
 */
export async function generateAndStorePDF(booking: any, payload: any) {
  try {
    console.log("📄 Auto-generating PDF for booking:", booking.bookingId);

    const pdfData: BookingPDFData = {
      bookingId: booking.bookingId,
      confirmationNumber: booking.confirmationNumber,
      bookingDate: booking.bookingDate,
      status: booking.status,
      bookingType: booking.bookingType,
      customerInfo: {
        primaryContactName:
          booking.customerInfo?.primaryContactName || "Guest",
        customerEmail: booking.customerInfo?.customerEmail || "N/A",
        customerPhone: booking.customerInfo?.customerPhone || "N/A",
        nationality: booking.customerInfo?.nationality,
      },
      bookedFerries: booking.bookedFerries,
      bookedBoats: booking.bookedBoats,
      bookedActivities: booking.bookedActivities,
      passengers:
        booking.passengers?.map((p: any, idx: number) => ({
          isPrimary: idx === 0,
          fullName: p.fullName || "Guest",
          age: p.age || 0,
          gender: p.gender || "N/A",
          nationality: p.nationality || "N/A",
          passportNumber: p.passportNumber,
          ticketNumber: p.ticketNumber,
          whatsappNumber: p.whatsappNumber,
          email: p.email,
        })) || [],
      pricing: booking.pricing || {
        subtotal: 0,
        taxes: 0,
        fees: 0,
        totalAmount: 0,
        currency: "INR",
      },
      specialRequests: booking.specialRequests,
    };

    const pdfResult = await PDFService.generateBookingPDF(pdfData);

    if (!pdfResult.success || !pdfResult.pdfBuffer) {
      console.error(
        "❌ PDF generation failed for booking:",
        booking.bookingId,
        pdfResult.error
      );
      return;
    }

    // Upload PDF to UploadThing
    const fileName = `AndamanExcursion_${booking.confirmationNumber}_${Date.now()}.pdf`;
    const uint8 = new Uint8Array(pdfResult.pdfBuffer);
    const file = new UTFile([uint8], fileName, {
      customId: booking.bookingId,
    });

    const uploadResponse = await utapi.uploadFiles([file]);
    const result = uploadResponse[0];

    if (result.error) {
      console.error(
        "❌ UploadThing upload failed for booking:",
        booking.bookingId,
        result.error
      );
      return;
    }

    const pdfUrl = result.data.url;

    // Save URL to booking record
    await payload.update({
      collection: "bookings",
      id: booking.id,
      data: {
        pdfUrl,
      },
    });

    console.log(
      "✅ PDF uploaded to UploadThing and saved for booking:",
      booking.bookingId,
      pdfUrl
    );
  } catch (error: any) {
    // Non-blocking: log error but don't fail the booking flow
    console.error(
      "❌ Auto PDF generation failed (non-blocking):",
      booking.bookingId,
      error?.message || error,
      error?.stack
    );
  }
}
