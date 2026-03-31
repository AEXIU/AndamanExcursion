export interface FerryBookingSession {
  sessionId: string;
  searchParams: {
    from: string;
    to: string;
    date: string;
    adults: number;
    children: number;
    infants: number;
  };
  selectedFerry?: {
    operator: "sealink" | "makruzz" | "greenocean";
    ferryId: string;
    ferryName: string;
    routeData: any;
    fromLocation: string;
    toLocation: string;
    schedule: {
      departureTime: string;
      arrivalTime: string;
      duration: string;
      date: string;
    };
    duration: string;
  };
  selectedClass?: {
    classId: string;
    className: string;
    price: number;
  };
  seatReservation?: {
    seats: Seat[]; // Changed from string[] to Seat[] to store complete seat objects
    reservationId?: string; // for green ocean
    expiryTime: Date;
  };
  passengers: PassengerDetail[];
  totalAmount: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface PassengerDetail {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
}

export interface Location {
  name: string;
  code: string;
}

export interface UnifiedFerryResult {
  id: string;
  operator: "sealink" | "makruzz" | "greenocean";
  operatorFerryId: string;
  ferryName: string;
  route: {
    from: Location;
    to: Location;
    fromCode: string;
    toCode: string;
  };
  schedule: {
    departureTime: string;
    arrivalTime: string;
    duration: string;
    date: string;
  };
  classes: FerryClass[];
  availability: {
    totalSeats: number;
    availableSeats: number;
    lastUpdated: string;
  };
  pricing: {
    baseFare: number;
    taxes: number;
    portFee: number;
    total: number;
    currency: "INR";
  };
  features: {
    supportsSeatSelection: boolean;
    supportsAutoAssignment: boolean;
    hasWiFi?: boolean;
    hasAC?: boolean;
    mealIncluded?: boolean;
  };
  operatorData: {
    originalResponse: any;
    bookingEndpoint: string;
    authToken?: string;
  };
  isActive: boolean;
  // Backward compatibility properties
  duration?: string;
  fromLocation?: string;
  toLocation?: string;
  selectedClass?: FerryClass;
  selectedSeats?: string[];
}

export interface FerryClass {
  id: string;
  name: string;
  className?: string; // Alternative property for backward compatibility
  pricing: {
    // Added structured pricing object
    basePrice: number;
    taxes?: number;
    fees?: number;
    total: number;
  };
  price: number; // Keep for backward compatibility
  availableSeats: number;
  amenities: string[];
  seatLayout?: SeatLayout;
}

export interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  seats: Seat[];
  layout_config?: {
    rows: number;
    seatsPerRow: number;
    aislePositions: number[];
    emergency_exits: number[];
  };
  // Add operator-specific data for conversion
  operatorData?: {
    sealink?: {
      id: string;
      tripId: number;
      from: string;
      to: string;
      dTime: { hour: number; minute: number };
      aTime: { hour: number; minute: number };
      vesselID: number;
      fares: {
        pBaseFare: number;
        bBaseFare: number;
        pBaseFarePBHLNL: number;
        bBaseFarePBHLNL: number;
        pIslanderFarePBHLNL: number;
        bIslanderFarePBHLNL: number;
        infantFare: number;
      };
      bClass: { [seatNumber: string]: SeaLinkSeatDetails };
      pClass: { [seatNumber: string]: SeaLinkSeatDetails };
    };
    greenocean?: {
      layout: {
        seat_no: string;
        seat_numbering: string;
        status: string;
      }[];
      booked_seat: string[];
      class_type: number;
    };
    makruzz?: {
      seats: {
        seat_id: string;
        status: "available" | "booked";
      }[];
    };
  };
}

export interface SeaLinkSeatDetails {
  tier: "B" | "P";
  number: string;
  isBooked: 0 | 1;
  isBlocked: 0 | 1;
}

export interface Seat {
  id: string;
  number: string;
  seat_numbering?: string; // For Green Ocean compatibility
  status:
  | "available"
  | "booked"
  | "blocked"
  | "selected"
  | "temporarily_blocked";
  type?: "window" | "aisle" | "middle";
  position?: { row: number; column: number };
  price?: number;
  isAccessible?: boolean;
  isPremium?: boolean;
  // Additional properties for operator-specific data
  tier?: "B" | "P"; // For SeaLink business/premium classification
  displayNumber?: string; // For display purposes
}

export interface FerrySearchParams {
  from: string;
  to: string;
  date: string;
  adults: number;
  children: number; // DEPRECATED: Keep for backward compatibility, always 0
  infants: number;
}

// Additional utility types for component props
export interface SeatSelectionData {
  selectedSeats: Seat[];
  totalPrice: number;
  seatIds: string[];
}

export interface FerryOperatorCapabilities {
  supportsSeatSelection: boolean;
  supportsAutoAssignment: boolean;
  requiresManualSelection: boolean;
  showsSeatPreference: boolean;
}
