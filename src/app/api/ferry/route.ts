import { NextRequest, NextResponse } from "next/server";
import { FerryAggregationService } from "@/services/ferryServices/ferryAggregationService";
import { GreenOceanService } from "@/services/ferryServices/greenOceanService";
import { SealinkService } from "@/services/ferryServices/sealinkService";
import { MakruzzService } from "@/services/ferryServices/makruzzService";
import { PDFService } from "@/services/pdfService";
import {
  FerryBookingSession,
  FerrySearchParams,
} from "@/types/FerryBookingSession.types";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// In-memory booking sessions storage
let bookingSessions: Map<string, FerryBookingSession>;

// Initialize sessions map
if (typeof global !== "undefined") {
  if (!global.bookingSessions) {
    global.bookingSessions = new Map<string, FerryBookingSession>();

    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [sessionId, session] of global.bookingSessions?.entries() ||
        []) {
        if (session.expiresAt < now) {
          global.bookingSessions?.delete(sessionId);
          console.log(`🧹 Cleaned up expired booking session: ${sessionId}`);
        }
      }
    }, 5 * 60 * 1000);
  }
  bookingSessions =
    global.bookingSessions || new Map<string, FerryBookingSession>();
} else {
  bookingSessions = new Map<string, FerryBookingSession>();
}

// Rate limiting for search
const rateLimiter = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 searches per minute per IP

// Helper function to handle rate limiting
function checkRateLimit(ip: string): {
  allowed: boolean;
  error?: NextResponse;
} {
  const now = Date.now();

  // Clean old entries
  for (const [key, data] of rateLimiter.entries()) {
    if (now - data.firstRequest > WINDOW_MS) {
      rateLimiter.delete(key);
    }
  }

  const userData = rateLimiter.get(ip) || { count: 0, firstRequest: now };

  if (userData.count >= MAX_REQUESTS) {
    console.warn(`🚫 Rate limit exceeded for IP: ${ip}`);
    return {
      allowed: false,
      error: NextResponse.json(
        { error: "Too many requests. Please wait before searching again." },
        { status: 429 }
      ),
    };
  }

  userData.count++;
  rateLimiter.set(ip, userData);
  return { allowed: true };
}

// Ferry Search Handler
async function handleSearch(request: NextRequest): Promise<NextResponse> {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) return rateCheck.error!;

  const body = await request.json();

  // Validate required parameters
  const { from, to, date, adults, children = 0, infants = 0 } = body;
  if (!from || !to || !date || !adults) {
    return NextResponse.json(
      { error: "Missing required parameters: from, to, date, adults" },
      { status: 400 }
    );
  }

  // Validate date format
  const searchDate = new Date(date);
  if (isNaN(searchDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD" },
      { status: 400 }
    );
  }

  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  searchDate.setHours(0, 0, 0, 0);

  if (searchDate < today) {
    return NextResponse.json(
      { error: "Cannot search for dates in the past" },
      { status: 400 }
    );
  }

  const searchParams: FerrySearchParams = {
    from,
    to,
    date,
    adults: parseInt(adults),
    children: parseInt(children),
    infants: parseInt(infants),
  };

  console.log(`🔍 API: Ferry search requested`, searchParams);

  const { results, errors } = await FerryAggregationService.searchAllOperators(
    searchParams
  );

  let responseStatus = 200;
  let responseMessage = "success";

  if (results.length === 0 && errors.length > 0) {
    responseStatus = 207;
    responseMessage =
      "All ferry operators are temporarily unavailable. Please try again later.";
  } else if (errors.length > 0) {
    responseStatus = 207;
    responseMessage =
      "Some ferry operators are temporarily unavailable, but we found results from available services.";
  }

  const response = {
    success: results.length > 0,
    message: responseMessage,
    data: {
      results,
      searchParams,
      meta: {
        totalResults: results.length,
        searchTime: new Date().toISOString(),
        operatorErrors: errors,
        availableOperators: ["sealink", "makruzz", "greenocean"].filter(
          (op) => !errors.some((error) => error.operator === op)
        ),
        failedOperators: errors.map((error) => error.operator),
      },
    },
  };

  console.log(
    `✅ API: Ferry search completed - ${results.length} results found, ${errors.length} operator errors`
  );
  return NextResponse.json(response, { status: responseStatus });
}

