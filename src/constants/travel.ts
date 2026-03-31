// Travel and booking-related constants

export const HOTEL_TYPES = [
  { value: "2-star", label: "2 Star" },
  { value: "3-star", label: "3 Star" },
  { value: "4-star", label: "4 Star" },
  { value: "5-star", label: "5 Star" },
  { value: "premium", label: "Premium" },
];

export const ROOM_PREFERENCES = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "premium", label: "Premium" },
  { value: "suite", label: "Suite" },
];

export const FERRY_CLASSES = [
  { value: "economy", label: "Economy" },
  { value: "luxury", label: "Luxury Class" },
  { value: "premium", label: "Premium" },
  { value: "royal", label: "Royal Class" },
];

export const TIME_SLOTS = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
];

export const FERRY_COMPANIES = [
  { value: "makruzz", label: "Makruzz Pearl" },
  { value: "green-ocean", label: "Green Ocean" },
  { value: "nautika", label: "Nautika" },
  { value: "sealink", label: "Sealink Adventures" },
];

export const MEAL_PREFERENCES = [
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-Vegetarian" },
  { value: "both", label: "Both" },
  { value: "jain", label: "Jain" },
  { value: "vegan", label: "Vegan" },
];

export const TRANSPORTATION_OPTIONS = [
  { value: "taxi", label: "Taxi" },
  { value: "scooter", label: "Scooter" },
  { value: "car", label: "Car" },
  { value: "bus", label: "Bus" },
  { value: "auto", label: "Auto Rickshaw" },
];

// Ferry operator mapping for API consistency
export const FERRY_OPERATOR_MAPPING = {
  "sealink": {
    displayName: "Sealink Adventures",
    apiName: "sealink",
    vesselId: 1,
  },
  "nautika": {
    displayName: "Nautika",
    apiName: "nautika", 
    vesselId: 2,
  },
  "makruzz": {
    displayName: "Makruzz Pearl",
    apiName: "makruzz",
    vesselId: null,
  },
  "green-ocean": {
    displayName: "Green Ocean",
    apiName: "greenocean",
    vesselId: null,
  },
} as const;

// Booking status constants
export const BOOKING_STATUS = {
  DRAFT: "draft",
  CONFIRMED: "confirmed", 
  CANCELLED: "cancelled",
  PENDING: "pending",
  FAILED: "failed",
} as const;

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;
