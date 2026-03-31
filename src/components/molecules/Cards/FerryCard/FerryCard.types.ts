// Updated FerryCard.types.ts
export interface FerryCardProps {
  ferryName: string;
  rating: number;
  departureTime: string;
  departureLocation: string;
  arrivalTime: string;
  arrivalLocation: string;
  price: number;
  totalPrice: number;
  seatsLeft: number;
  operator: string;

  // Updated: Changed from onChooseSeats to onBookNow
  onBookNow?: () => void;

  // Removed: ferryClasses is no longer needed
  // ferryClasses: FerryClass[];

  className?: string;
  ferryIndex: number;
  detailsUrl: string;
}

// Keep these interfaces if they're still used elsewhere
export interface FerryClass {
  type: string;
  price: number;
  totalPrice: number;
  seatsLeft: number;
  amenities: Amenity[];
}

export interface Amenity {
  icon: React.ReactElement;
  label: string;
}