// Health Check Handler
async function handleHealth(): Promise<NextResponse> {
  try {
    const healthStatus = await FerryAggregationService.checkOperatorHealth();
    return NextResponse.json({
      operators: healthStatus,
      timestamp: new Date().toISOString(),
      overallStatus: Object.values(healthStatus).every(
        (op) => op.status === "online"
      )
        ? "all_online"
        : Object.values(healthStatus).some((op) => op.status === "online")
          ? "partial_online"
          : "all_offline",
    });
  } catch (error) {
    console.error("Ferry health check failed:", error);
    return NextResponse.json(
      {
        operators: {
          sealink: { status: "error", message: "Health check failed" },
          makruzz: { status: "error", message: "Health check failed" },
          greenocean: { status: "error", message: "Health check failed" },
        },
        timestamp: new Date().toISOString(),
        overallStatus: "all_offline",
        error: "Health check service unavailable",
      },
      { status: 503 }
    );
  }
}

// Seat Layout Handler
async function handleSeatLayout(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { routeId, ferryId, classId, travelDate, operator, forceRefresh } =
    body;

  console.log(`🪑 API: Incoming seat layout request:`, {
    operator,
    ferryId,
    classId,
    routeId,
    travelDate,
    forceRefresh,
  });

  if (!ferryId || !classId || !travelDate || !operator) {
    return NextResponse.json(
      {
        error:
          "Missing required parameters: ferryId, classId, travelDate, operator",
      },
      { status: 400 }
    );
  }

  if (operator === "greenocean" && !routeId) {
    return NextResponse.json(
      { error: "Missing required parameter for Green Ocean: routeId" },
      { status: 400 }
    );
  }

  console.log(
    `🪑 API: Fetching seat layout for ${operator} ferry ${ferryId}, class ${classId}${forceRefresh ? " (force refresh)" : ""
    }`
  );

  let seatLayout;
  let meta: any;

  try {
    switch (operator) {
      case "greenocean":
        // Extract numeric ferry ID from prefixed format like "greenocean-1-2"
        const numericFerryId = ferryId.includes("-")
          ? parseInt(ferryId.split("-").pop() || "0")
          : parseInt(ferryId);

        seatLayout = await GreenOceanService.getSeatLayout(
          parseInt(routeId),
          numericFerryId,
          parseInt(classId),
          travelDate,
          forceRefresh
        );
        meta = {
          routeId: parseInt(routeId),
          ferryId: numericFerryId,
          classId: parseInt(classId),
          travelDate,
          operator,
          fetchedAt: new Date().toISOString(),
        };
        break;

      case "sealink":
        seatLayout = await SealinkService.getSeatLayout(
          ferryId,
          classId,
          travelDate
        );
        meta = {
          routeId: routeId || null,
          ferryId: ferryId,
          classId: classId,
          travelDate,
          operator,
          fetchedAt: new Date().toISOString(),
        };
        break;

      case "makruzz":
        // For Makruzz, ferryId carries the schedule_id from the booking page
        // It may come as a number or a prefixed string like "makruzz-824-makruzz-2026-03-10"
        const ferryIdStr = String(ferryId);
        const scheduleId = ferryIdStr.includes("-")
          ? ferryIdStr.split("-")[1]
          : ferryIdStr;

        seatLayout = await MakruzzService.getSeatLayout(
          scheduleId,
          classId,
          travelDate
        );
        meta = {
          scheduleId,
          classId,
          travelDate,
          operator,
          fetchedAt: new Date().toISOString(),
        };
        break;

      default:
        return NextResponse.json(
          { error: `Seat layout not supported for operator: ${operator}` },
          { status: 400 }
        );
    }

    console.log(
      `✅ API: Seat layout fetched - ${seatLayout.seats.length} seats for ${operator} ferry ${ferryId}`
    );

    return NextResponse.json({
      success: true,
      data: { seatLayout, meta },
    });
  } catch (error) {
    console.error("❌ API: Seat layout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch seat layout",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Create Booking Session Handler
async function handleCreateBookingSession(
  request: NextRequest
): Promise<NextResponse> {
  const body = await request.json();
  const { searchParams, selectedFerry, selectedClass } = body;

  if (!searchParams || !selectedFerry || !selectedClass) {
    return NextResponse.json(
      {
        error:
          "Missing required parameters: searchParams, selectedFerry, selectedClass",
      },
      { status: 400 }
    );
  }

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  const session: FerryBookingSession = {
    sessionId,
    searchParams,
    selectedFerry,
    selectedClass,
    passengers: [],
    totalAmount: selectedClass.price,
    createdAt: new Date(),
    expiresAt,
  };

  bookingSessions.set(sessionId, session);
  console.log(
    `🎫 API: Created booking session ${sessionId} for ferry ${selectedFerry.ferryId}`
  );

  return NextResponse.json({
    success: true,
    data: {
      sessionId,
      session,
      expiresAt: expiresAt.toISOString(),
      timeRemaining: 30 * 60,
    },
  });
}

// Get Booking Session Handler
async function handleGetBookingSession(
  request: NextRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId parameter" },
      { status: 400 }
    );
  }

  const session = bookingSessions.get(sessionId);

  if (!session) {
    return NextResponse.json(
      { error: "Booking session not found or expired" },
      { status: 404 }
    );
  }

  if (session.expiresAt < new Date()) {
    bookingSessions.delete(sessionId);
    return NextResponse.json(
      { error: "Booking session expired" },
      { status: 410 }
    );
  }

  const timeRemaining = Math.max(
    0,
    Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)
  );

  return NextResponse.json({
    success: true,
    data: {
      session,
      timeRemaining,
      isExpired: timeRemaining === 0,
    },
  });
}

