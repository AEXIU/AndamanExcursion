// Import the actual PayloadCMS generated types
import type { Package } from "@payload-types";

// Use the auto-generated Package type from PayloadCMS
export type PayloadPackage = Package & {
  // Add any additional processed fields if needed
  images?: Array<{
    url: string;
    alt: any;
    caption?: any;
  }>;
};

export interface PackageDetailHeaderProps {
  packageData: PayloadPackage;
}
