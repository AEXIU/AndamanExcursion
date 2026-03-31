// Form-related constants

// ✅ UNIFIED: Single source of truth for country data with phone codes, flags, and nationality mappings
export const COUNTRY_DATA = {
  "India": { code: "+91", flag: "🇮🇳", nationality: "Indian" },
  "USA": { code: "+1", flag: "🇺🇸", nationality: "American" },
  "UK": { code: "+44", flag: "🇬🇧", nationality: "British" },
  // "Canada": { code: "+1", flag: "🇨🇦", nationality: "Canadian" },
  "Australia": { code: "+61", flag: "🇦🇺", nationality: "Australian" },
  "Germany": { code: "+49", flag: "🇩🇪", nationality: "German" },
  "France": { code: "+33", flag: "🇫🇷", nationality: "French" },
  "Italy": { code: "+39", flag: "🇮🇹", nationality: "Italian" },
  "Spain": { code: "+34", flag: "🇪🇸", nationality: "Spanish" },
  "Japan": { code: "+81", flag: "🇯🇵", nationality: "Japanese" },
  "China": { code: "+86", flag: "🇨🇳", nationality: "Chinese" },
  "South Korea": { code: "+82", flag: "🇰🇷", nationality: "South Korean" },
  "Singapore": { code: "+65", flag: "🇸🇬", nationality: "Singapore" },
  "Malaysia": { code: "+60", flag: "🇲🇾", nationality: "Malaysian" },
  "Thailand": { code: "+66", flag: "🇹🇭", nationality: "Thai" },
  "Indonesia": { code: "+62", flag: "🇮🇩", nationality: "Indonesian" },
  "Philippines": { code: "+63", flag: "🇵🇭", nationality: "Filipino" },
  "Vietnam": { code: "+84", flag: "🇻🇳", nationality: "Vietnamese" },
  "Netherlands": { code: "+31", flag: "🇳🇱", nationality: "Dutch" },
  "Belgium": { code: "+32", flag: "🇧🇪", nationality: "Belgian" },
  "Switzerland": { code: "+41", flag: "🇨🇭", nationality: "Swiss" },
  "Austria": { code: "+43", flag: "🇦🇹", nationality: "Austrian" },
  "Sweden": { code: "+46", flag: "🇸🇪", nationality: "Swedish" },
  "Norway": { code: "+47", flag: "🇳🇴", nationality: "Norwegian" },
  "Denmark": { code: "+45", flag: "🇩🇰", nationality: "Danish" },
  "Finland": { code: "+358", flag: "🇫🇮", nationality: "Finnish" },
  "Russia": { code: "+7", flag: "🇷🇺", nationality: "Russian" },
  "Brazil": { code: "+55", flag: "🇧🇷", nationality: "Brazilian" },
  "Argentina": { code: "+54", flag: "🇦🇷", nationality: "Argentine" },
  "Chile": { code: "+56", flag: "🇨🇱", nationality: "Chilean" },
  "Mexico": { code: "+52", flag: "🇲🇽", nationality: "Mexican" },
  "South Africa": { code: "+27", flag: "🇿🇦", nationality: "South African" },
  "Egypt": { code: "+20", flag: "🇪🇬", nationality: "Egyptian" },
  "UAE": { code: "+971", flag: "🇦🇪", nationality: "Emirati" },
  "Saudi Arabia": { code: "+966", flag: "🇸🇦", nationality: "Saudi" },
  "Israel": { code: "+972", flag: "🇮🇱", nationality: "Israeli" },
  "Turkey": { code: "+90", flag: "🇹🇷", nationality: "Turkish" },
  "Greece": { code: "+30", flag: "🇬🇷", nationality: "Greek" },
  "Portugal": { code: "+351", flag: "🇵🇹", nationality: "Portuguese" },
  "Ireland": { code: "+353", flag: "🇮🇪", nationality: "Irish" },
  "New Zealand": { code: "+64", flag: "🇳🇿", nationality: "New Zealand" },
} as const;

// ✅ DERIVED: Nationality dropdown options (derived from unified data)
export const COUNTRIES = Object.entries(COUNTRY_DATA).map(([country, data]) => ({
  value: data.nationality,
  label: data.nationality,
}));

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export const SPECIAL_OCCASIONS = [
  { id: "honeymoon", label: "Honeymoon" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "solo", label: "Solo Trip" },
  { id: "other", label: "Other" },
] as const;

// Nationality mapping for API consistency
export const NATIONALITY_MAPPING = {
  "Indian": {
    api: "indian", // For Makruzz API (lowercase)
    display: "Indian",
    isIndian: true,
  },
  "American": {
    api: "foreigner",
    display: "American", 
    isIndian: false,
  },
  // Add more mappings as needed
} as const;

// Gender mapping for different APIs
export const GENDER_MAPPING = {
  "Male": {
    sealink: "M",
    makruzz: "male",
    greenocean: "Male",
    display: "Male",
  },
  "Female": {
    sealink: "F", 
    makruzz: "female",
    greenocean: "Female",
    display: "Female",
  },
  "Other": {
    sealink: "M", // Fallback
    makruzz: "male", // Fallback
    greenocean: "Male", // Fallback
    display: "Other",
  },
} as const;

// Title mapping based on gender
export const TITLE_MAPPING = {
  "Male": "MR",
  "Female": "MRS", 
  "Other": "MR", // Fallback
} as const;

// ✅ DERIVED: Phone input country codes (derived from unified data)
export const PHONE_COUNTRY_CODES = Object.entries(COUNTRY_DATA).map(([country, data]) => ({
  code: data.code,
  country,
  flag: data.flag,
}));

// ✅ DERIVED: Nationality to country code mapping (derived from unified data)
export const NATIONALITY_TO_COUNTRY_CODE = Object.entries(COUNTRY_DATA).reduce((acc, [country, data]) => {
  acc[data.nationality] = { code: data.code, country };
  return acc;
}, {} as Record<string, { code: string; country: string }>);
