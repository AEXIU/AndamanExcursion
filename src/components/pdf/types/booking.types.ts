export interface BookingPDFData {
  bookingId: string;
  confirmationNumber: string;
  bookingDate: string;
  status: string;
  bookingType: "activity" | "ferry" | "boat" | "package" | "mixed";
  customerInfo: {
    primaryContactName: string;
    customerEmail: string;
    customerPhone: string;
    nationality?: string;
  };
  bookedActivities?: Array<{
    activity: any;
    activityOption?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    scheduledTime?: string;
    location?: any;
    passengers: {
      adults: number;
      children: number;
      infants: number;
    };
  }>;
  bookedFerries?: Array<{
    operator: string;
    ferryName: string;
    route: {
      from: string;
      to: string;
      fromCode?: string;
      toCode?: string;
    };
    schedule: {
      departureTime: string;
      arrivalTime: string;
      duration?: string;
      travelDate: string;
    };
    selectedClass: {
      classId: string;
      className: string;
      price: number;
    };
    passengers: {
      adults: number;
      children: number;
      infants: number;
    };
    selectedSeats?: Array<{
      seatNumber: string;
      seatId?: string;
      passengerName?: string;
    }>;
    providerBooking?: {
      pnr?: string;
      operatorBookingId?: string;
      bookingStatus?: string;
    };
    totalPrice: number;
  }>;
  bookedBoats?: Array<{
    boatName: string;
    route: {
      from: string;
      to: string;
    };
    schedule: {
      departureTime: string;
      duration?: string;
      travelDate: string;
    };
    passengers: {
      adults: number;
      children: number;
      infants: number;
    };
    totalPrice: number;
  }>;
  passengers: Array<{
    isPrimary: boolean;
    fullName: string;
    age: number;
    gender: string;
    nationality: string;
    passportNumber?: string;
    idNumber?: string;
    ticketNumber?: string;
    whatsappNumber?: string;
    email?: string;
  }>;
  pricing: {
    subtotal: number;
    taxes: number;
    fees: number;
    totalAmount: number;
    currency: string;
    baseFare?: number;
    utgst?: number;
    cgst?: number;
    psf?: number;
    hsnCode?: string;
    paymentMode?: string;
  };
  specialRequests?: string;
  // Dynamic terms from ferry provider PDF (with fallback)
  termsAndConditions?: string[];
}

export interface BookingTicketPDFProps {
  data: BookingPDFData;
  logoUrl?: string;
  qrCodeUrl?: string;
}
