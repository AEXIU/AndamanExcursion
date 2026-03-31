// Validation-related constants

export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s'-]+$/,
    ERROR_MESSAGES: {
      MIN: "Name must be at least 2 characters",
      MAX: "Name must not exceed 100 characters", 
      PATTERN: "Name must contain only letters, spaces, apostrophes, and hyphens",
    },
  },
  AGE: {
    MIN: 1,
    MAX: 120,
    ERROR_MESSAGES: {
      MIN: "Age must be at least 1",
      MAX: "Age must not exceed 120",
      INVALID: "Age must be a whole number",
    },
  },
  PASSPORT: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 12,
    PATTERN: /^[A-Za-z0-9]{6,12}$/,
    ERROR_MESSAGES: {
      MIN: "Passport number must be at least 6 characters",
      MAX: "Passport number must not exceed 12 characters",
      PATTERN: "Invalid passport format. Use only letters and numbers",
    },
  },
  PHONE: {
    PATTERN: /^\+?[0-9\s\-\(\)]{8,20}$/,
    MIN_LENGTH: 8,
    MAX_LENGTH: 20,
    ERROR_MESSAGES: {
      PATTERN: "Invalid phone number format",
      MIN: "Phone number must be at least 8 characters",
      MAX: "Phone number must not exceed 20 characters",
    },
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR_MESSAGES: {
      INVALID: "Please enter a valid email address",
      REQUIRED: "Email is required",
    },
  },
} as const;

// Form field requirements
export const FIELD_REQUIREMENTS = {
  PASSENGER_DETAILS: {
    REQUIRED: ["fullName", "age", "gender", "nationality", "passportNumber"],
    OPTIONAL: ["whatsappNumber", "email", "phoneCountryCode", "phoneCountry"],
  },
  PRIMARY_CONTACT: {
    REQUIRED: ["whatsappNumber", "email"],
    VALIDATION_LEVEL: "strict",
  },
  BOOKING_FORM: {
    MIN_PASSENGERS: 1,
    MAX_PASSENGERS: 10,
    REQUIRED_FIELDS: ["termsAccepted"],
  },
} as const;

// Storage and session constants
export const STORAGE_CONFIG = {
  FORM_PERSISTENCE: {
    KEY: "contact_form_data",
    EXPIRY_MINUTES: 30,
    VERSION: "1.0",
  },
  CHECKOUT_SESSION: {
    KEY: "checkout_session",
    EXPIRY_MINUTES: 15,
    VERSION: "1.0",
  },
  FERRY_SEARCH: {
    KEY: "ferry_search_cache",
    EXPIRY_MINUTES: 5,
    VERSION: "1.0",
  },
} as const;

// Error message templates
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: (fieldName: string) => `${fieldName} is required`,
  MIN_LENGTH: (fieldName: string, min: number) => 
    `${fieldName} must be at least ${min} characters`,
  MAX_LENGTH: (fieldName: string, max: number) => 
    `${fieldName} must not exceed ${max} characters`,
  INVALID_FORMAT: (fieldName: string) => `Please enter a valid ${fieldName}`,
  TERMS_REQUIRED: "You must accept the terms and conditions",
  MIN_PASSENGERS: "At least one passenger is required",
  MAX_PASSENGERS: (max: number) => `Maximum ${max} passengers allowed`,
} as const;
