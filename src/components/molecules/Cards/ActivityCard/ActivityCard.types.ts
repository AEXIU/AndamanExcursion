import { Media } from "@payload-types";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  isAvailable: boolean;
}

export interface TransformedActivityOption {
  id: string;
  type: string;
  description: string;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  seatsLeft: number;
  amenities: any[];
  // Updated to support Media objects
  media?: (string | Media)[];
}

export interface ActivityOption {
  id: string;
  type: string;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  description: string;
  seatsLeft: number;
  amenities?: {
    icon: string;
    label: string;
  }[];
  // Added to support media (images/videos)
  media?: (string | Media)[];
}

export interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  // Updated to support Media objects
  media: Array<{ src: string | Media; alt: string }>;
  price: number;
  totalPrice: number;
  originalPrice?: number; // Original price before discount
  originalTotalPrice?: number; // Original total price before discount
  type: string;
  duration: string;
  location?: string; // Location of the activity (e.g., "Havelock Island")
  totalGuests?: number; // Total number of guests/passengers
  href?: string;
  className?: string;
  activityOptions?: ActivityOption[];
  availableTimeSlots?: Array<{
    id: string;
    startTime: string;
    endTime?: string;
    displayTime: string;
    isAvailable: boolean;
  }>;
  onSelectActivity?: (activityId: string, optionId: string) => void;
  selectedOptionId?: string;
  maxTimeSlots?: number;
  timeSlots?: string[];
}
