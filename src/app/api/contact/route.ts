import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { ApiContactData, apiContactSchema } from "../../(frontend)/contact/components/ContactForm/ContactForm.types";
import { ZodError } from "zod";
import { nanoid } from "nanoid";
import { contactFormOptionsService } from "@/services/contact-form-options.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "form-options":
        return await handleFormOptions();
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: form-options" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Contact API GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "enquiry":
        return await handleEnquiry(request);
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: enquiry" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Contact API POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleFormOptions() {
  try {
    const options = await contactFormOptionsService.getAllOptions();

    return NextResponse.json(options, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("API Error fetching contact form options:", error);

    return NextResponse.json(
      {
        packages: [],
        periods: [],
        categories: [],
        isLoading: false,
        error: "Failed to fetch contact form options",
      },
      { status: 500 }
    );
  }
}

async function handleEnquiry(request: NextRequest) {
  try {
    // Parse and validate in one step - Zod handles all transformations
    const body = await request.json();
    const validatedData = apiContactSchema.parse(body);

    // Additional business logic validation
    const checkInDate = new Date(validatedData.booking.checkIn);
    const checkOutDate = new Date(validatedData.booking.checkOut);

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          error: "Check-out must be after check-in date",
          field: "booking.dates",
        },
        { status: 400 }
      );
    }

    // Validate future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return NextResponse.json(
        {
          error: "Check-in date cannot be in the past",
          field: "booking.checkIn",
        },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Generate unique enquiry ID
    const enquiryId = `ENQ-${nanoid(8).toUpperCase()}`;

    // Create enquiry - data is already properly typed and validated
    const enquiry = await payload.create({
      collection: "enquiries",
      data: {
        enquiryId, // Add the missing enquiryId field
        customerInfo: {
          fullName: validatedData.personal.fullName,
          email: validatedData.personal.email,
          phone: validatedData.personal.phone,
          age: validatedData.personal.age,
        },
        bookingDetails: {
          selectedPackage: validatedData.booking.package,
          duration: validatedData.booking.duration,
          checkIn: validatedData.booking.checkIn.toISOString(),
          checkOut: validatedData.booking.checkOut.toISOString(),
          adults: validatedData.booking.adults,
          children: validatedData.booking.children,
          tags: validatedData.additional.tags.map((tag: any) => ({ tag })),
        },
        packageInfo: validatedData.packageInfo || undefined,
        messages: {
          message: validatedData.additional.message || "",
          additionalMessage: validatedData.additionalMessage || "",
        },
        enquiryMetadata: {
          enquirySource: validatedData.enquirySource as any,
          status: "new",
          priority: calculatePriority(validatedData),
        },
        technicalDetails: {
          userAgent: request.headers.get("user-agent") || "",
          ipAddress: getClientIP(request),
          recaptchaScore: validatedData.recaptchaScore,
          submissionTimestamp: validatedData.timestamp,
        },
      },
    });

    // Log successful enquiry creation
    console.log(`✅ Enquiry created: ${enquiryId}`, {
      package: validatedData.booking.package,
      customer: validatedData.personal.email,
      source: validatedData.enquirySource,
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully!",
      enquiryId: enquiry.enquiryId || enquiry.id, // Return the custom enquiryId
      estimatedResponseTime: await calculateResponseTime(payload),
    });
  } catch (error) {
    // Enhanced error handling
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      console.warn("❌ Validation error:", {
        field: firstError.path.join("."),
        message: firstError.message,
        code: firstError.code,
      });

      return NextResponse.json(
        {
          error: getHumanReadableError(firstError),
          field: firstError.path.join("."),
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Handle Payload CMS errors
    if (error && typeof error === "object" && "name" in error) {
      if (error.name === "ValidationError") {
        console.warn("❌ Payload validation error:", error);
        return NextResponse.json(
          {
            error: "Invalid data provided. Please check your inputs.",
            code: "PAYLOAD_VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }
    }

    console.error("❌ API Error:", error);
    return NextResponse.json(
      {
        error:
          "We're experiencing technical difficulties. Please try again later.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") || // Cloudflare
    request.headers.get("x-client-ip") ||
    "unknown"
  );
}

async function calculateResponseTime(payload: any): Promise<string> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { totalDocs } = await payload.count({
      collection: "enquiries",
      where: {
        createdAt: { greater_than_equal: today.toISOString() },
        "enquiryMetadata.status": { not_equals: "spam" }, // Exclude spam
      },
    });

    // Dynamic response time based on workload
    if (totalDocs > 50) return "72-96 hours";
    if (totalDocs > 30) return "48-72 hours";
    if (totalDocs > 20) return "24-48 hours";
    if (totalDocs > 10) return "12-24 hours";
    if (totalDocs > 5) return "6-12 hours";

    return "4-8 hours";
  } catch (error) {
    console.warn("Failed to calculate response time:", error);
    return "24 hours";
  }
}

function calculatePriority(
  data: ApiContactData
): "low" | "medium" | "high" | "urgent" {
  // Business logic for priority calculation
  const adultCount = data.booking.adults || 0;
  const childrenCount = data.booking.children || 0;
  const totalGuests = adultCount + childrenCount;

  const checkInDate = new Date(data.booking.checkIn);
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Urgent: Large group booking soon
  if (totalGuests >= 8 && daysUntilCheckIn <= 7) return "urgent";

  // High: Large group or booking very soon
  if (totalGuests >= 6 || daysUntilCheckIn <= 3) return "high";

  // Medium: Standard booking
  if (daysUntilCheckIn <= 14) return "medium";

  // Low: Advance booking
  return "low";
}

function getHumanReadableError(zodError: any): string {
  const field = zodError.path.join(".");
  const message = zodError.message;

  // Map technical errors to user-friendly messages
  const fieldMap: Record<string, string> = {
    "personal.email": "Please enter a valid email address",
    "personal.phone": "Please enter a valid phone number",
    "personal.fullName": "Please enter your full name (at least 2 characters)",
    "personal.age": "Age must be between 18 and 100",
    "booking.package": "Please select a package",
    "booking.duration": "Please select a duration",
    "booking.adults": "Number of adults must be between 1 and 20",
    "booking.children": "Number of children must be between 0 and 20",
  };

  return fieldMap[field] || message;
}