// PDF Download Handler
async function handlePDFDownload(pnr: string): Promise<NextResponse> {
  console.log(`📄 PDF Download request for PNR: ${pnr}`);

  const storageDir = process.env.PDF_STORAGE_DIR || "./public/tickets";

  try {
    const files = await fs.promises.readdir(storageDir);
    const pdfFile = files.find(
      (file) => file.includes(pnr) && file.endsWith(".pdf")
    );

    if (!pdfFile) {
      console.log(`❌ PDF not found for PNR: ${pnr}`);
      return NextResponse.json(
        { error: "Ticket PDF not found" },
        { status: 404 }
      );
    }

    const pdfPath = path.join(storageDir, pdfFile);
    const pdfBuffer = await fs.promises.readFile(pdfPath);

    console.log(`✅ PDF found and serving: ${pdfFile}`);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Ferry_Ticket_${pnr}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Expires: "0",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("❌ Error accessing PDF storage:", error);
    return NextResponse.json(
      {
        error: "PDF temporarily unavailable",
        message: "Please contact support with your PNR for assistance",
      },
      { status: 503 }
    );
  }
}

// PDF Regeneration Handler
async function handlePDFRegeneration(
  pnr: string,
  request: NextRequest
): Promise<NextResponse> {
  const body = await request.json();
  const { operator, bookingId } = body;

  if (!operator || !bookingId) {
    return NextResponse.json(
      { error: "Operator and booking ID are required" },
      { status: 400 }
    );
  }

  console.log(
    `🔄 PDF regeneration request for PNR: ${pnr}, Operator: ${operator}`
  );

  let pdfBase64: string | undefined;
  let error: string | undefined;

  try {
    switch (operator) {
      case "makruzz":
        const { MakruzzService } = await import(
          "@/services/ferryServices/makruzzService"
        );
        const makruzzResult = await MakruzzService.getTicketPDF(bookingId);
        if (makruzzResult.success) {
          pdfBase64 = makruzzResult.pdfBase64;
        } else {
          error = makruzzResult.error;
        }
        break;

      case "greenocean":
        error = "Green Ocean PDFs are not regenerable after booking";
        break;

      case "sealink":
        error = "Sealink PDFs are not available through API";
        break;

      default:
        error = "Unsupported operator";
    }

    if (pdfBase64) {
      const storageResult = await PDFService.storePDFFromBase64(
        pdfBase64,
        pnr,
        operator
      );

      if (storageResult.success) {
        const pdfBuffer = Buffer.from(pdfBase64, "base64");
        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Ferry_Ticket_${pnr}.pdf"`,
            "Content-Length": pdfBuffer.length.toString(),
          },
        });
      } else {
        return NextResponse.json(
          { error: "Failed to store regenerated PDF" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: error || "Failed to regenerate PDF" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ PDF regeneration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Main route handler
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const pnr = searchParams.get("pnr");

    // Handle PDF regeneration (requires PNR)
    if (action === "regenerate-pdf" && pnr) {
      return await handlePDFRegeneration(pnr, request);
    }

    // Handle other POST actions
    switch (action) {
      case "search":
        return await handleSearch(request);

      case "seat-layout":
        return await handleSeatLayout(request);

      case "create-session":
        return await handleCreateBookingSession(request);

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use ?action=search|seat-layout|create-session",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ API: Ferry operation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ferry service temporarily unavailable",
        message:
          "We're experiencing technical difficulties. Please try again in a few minutes.",
        details:
          process.env.NODE_ENV === "development"
            ? {
              error: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
            }
            : undefined,
      },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const sessionId = searchParams.get("sessionId");
    const pnr = searchParams.get("pnr");

    // Handle PDF download
    if (action === "download-pdf" && pnr) {
      return await handlePDFDownload(pnr);
    }

    // Handle booking session retrieval
    if (action === "get-session" && sessionId) {
      return await handleGetBookingSession(request);
    }

    // Handle health check
    if (action === "health") {
      return await handleHealth();
    }

    return NextResponse.json(
      {
        error:
          "Invalid action. Use ?action=health|get-session|download-pdf with appropriate parameters",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ API: Ferry GET operation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
