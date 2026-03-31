// Import the Location type from your Payload types
import type { Location } from "@payload-types";

export interface FeaturePackageCardProps {
  title: string;
  description: string;
  price: number;
  originalPrice?: number; // Optional original price for discount display
  locations: (string | Location)[]; // Array of location IDs or populated location objects
  duration: string;
  image: string;
  href: string;
  className?: string;
}
