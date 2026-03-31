import { NextRequest, NextResponse } from "next/server";
import { PDFService } from "@/services/pdfService";
import { BookingPDFData } from "@/components/pdf/types/booking.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      bookingConfirmation,
      bookingData,
      fullBookingData,
      storageMethod = "download", // "download" | "filesystem" | "database"
    } = body;

    if (!bookingId || !bookingConfirmation) {
      return NextResponse.json(
        { error: "Missing required booking data" },
        { status: 400 }
      );
    }

    console.log("📄 Generating PDF for booking:", bookingId);

    // Use fullBookingData if available (from database), otherwise use bookingData
    const dataSource = fullBookingData || bookingData;

    // DEBUG: Log bookedActivities structure
    if (dataSource?.bookedActivities) {
      console.log("📄 PDF Route - fullBookingData.bookedActivities:", JSON.stringify(dataSource.bookedActivities, null, 2));
    }

    // Transform data to match BookingPDFData interface
    const pdfData: BookingPDFData = {
      // ✅ FIX: Use bookingId field instead of database _id
      bookingId: dataSource?.bookingId || bookingId,
      confirmationNumber: bookingConfirmation.confirmationNumber,
      bookingDate: bookingConfirmation.bookingDate,
      status: bookingConfirmation.status,
      bookingType: determineBookingType(dataSource),

      customerInfo: {
        primaryContactName:
          dataSource?.customerInfo?.primaryContactName ||
          dataSource?.customerInfo?.name ||
          dataSource?.passengers?.[0]?.fullName ||
          bookingConfirmation.customerName ||
          "Guest",
        customerEmail:
          dataSource?.customerInfo?.customerEmail ||
          dataSource?.customerInfo?.email ||
          dataSource?.passengers?.[0]?.email ||
          bookingConfirmation.customerEmail ||
          "N/A",
        customerPhone:
          dataSource?.customerInfo?.customerPhone ||
          dataSource?.customerInfo?.phone ||
          dataSource?.passengers?.[0]?.whatsappNumber ||
          bookingConfirmation.customerPhone ||
          "N/A",
        nationality:
          dataSource?.customerInfo?.nationality ||
          dataSource?.passengers?.[0]?.nationality,
      },

      bookedFerries:
        dataSource?.bookedFerries ||
        transformFerries(dataSource, bookingConfirmation),
      bookedBoats: dataSource?.bookedBoats || transformBoats(dataSource),
      bookedActivities:
        dataSource?.bookedActivities || transformActivities(dataSource),

      passengers:
        dataSource?.passengers?.map((p: any, idx: number) => ({
          isPrimary: idx === 0,
          fullName: p.fullName || "Guest",
          age: p.age || 0,
          gender: p.gender || "N/A",
          nationality: p.nationality || "N/A",
          passportNumber: p.passportNumber || p.fpassport,
          idNumber: p.idNumber,
          ticketNumber: p.ticketNumber, // Pass through ticket number from booking data
          whatsappNumber: p.whatsappNumber,
          email: p.email,
        })) || [],

      pricing: dataSource?.pricing || {
        subtotal:
          dataSource?.totalPrice || bookingConfirmation.totalAmount || 0,
        baseFare:
          dataSource?.totalPrice || bookingConfirmation.totalAmount || 0,
        taxes: 0,
        fees: 0,
        utgst: 0,
        cgst: 0,
        psf: 0,
        totalAmount:
          dataSource?.totalPrice || bookingConfirmation.totalAmount || 0,
        currency: "INR",
        hsnCode: "996411", // Default HSN/SAC code for passenger transport
        paymentMode: "Online", // Default payment mode
      },

      specialRequests: bookingConfirmation.specialRequests,
    };

    // DEBUG: Log final pdfData.bookedActivities
    if (pdfData.bookedActivities && pdfData.bookedActivities.length > 0) {
      console.log("📄 PDF Route - Final pdfData.bookedActivities being passed to PDF:", JSON.stringify(pdfData.bookedActivities, null, 2));
    }

    // Generate PDF
    const pdfResult = await PDFService.generateBookingPDF(pdfData);

    if (!pdfResult.success || !pdfResult.pdfBuffer) {
      return NextResponse.json(
        { error: pdfResult.error || "PDF generation failed" },
        { status: 500 }
      );
    }

    // Handle different storage methods
    switch (storageMethod) {
      case "filesystem":
        // Store in file system
        const fsResult = await PDFService.storePDFToFileSystem(
          pdfResult.pdfBuffer,
          // ✅ FIX: Use actual bookingId
          dataSource?.bookingId || bookingId,
          determineOperator(dataSource)
        );

        if (!fsResult.success) {
          return NextResponse.json(
            { error: "Failed to store PDF" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          url: fsResult.url,
          fileName: fsResult.fileName,
          message: "PDF generated and stored",
        });

      case "database":
        // Store in database (requires payload instance)
        return NextResponse.json(
          { error: "Database storage not implemented in this route" },
          { status: 501 }
        );

      case "download":
      default:
        // Return PDF for immediate download
        return PDFService.createPDFResponse(
          pdfResult.pdfBuffer,
          pdfResult.fileName!
        );
    }
  } catch (error) {
    console.error("❌ PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Preview PDF as HTML (for development)
 * GET /api/bookings/generate-pdf?preview=true
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get("preview");

    if (preview !== "true") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    // Mock data for preview
    const mockData: BookingPDFData = {
      bookingId: "AE1760203681754",
      confirmationNumber: "ANE123456789",
      bookingDate: new Date().toISOString(),
      status: "confirmed",
      bookingType: "ferry",
      customerInfo: {
        primaryContactName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+91 9876543210",
        nationality: "Indian",
      },
      bookedFerries: [
        {
          operator: "Green Ocean",
          ferryName: "MV Makruzz",
          route: {
            from: "Port Blair",
            to: "Havelock Island",
            fromCode: "PBL",
            toCode: "HAV",
          },
          schedule: {
            departureTime: "08:30 AM",
            arrivalTime: "10:45 AM",
            duration: "2h 15m",
            travelDate: new Date().toISOString(),
          },
          selectedClass: {
            classId: "premium",
            className: "Premium Class",
            price: 1500,
          },
          passengers: {
            adults: 2,
            children: 1,
            infants: 0,
          },
          selectedSeats: [
            { seatNumber: "A1", passengerName: "John Doe" },
            { seatNumber: "A2", passengerName: "Jane Doe" },
            { seatNumber: "A3", passengerName: "Little Doe" },
          ],
          providerBooking: {
            pnr: "GO123456789",
            operatorBookingId: "OP987654321",
            bookingStatus: "Confirmed",
          },
          totalPrice: 4500,
        },
      ],
      passengers: [
        {
          isPrimary: true,
          fullName: "John Doe",
          age: 35,
          gender: "Male",
          nationality: "Indian",
          passportNumber: "A1234567",
          whatsappNumber: "+91 9876543210",
          email: "john@example.com",
        },
        {
          isPrimary: false,
          fullName: "Jane Doe",
          age: 32,
          gender: "Female",
          nationality: "Indian",
          passportNumber: "A7654321",
        },
        {
          isPrimary: false,
          fullName: "Little Doe",
          age: 8,
          gender: "Male",
          nationality: "Indian",
        },
      ],
      pricing: {
        subtotal: 4500,
        taxes: 450,
        fees: 50,
        totalAmount: 5000,
        currency: "INR",
      },
      specialRequests: "Window seats preferred. Vegetarian meals.",
    };

    // Generate PDF preview
    const result = await PDFService.generateBookingPDF(mockData);

    if (!result.success || !result.pdfBuffer) {
      return NextResponse.json(
        { error: result.error || "Failed to generate PDF" },
        { status: 500 }
      );
    }

    return PDFService.createPDFResponse(
      result.pdfBuffer,
      result.fileName || "preview.pdf"
    );
  } catch (error) {
    console.error("❌ Preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}

// ===== HELPER FUNCTIONS =====

function determineBookingType(
  bookingData: any
): "activity" | "ferry" | "boat" | "package" | "mixed" {
  // Check if bookingType is already provided
  if (bookingData?.bookingType) {
    return bookingData.bookingType;
  }

  if (!bookingData?.items || bookingData.items.length === 0) {
    return "mixed";
  }

  const types = new Set(bookingData.items.map((item: any) => item.type));

  if (types.size === 1) {
    const type = Array.from(types)[0];
    return type as "activity" | "ferry" | "boat" | "package";
  }

  return "mixed";
}

function determineOperator(bookingData: any): string {
  if (bookingData?.items && bookingData.items.length > 0) {
    const firstItem = bookingData.items[0];
    return firstItem.ferry?.operator || firstItem.type || "booking";
  }
  return "booking";
}

function transformFerries(bookingData: any, bookingConfirmation: any) {
  if (!bookingData?.items) return undefined;

  const ferryItems = bookingData.items.filter(
    (item: any) => item.type === "ferry"
  );

  if (ferryItems.length === 0) return undefined;

  return ferryItems.map((item: any) => ({
    operator: item.ferry?.operator || "Ferry Operator",
    ferryName: item.ferry?.ferryName || item.title || "Ferry",
    route: {
      from: item.ferry?.fromLocation || "N/A",
      to: item.ferry?.toLocation || "N/A",
      fromCode: item.ferry?.fromCode,
      toCode: item.ferry?.toCode,
    },
    schedule: {
      departureTime: item.ferry?.schedule?.departureTime || item.time || "N/A",
      arrivalTime: item.ferry?.schedule?.arrivalTime || "N/A",
      duration: item.ferry?.schedule?.duration,
      travelDate: item.date || "N/A",
    },
    selectedClass: {
      classId: item.ferry?.selectedClass?.classId || "standard",
      className: item.ferry?.selectedClass?.className || "Standard",
      price: item.ferry?.selectedClass?.price || item.price || 0,
    },
    passengers: {
      adults: item.passengers?.adults || 0,
      children: item.passengers?.children || 0,
      infants: item.passengers?.infants || 0,
    },
    selectedSeats: item.ferry?.selectedSeats?.map((seat: any) => ({
      seatNumber: typeof seat === "string" ? seat : seat.seatNumber,
      seatId: typeof seat === "object" ? seat.seatId : undefined,
      passengerName: typeof seat === "object" ? seat.passengerName : undefined,
    })),
    providerBooking: bookingConfirmation.providerBooking
      ? {
          pnr: bookingConfirmation.providerBooking.pnr,
          operatorBookingId:
            bookingConfirmation.providerBooking.operatorBookingId ||
            bookingConfirmation.providerBooking.providerBookingId,
          bookingStatus: bookingConfirmation.providerBooking.bookingStatus,
        }
      : undefined,
    totalPrice: item.price || 0,
  }));
}

function transformBoats(bookingData: any) {
  if (!bookingData?.items) return undefined;

  const boatItems = bookingData.items.filter(
    (item: any) => item.type === "boat"
  );

  if (boatItems.length === 0) return undefined;

  return boatItems.map((item: any) => ({
    boatName: item.boat?.boatName || item.title || "Boat",
    route: {
      from: item.boat?.route?.from || item.boat?.from || "N/A",
      to: item.boat?.route?.to || item.boat?.to || "N/A",
    },
    schedule: {
      departureTime: item.selectedTime || item.time || "N/A",
      duration: item.boat?.duration,
      travelDate: item.date || "N/A",
    },
    passengers: {
      adults: item.passengers?.adults || 0,
      children: item.passengers?.children || 0,
      infants: item.passengers?.infants || 0,
    },
    totalPrice: item.price || 0,
  }));
}

function transformActivities(bookingData: any) {
  if (!bookingData?.items) return undefined;

  const activityItems = bookingData.items.filter(
    (item: any) => item.type === "activity"
  );

  if (activityItems.length === 0) return undefined;

  return activityItems.map((item: any) => {
    // DEBUG: Log the item structure
    console.log("📄 PDF transformActivities - Item data:", JSON.stringify({
      location: item.location,
      locationType: typeof item.location,
      activityDuration: item.activity?.duration,
      activityCoreInfoDuration: item.activity?.coreInfo?.duration,
      activityCoreInfoLocation: item.activity?.coreInfo?.location,
      itemDuration: item.duration,
      time: item.time,
      title: item.title,
    }, null, 2));

    // Extract duration from various possible locations
    const duration =
      item.activity?.duration ||
      item.activity?.coreInfo?.duration ||
      item.duration ||
      "N/A";

    // Extract location - it can be a string or an object
    let locationName = "N/A";
    if (item.location) {
      if (typeof item.location === "string") {
        locationName = item.location;
      } else if (item.location.name) {
        locationName = item.location.name;
      } else if (Array.isArray(item.location) && item.location.length > 0) {
        locationName = typeof item.location[0] === "string"
          ? item.location[0]
          : item.location[0]?.name || "N/A";
      }
    } else if (item.activity?.coreInfo?.location) {
      const loc = item.activity.coreInfo.location;
      if (typeof loc === "string") {
        locationName = loc;
      } else if (Array.isArray(loc) && loc.length > 0) {
        locationName = typeof loc[0] === "string"
          ? loc[0]
          : loc[0]?.name || "N/A";
      }
    }

    console.log("📄 PDF transformActivities - Extracted values:", {
      locationName,
      duration,
    });

    return {
      activity: {
        name: item.title || "Activity",
        title: item.title,
        duration: duration, // Explicitly include duration
        ...item.activity,
      },
      activityOption: item.activityOption || item.option,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.price || 0,
      totalPrice: item.price || 0,
      scheduledTime: item.time,
      location: {
        name: locationName,
      },
      passengers: {
        adults: item.passengers?.adults || 0,
        children: item.passengers?.children || 0,
        infants: item.passengers?.infants || 0,
      },
    };
  });
}
