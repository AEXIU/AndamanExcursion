import { z } from "zod";

// Enhanced phone validation with country code support
const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(
    /^[\+]?[1-9][\d]{6,14}$/,
    "Please enter a valid phone number (e.g., +91 9876543210 or 9876543210)"
  );

// More robust date validation
const dateSchema = z.coerce
  .date()
  .refine((date) => !isNaN(date.getTime()), "Invalid date")
  .refine(
    (date) => date >= new Date(new Date().setHours(0, 0, 0, 0)),
    "Date cannot be in the past"
  );

// Enhanced contact form schema with better validation
export const contactFormSchema = z.object({
  booking: z
    .object({
      package: z.string().min(1, "Package selection is required"),
      duration: z.string().min(1, "Duration is required"),
      checkIn: dateSchema,
      checkOut: dateSchema,
      adults: z.coerce
        .number()
        .int()
        .min(1, "At least 1 adult required")
        .max(20, "Maximum 20 adults allowed"),
      children: z.coerce
        .number()
        .int()
        .min(0)
        .max(20, "Maximum 20 children allowed"),
    })
    .refine(
      (data) => {
        const timeDiff = data.checkOut.getTime() - data.checkIn.getTime();
        const dayDiff = timeDiff / (1000 * 3600 * 24);
        return dayDiff >= 1; // At least 1 day stay
      },
      {
        message: "Check-out must be at least 1 day after check-in",
        path: ["checkOut"],
      }
    )
    .refine(
      (data) => {
        // Maximum 30 days advance booking validation
        const maxAdvanceBooking = new Date();
        maxAdvanceBooking.setFullYear(maxAdvanceBooking.getFullYear() + 1);
        return data.checkIn <= maxAdvanceBooking;
      },
      {
        message: "Check-in date cannot be more than 1 year in advance",
        path: ["checkIn"],
      }
    ),

  personal: z.object({
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .trim()
      .regex(
        /^[a-zA-Z\s\-'\.]+$/,
        "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
      ),

    age: z.coerce
      .number()
      .int("Age must be a whole number")
      .min(18, "Must be at least 18 years old")
      .max(100, "Age must be less than 100"),

    phone: phoneSchema,

    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim()
      .max(254, "Email address is too long"), // RFC 5321 limit
  }),

  additional: z.object({
    tags: z
      .array(z.string())
      .default([])
      .refine((tags) => tags.length <= 10, "Maximum 10 tags allowed"),
    message: z
      .string()
      .max(1000, "Message must be less than 1000 characters")
      .optional()
      .default(""),
  }),

  additionalMessage: z
    .string()
    .max(1000, "Additional message must be less than 1000 characters")
    .optional()
    .default(""),
});

// Infer the type from schema
export type ContactFormData = z.infer<typeof contactFormSchema>;

// Enhanced API schema with better validation
export const apiContactSchema = contactFormSchema.extend({
  enquirySource: z
    .enum(["direct", "package-detail", "newsletter", "referral"])
    .default("direct"),

  packageInfo: z
    .object({
      id: z.string().optional(),
      title: z.string().min(1),
      slug: z.string().optional(),
      period: z.string().min(1),
      price: z.number().positive(),
      originalPrice: z.number().positive().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
    })
    .nullable()
    .optional(),

  timestamp: z.string().datetime(),
  recaptchaScore: z.string().min(1),
});

export type ApiContactData = z.infer<typeof apiContactSchema>;

// Enhanced form defaults factory
export function createFormDefaults(
  packageData?: Partial<ContactFormData>
): ContactFormData {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(defaultCheckIn.getDate() + 7); // Default to 1 week from now

  const defaultCheckOut = new Date(defaultCheckIn);
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 3); // 3 night stay

  return {
    booking: {
      package: packageData?.booking?.package || "",
      duration: packageData?.booking?.duration || "",
      checkIn: packageData?.booking?.checkIn || defaultCheckIn,
      checkOut: packageData?.booking?.checkOut || defaultCheckOut,
      adults: packageData?.booking?.adults || 2,
      children: packageData?.booking?.children || 0,
    },
    personal: {
      fullName: packageData?.personal?.fullName || "",
      age: packageData?.personal?.age || 25,
      phone: packageData?.personal?.phone || "",
      email: packageData?.personal?.email || "",
    },
    additional: {
      tags: packageData?.additional?.tags || [],
      message: packageData?.additional?.message || "",
    },
    additionalMessage: packageData?.additionalMessage || "",
  };
}
