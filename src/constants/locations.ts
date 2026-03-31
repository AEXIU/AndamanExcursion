// Location-related constants and mappings

export interface LocationMapping {
  formValue: string;
  displayName: string;
  sealinkName: string;
  makruzzId: string;
  greenOceanId: number;
  aliases: string[];
  code: string;
}

export const LOCATION_MAPPINGS: Record<string, LocationMapping> = {
  "port-blair": {
    formValue: "port-blair",
    displayName: "Port Blair",
    sealinkName: "Port Blair",
    makruzzId: "1",
    greenOceanId: 1,
    aliases: ["Port Blair", "PB", "port-blair"],
    code: "PB",
  },
  havelock: {
    formValue: "havelock",
    displayName: "Havelock",
    sealinkName: "Swaraj Dweep",
    makruzzId: "2",
    greenOceanId: 2,
    aliases: ["Havelock", "Swaraj Dweep", "Havelock Island", "HL", "havelock"],
    code: "HL",
  },
  neil: {
    formValue: "neil",
    displayName: "Neil Island",
    sealinkName: "Shaheed Dweep",
    makruzzId: "3",
    greenOceanId: 3,
    aliases: ["Neil", "Shaheed Dweep", "Neil Island", "NL", "neil"],
    code: "NL",
  },
} as const;

// Common ferry routes
export const FERRY_ROUTES = [
  { from: "Port Blair", to: "Swaraj Dweep" },
  { from: "Port Blair", to: "Shaheed Dweep" },
  { from: "Swaraj Dweep", to: "Port Blair" },
  { from: "Shaheed Dweep", to: "Port Blair" },
  { from: "Swaraj Dweep", to: "Shaheed Dweep" },
  { from: "Shaheed Dweep", to: "Swaraj Dweep" },
] as const;

// Location code mappings
export const LOCATION_CODES: Record<string, string> = {
  "Port Blair": "PB",
  "Swaraj Dweep": "HL",
  "Shaheed Dweep": "NL",
  "Havelock": "HL",
  "Neil Island": "NL",
} as const;

// Helper functions
export const getLocationMapping = (formValue: string): LocationMapping | null => {
  return LOCATION_MAPPINGS[formValue.toLowerCase()] || null;
};

export const getSealinkLocationName = (formValue: string): string => {
  const mapping = getLocationMapping(formValue);
  return mapping?.sealinkName || "Port Blair"; // Default fallback
};

export const getMakruzzLocationId = (formValue: string): string => {
  const mapping = getLocationMapping(formValue);
  return mapping?.makruzzId || "1"; // Default to Port Blair
};

export const getGreenOceanLocationId = (formValue: string): number => {
  const mapping = getLocationMapping(formValue);
  return mapping?.greenOceanId || 1; // Default to Port Blair
};

export const getLocationCode = (locationName: string): string => {
  return LOCATION_CODES[locationName] || locationName.toUpperCase().slice(0, 2);
};

export const formatLocationName = (location: string): string => {
  const locationMap: Record<string, string> = {
    "port-blair": "Port Blair",
    havelock: "Havelock",
    neil: "Neil Island",
    swaraj: "Havelock",
    shaheed: "Neil Island",
  };
  return locationMap[location.toLowerCase()] || location;
};
