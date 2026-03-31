// Default values used throughout the application

export const DEFAULT_VALUES = {
  // User defaults
  NATIONALITY: "Indian",
  GENDER: "",
  PHONE_COUNTRY_CODE: "+91",
  PHONE_COUNTRY: "India",
  
  // Age defaults
  PRIMARY_MEMBER_AGE: "",
  CHILD_AGE: 12,
  INFANT_MAX_AGE: 2,
  
  // Location defaults
  DEFAULT_LOCATION: "port-blair",
  FALLBACK_LOCATION: "Port Blair",
  
  // Booking defaults
  MIN_ADULTS: 1,
  MAX_ADULTS: 10,
  MIN_CHILDREN: 0,
  MAX_CHILDREN: 8,
  MIN_INFANTS: 0,
  MAX_INFANTS: 4,
  
  // Ferry defaults
  DEFAULT_FERRY_CLASS: "economy",
  DEFAULT_TIME_PREFERENCE: null,
  
  // Form defaults
  DEBOUNCE_DELAY: 2000, // ms
  AUTO_SAVE_DELAY: 1000, // ms
  
  // API defaults
  REQUEST_TIMEOUT: 30000, // ms
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms
} as const;

// Country code mappings for phone numbers
export const COUNTRY_CODES = {
  "India": "+91",
  "USA": "+1", 
  "UK": "+44",
  "Australia": "+61",
  "Canada": "+1",
  "Singapore": "+65",
  "Malaysia": "+60",
  "Thailand": "+66",
  "UAE": "+971",
  "Saudi Arabia": "+966",
} as const;

// Currency defaults
export const CURRENCY = {
  DEFAULT: "INR",
  SYMBOL: "₹",
  DECIMAL_PLACES: 2,
} as const;

// Date format defaults
export const DATE_FORMATS = {
  DISPLAY: "DD MMM YYYY",
  API: "YYYY-MM-DD", 
  SEALINK: "DD-MM-YYYY",
  MAKRUZZ: "YYYY-MM-DD",
  GREEN_OCEAN: "DD-MM-YYYY",
} as const;
