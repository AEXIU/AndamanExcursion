export interface TripFormData {
  // Step 1: Personal & Trip Details
  personalDetails: {
    name: string;
    email: string;
    phone: string;
  };

  tripDetails: {
    arrivalDate: string;
    departureDate: string;
    adults: number;
    children: number;
  };
  travelGoals: string[];
  specialOccasion: string[];

  // Step 2: Intinerary planning
  itinerary: Array<{
    day: number;
    date: string;
    destination: string;
    activity: string;
    notes?: string;
  }>;

  // Step 3: Travel Preferences
  hotelPreferences: {
    hotelType: string;
    roomPreference: string;
    specificHotel?: string;
  };
  ferryPreferences: {
    ferryClass: string;
    travelTimeSlot: string;
    preferredFerry?: string;
  };
  addOns: {
    airportPickup: boolean;
    privateGuide: boolean;
    mealPreference: string;
    transportation: string;
  };
}
