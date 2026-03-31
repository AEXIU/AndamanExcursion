import React from "react";
import {
  Snowflake,
  Armchair,
  Crown,
  Plane,
  Coffee,
  Utensils,
  Wifi,
  ArrowUpCircle,
} from "lucide-react";

// Map amenities from API to semantic icons
export const amenityIconMapping: Record<
  string,
  { icon: React.ComponentType<any>; color: string }
> = {
  AC: { icon: Snowflake, color: "text-blue-500" },
  "Basic Seating": { icon: Armchair, color: "text-gray-500" },
  "Comfortable Seating": { icon: Armchair, color: "text-green-500" },
  "Premium Seating": { icon: Crown, color: "text-purple-500" },
  "More Legroom": { icon: ArrowUpCircle, color: "text-blue-600" },
  "Priority Boarding": { icon: Plane, color: "text-orange-500" },
  Refreshments: { icon: Coffee, color: "text-amber-600" },
  Meal: { icon: Utensils, color: "text-red-500" },
  WiFi: { icon: Wifi, color: "text-indigo-500" },
};

export const getAmenityIcon = (amenityLabel: string) => {
  const mapping = amenityIconMapping[amenityLabel];
  if (!mapping) {
    // Default fallback
    return { icon: Armchair, color: "text-gray-400" };
  }
  return mapping;
};
