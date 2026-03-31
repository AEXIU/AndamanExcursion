// Types for package enquiry data transfer between pages

export interface PackageEnquiryData {
  // Package identification
  packageId: string;
  packageTitle: string;
  packageSlug: string;

  // Category and location info
  categoryId: string;
  categorySlug: string;

  // Duration/period info
  periodId: string;
  periodTitle: string;

  // Pricing info
  price: number;
  originalPrice?: number;

  // Basic package info for display
  shortDescription?: string;

  // Default booking settings (optional)
  defaultAdults?: number;
  defaultChildren?: number;
  defaultDuration?: number; // days
}

// Utility type for URL parameter encoding
export interface EnquiryURLParams {
  pkg?: string; // encoded package data
  ref?: string; // referrer page for analytics
}

// Type for the decoded and validated enquiry data
export interface ValidatedEnquiryData extends Partial<PackageEnquiryData> {
  isValid: boolean;
  source: "url" | "default" | "none";
}
