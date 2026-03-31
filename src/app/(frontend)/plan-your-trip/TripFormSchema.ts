import { z } from "zod";

// Helper function to check if a date string is valid and not in the past
const isValidFutureDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    return !isNaN(date.getTime()) && date >= today;
  } catch (e) {
    return false;
  }
};

// Helper function to check if departure date is after arrival date
const isValidDepartureDate = (departureStr: string, arrivalStr: string) => {
  try {
    if (!arrivalStr) return true; // Skip validation if arrival date not set

    const departure = new Date(departureStr);
    const arrival = new Date(arrivalStr);

    return (
      !isNaN(departure.getTime()) &&
      !isNaN(arrival.getTime()) &&
      departure >= arrival
    );
  } catch (e) {
    return false;
  }
};

// Optimized schemas with refined validation
export const personalDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
});

export const tripDetailsSchema = z
  .object({
    arrivalDate: z
      .string()
      .min(1, "Arrival date is required")
      .refine(isValidFutureDate, {
        message: "Arrival date must be today or in the future",
      }),
    departureDate: z
      .string()
      .min(1, "Departure date is required")
      .refine((date) => isValidFutureDate(date), {
        message: "Departure date must be today or in the future",
      }),
    adults: z.number().int().min(1, "At least 1 adult is required"),
    children: z.number().int().min(0, "Children count cannot be negative"),
  })
  .refine(
    (data) => isValidDepartureDate(data.departureDate, data.arrivalDate),
    {
      message: "Departure date must be on or after arrival date",
      path: ["departureDate"], // Show error on departure date field
    }
  );

// Simplified step 1 schema
export const step1Schema = z
  .object({
    personalDetails: personalDetailsSchema,
    tripDetails: tripDetailsSchema,
    travelGoals: z.array(z.string()).min(1, "Select at least one travel goal"),
    specialOccasion: z.array(z.string()).optional(),
  })
  .strip(); // Strip unknown fields for better performance

// Simplified itinerary item schema
const itineraryItemSchema = z.object({
  day: z.number().int().min(1, "Day must be at least 1"),
  date: z.string().min(1, "Date is required"),
  destination: z.string().min(1, "Destination is required"),
  activity: z.string().min(1, "Activity is required"),
  notes: z.string().optional(),
});

export const step2Schema = z
  .object({
    itinerary: z
      .array(itineraryItemSchema)
      .min(1, "At least one day must be planned"),
  })
  .strip();

// Simplified preferences schemas
const hotelPreferencesSchema = z.object({
  hotelType: z.string().min(1, "Hotel type is required"),
  roomPreference: z.string().min(1, "Room preference is required"),
  specificHotel: z.string().optional(),
});

const ferryPreferencesSchema = z.object({
  ferryClass: z.string().min(1, "Ferry class is required"),
  travelTimeSlot: z.string().min(1, "Travel time slot is required"),
  preferredFerry: z.string().optional(),
});

const addOnsSchema = z.object({
  airportPickup: z.boolean(),
  privateGuide: z.boolean(),
  mealPreference: z.string().min(1, "Meal preference is required"),
  transportation: z.string().min(1, "Transportation is required"),
});

export const step3Schema = z
  .object({
    hotelPreferences: hotelPreferencesSchema,
    ferryPreferences: ferryPreferencesSchema,
    addOns: addOnsSchema,
  })
  .strip();

// Main form schema with lazy validation for better performance
export const tripFormSchema = z.object({
  personalDetails: personalDetailsSchema,
  tripDetails: tripDetailsSchema,
  travelGoals: z.array(z.string()).min(1, "Select at least one travel goal"),
  specialOccasion: z.array(z.string()).optional(),
  itinerary: z
    .array(itineraryItemSchema)
    .min(1, "At least one day must be planned"),
  hotelPreferences: hotelPreferencesSchema,
  ferryPreferences: ferryPreferencesSchema,
  addOns: addOnsSchema,
});

export type TripFormData = z.infer<typeof tripFormSchema>;
