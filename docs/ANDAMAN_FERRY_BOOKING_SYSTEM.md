# Andaman Ferry Booking System - API Documentation & User Flow

## Overview

This document consolidates the API documentation for three ferry operators in Andaman:

1. **Sealink Adventures** (Sealink & Nautika vessels)
2. **Makruzz** (Makruzz & Makruzz Gold vessels)
3. **Green Ocean Seaways** (Green Ocean 1 & Green Ocean 2 vessels)

## Ferry Operators Comparison

| Feature            | Sealink Adventures                | Makruzz                                    | Green Ocean Seaways                             |
| ------------------ | --------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| **Authentication** | Username + Token                  | Username + Password → Token                | Public Key + Hash                               |
| **Base URL**       | `https://api.gonautika.com:8012/` | `https://staging.makruzz.com/booking_api/` | `https://tickets.greenoceanseaways.com/api/v1/` |
| **Security**       | Token-based                       | Token-based                                | SHA-512 Hash                                    |
| **Seat Selection** | Manual selection required         | Auto-assignment available                  | Manual + Temporary blocking                     |
| **Date Format**    | dd-mm-yyyy                        | yyyy-mm-dd                                 | dd-mm-yyyy                                      |
| **Class Types**    | Luxury (L), Royal (R)             | Premium, Deluxe                            | Economy, Premium, Royal                         |

---

## 1. SEALINK ADVENTURES API

### Base Configuration

- **Dev URL**: `http://api.dev.gonautika.com:8012/`
- **Production URL**: `http://api.gonautika.com:8012/`
- **Authentication**: Username + Token
- **Date Format**: dd-mm-yyyy
- **Vessels**: Sealink (ID: 1), Nautika (ID: 2)

### API Endpoints

#### 1.1 Get Trip Data

```javascript
// Request
{
    date: "2-9-2022",           // dd-mm-yyyy
    from: "Port Blair",         // Port Blair, Swaraj Dweep, Shaheed Dweep
    to: "Swaraj Dweep",
    userName: "<username>",
    token: "<token>"
}

// Response Structure
{
    err: null,
    data: [
        {
            id: "unique_identifier",
            tripId: 123456,
            vesselID: 1,                    // 1=Sealink, 2=Nautika
            aTime: {hour: 9, minute: 30},   // Arrival time
            dTime: {hour: 8, minute: 0},    // Departure time
            from: "Port Blair",
            to: "Swaraj Dweep",
            pClass: [                       // Luxury class seats
                {
                    isBlocked: 0,
                    isBooked: 0,
                    number: "1A",
                    tier: "L"
                }
            ],
            bClass: [                       // Royal class seats
                {
                    isBlocked: 0,
                    isBooked: 0,
                    number: "1H",
                    tier: "R"
                }
            ],
            fares: {
                pBaseFare: 1200,           // Luxury base fare
                bBaseFare: 1500,           // Royal base fare
                infantFare: 0
            }
        }
    ]
}
```

#### 1.2 Book Seats (Manual Selection)

```javascript
// Request
[
  {
    id: "<trip.id>",
    tripId: 123456,
    vesselID: 1,
    from: "Port Blair",
    to: "Swaraj Dweep",
    bookingTS: 1658394999,
    paxDetail: {
      email: "user@example.com",
      phone: "9999999999",
      gstin: "",
      pax: [
        {
          name: "John Doe",
          age: 30,
          gender: "M", // M/F
          nationality: "Indian",
          photoId: "Aadhar",
          expiry: "01-01-2030", // dd-mm-yyyy
          seat: "1H",
          tier: "L", // L=Luxury, R=Royal
        },
      ],
      infantPax: [],
    },
    userData: {
      apiUser: {
        userName: "<username>",
        agency: "<agency>",
        token: "<token>",
        walletBalance: 2000,
      },
    },
    paymentData: {
      gstin: "",
    },
    token: "<encrypted_token>",
    userName: "<username>",
  },
][
  // Response
  {
    seatStatus: true,
    pnr: "ABC123",
    index: 0,
    requestData: "<original_request>",
  }
];
```

#### 1.3 Book Seats Auto (Auto Assignment)

```javascript
// Request
{
    bookingData: [{
        bookingTS: 1668756991,
        id: "636155c0eacec57893700f4b",
        tripId: 1668823200,
        vesselID: 2,
        from: "Port Blair",
        to: "Swaraj Dweep",
        paxDetail: {
            email: "user@example.com",
            phone: "9999999999",
            pax: [{
                id: 1,
                title: "MR",
                name: "John Doe",
                age: "30",
                gender: "M",
                nationality: "India",
                passport: "",
                tier: "",
                seat: "",
                baseFare: 0,
                isCancelled: 0
            }],
            infantPax: [],
            bClassSeats: [],
            pClassSeats: []
        },
        userData: {
            apiUser: {
                userName: "<username>",
                agency: "<agency>",
                token: "<token>",
                walletBalance: 0
            }
        },
        bookingPref: {
            bookingClass: "Premium",        // Premium/Luxury
            mode: "strict"                  // strict/flex
        }
    }],
    userName: "<username>",
    token: "<token>"
}
```

---

## 2. MAKRUZZ API

### Base Configuration

- **Base URL**: `https://staging.makruzz.com/booking_api/`
- **Authentication**: Username + Password → Token
- **Date Format**: yyyy-mm-dd
- **Vessels**: Makruzz, Makruzz Gold

### API Endpoints

#### 2.1 Login

```javascript
// Request
{
    data: {
        username: "agent_username",
        password: "agent_password"
    }
}

// Response
{
    data: {
        token: "base64_token",
        agent_data: {
            agent_name: "Agent Name",
            business_name: "Business Name",
            business_email: "email@example.com",
            agent_contact: "9999999999"
        }
    },
    msg: "Successfully Login",
    code: "200"
}
```

#### 2.2 Get Sectors

```javascript
// Response
{
    data: [
        {id: "1", title: "Port Blair", code: "PB"},
        {id: "2", title: "Havelock", code: "SW(HL)"}, // Swaraj dweep
        {id: "3", title: "Neil island", code: "SH(NL)"}, // Shaheed dweep
        {id: "4", title: "Baratang", code: "BT"}
    ],
    msg: "Sectors Successfully listed",
    code: "200"
}
```

#### 2.3 Schedule Search

```javascript
// Request
{
    data: {
        trip_type: "single_trip",       // single_trip/return_trip
        from_location: "1",
        to_location: "2",
        travel_date: "2024-05-28",      // yyyy-mm-dd
        no_of_passenger: "2"
    }
}

// Response
{
    data: [{
        id: "764",
        source_location_id: "2",
        destination_location_id: "1",
        departure_time: "08:00:00",
        arrival_time: "09:30:00",
        from_date: "2024-09-01",
        to_date: "2025-06-30",
        ship_title: "Makruzz",
        ship_class_title: "Premium",
        total_seat: "192",
        ship_class_price: "1725",
        seat: 192,                      // Available seats
        "cgst%": 9,
        cgst_amount: 155.25,
        "ugst%": 9,
        ugst_amount: 155.25,
        psf: 50,                        // Port fee
        commision: "20.00"
    }],
    msg: "Schedules Successfully Fetched",
    code: "200"
}
```

#### 2.4 Save Passengers

```javascript
// Request
{
    data: {
        passenger: {
            "1": {
                title: "MR",
                name: "John Doe",
                age: "32",
                sex: "male",                // male/female
                nationality: "indian",
                fcountry: "",               // For foreigners
                fpassport: "",              // For foreigners
                fexpdate: ""                // For foreigners
            }
        },
        c_name: "Contact Name",
        c_mobile: "9999999999",
        c_email: "contact@example.com",
        p_contact: "123456",
        c_remark: "Booking notes",
        no_of_passenger: "1",
        schedule_id: "764",
        travel_date: "2024-05-28",
        class_id: "14",
        fare: "1725",
        tc_check: true
    }
}

// Response
{
    data: {
        booking_id: 2723,
        schedule_id: "764",
        class_id: "14",
        travel_date: "2024-05-28"
    },
    msg: "Passenger Details Saved",
    code: "200"
}
```

#### 2.5 Confirm Booking

```javascript
// Request
{
    data: {
        booking_id: "2723"
    }
}

// Response
{
    data: {
        pnr: "ABC123"
    },
    msg: "PNR Successfully Generated",
    code: "200"
}
```

---

## 3. GREEN OCEAN SEAWAYS API

### Base Configuration

- **Base URL**: `https://tickets.greenoceanseaways.com/test-v-1.0-api/`
- **Authentication**: Public Key + SHA-512 Hash
- **Date Format**: dd-mm-yyyy
- **Vessels**: Green Ocean 1, Green Ocean 2
- **Locations**: 1=Port Blair, 2=Havelock, 3=Neil

### Hash Generation

```javascript
// Node.js example
const crypto = require("crypto");
const hash = crypto.createHash("sha512");
const hashString = "param1|param2|param3|private_key";
const generatedHash = hash.update(hashString, "utf-8").digest("hex");
```

### API Endpoints

#### 3.1 Route Details (Search)

```javascript
// Request
{
    from_id: 1,                     // 1=Port Blair, 2=Havelock, 3=Neil
    dest_to: 2,
    number_of_adults: 1,
    number_of_infants: 0,
    travel_date: "24-09-2024",      // dd-mm-yyyy
    public_key: "public_key",
    hash_string: "generated_hash"   // from_id|dest_to|number_of_adults|number_of_infants|travel_date|public_key|private_key
}

// Response
{
    status: "success",
    message: "available route details",
    data: {
        "1": [{                     // Route ID
            departure: "06:30 AM",
            arrival: "08:45 AM",
            ferry_name: "Green Ocean 1",
            ferry_id: 2,
            class_name: "Economy",
            class_id: 1,
            route_id: 1,
            seat_available: 144,
            adult_seat_rate: 1150,
            infant_seat_rate: 0,
            port_fee: 50,
            port_fee_infant: 0,
            port_fee_status: 1,         // 0=not taking, 1=taking
            is_port_fee_included: 0,    // 0=not included, 1=included
            gst_status: 0,              // 0=not applicable, 1=applicable
            cgst: 0,                    // % rate
            ugst: 0                     // % rate
        }]
    }
}
```

#### 3.2 Seat Layout

```javascript
// Request
{
    route_id: 1,
    ferry_id: 2,
    class_id: 1,
    public_key: "public_key",
    hash_string: "generated_hash",  // from_id|dest_to|ship_id|route_id|class_id|travel_date|public_key|private_key
    bootstrap_css: true,            // Include CSS
    html_response: false            // Return JSON instead of HTML
}

// Response
{
    status: "success",
    message: "seat layout details",
    data: {
        layout: [{
            seat_no: "2",
            seat_numbering: "E1",
            status: "available"         // available/booked
        }]
    }
}
```

#### 3.3 Temporary Seat Block

```javascript
// Request
{
    ship_id: 2,
    from_id: 1,
    dest_to: 2,
    route_id: 1,
    class_id: 1,
    travel_date: "24-09-2024",
    seat_id: [3, 4],                // Array of seat IDs
    public_key: "public_key",
    hash_string: "generated_hash"   // ship_id|from_id|dest_to|route_id|class_id|travel_date|seat_id|public_key|private_key
}

// Response
{
    status: "success",
    message: "Seat can be booked",
    seat_fare: [{
        agent_commission: 350,
        seat_rate_adult: 1150,
        seat_rate_children: 0
    }]
}
```

#### 3.4 Book Ticket

```javascript
// Request
{
    ship_id: 2,
    from_id: 1,
    dest_to: 2,
    route_id: 1,
    class_id: 1,
    number_of_adults: 2,
    number_of_infants: 0,
    passenger_prefix: ["Mr", "Mrs"],
    passenger_name: ["John Doe", "Jane Doe"],
    passenger_age: ["34", "30"],
    gender: ["Male", "Female"],
    nationality: ["Indian", "Indian"],
    passport_numb: ["", ""],        // Required for foreigners
    passport_expairy: ["", ""],     // dd-mm-yyyy for foreigners
    country: ["", ""],              // Required for foreigners
    infant_prefix: [],
    infant_name: [],
    infant_age: [],                 // Max age 2 years
    infant_gender: [],
    travel_date: "24-09-2024",
    seat_id: [5, 6],
    public_key: "public_key",
    hash_string: "generated_hash"   // ship_id|from_id|dest_to|route_id|class_id|number_of_adults|number_of_infants|travel_date|seat_id|public_key|private_key
}

// Response
{
    status: "success",
    message: "Ticket Booked",
    pnr: "ABC123",
    total_amount: 2400,
    total_commission: 700,
    adult_no: 2,
    infant_no: 0,
    ferry_id: 2,
    travel_date: "2024-09-24 06:30:00",
    pdf_base64: "base64_encoded_pdf"
}
```

---

## RECOMMENDED USER FLOW

Based on the API analysis, here's the optimal user flow:

### Phase 1: Search & Discovery

```
User Input Form:
├── From Location (dropdown)
├── To Location (dropdown)
├── Travel Date (date picker)
├── Adults Count (number)
├── Infants Count (number)
└── [Search Button]
```

**API Calls (Parallel)**:

1. Sealink: `getTripData`
2. Makruzz: `schedule_search`
3. Green Ocean: `route-details`

### Phase 2: Results Aggregation & Display

```
Ferry Results List:
├── Ferry Card 1 (Sealink - Nautika)
│   ├── Departure: 08:00 | Arrival: 09:30
│   ├── Duration: 1h 30m
│   ├── Classes Available:
│   │   ├── Luxury: ₹1,200 (45 seats)
│   │   └── Royal: ₹1,500 (20 seats)
│   └── [Select Button]
├── Ferry Card 2 (Makruzz Gold)
│   ├── Departure: 08:30 | Arrival: 10:00
│   ├── Duration: 1h 30m
│   ├── Classes Available:
│   │   └── Premium: ₹1,725 (150 seats)
│   └── [Select Button]
└── Ferry Card 3 (Green Ocean 1)
    ├── Departure: 06:30 | Arrival: 08:45
    ├── Duration: 2h 15m
    ├── Classes Available:
    │   ├── Economy: ₹1,150 (144 seats)
    │   ├── Premium: ₹1,500 (94 seats)
    │   └── Royal: ₹1,700 (48 seats)
    └── [Select Button]
```

### Phase 3: Class Selection & Seat Selection

**For Green Ocean (Manual Seat Selection):**

```
1. User selects ferry + class
2. Call: Green Ocean `seat-layout` API
3. Display seat map with available/booked status
4. User selects specific seats
5. Call: Green Ocean `temporary-seat-block` API
6. Proceed to passenger details
```

**For Sealink (Manual Seat Selection):**

```
1. User selects ferry + class
2. Display seat grid from `getTripData` response
3. User selects specific seats
4. Proceed to passenger details (no temp blocking)
```

**For Makruzz (Auto Assignment):**

```
1. User selects ferry + class
2. No seat selection UI needed
3. Proceed directly to passenger details
```

### Phase 4: Passenger Details Form

```
Passenger Details Form:
├── Contact Information
│   ├── Email (required)
│   ├── Phone (required)
│   └── GSTIN (optional)
├── Adult Passengers (dynamic based on count)
│   ├── Title (Mr/Mrs/Ms)
│   ├── Full Name
│   ├── Age
│   ├── Gender
│   ├── Nationality
│   └── ID Document (if required)
├── Infant Passengers (if any)
└── [Proceed to Payment Button]
```

### Phase 5: Booking Confirmation

**Different booking flows per operator:**

**Green Ocean:**

```
1. Call: `book-ticket` API
2. Receive: PNR + PDF ticket
3. Show confirmation page
```

**Sealink:**

```
1. Call: `bookSeats` or `bookSeatsAuto` API
2. Receive: PNR confirmation
3. Show confirmation page
```

**Makruzz:**

```
1. Call: `savePassengers` API
2. Call: `confirm_booking` API
3. Receive: PNR confirmation
4. Show confirmation page
```

---

## IMPLEMENTATION RECOMMENDATIONS

### 1. **Lightweight Booking Session (Not Traditional Cart)**

Based on the API design and current system architecture, a traditional shopping cart is **not necessary** for ferry bookings, but we need a **booking session** because:

**Why No Traditional Cart:**

- Each booking is typically single-journey focused
- Seat blocking (Green Ocean) has time limits
- APIs are designed for immediate booking flow
- Users typically book all passengers at once

**Why We Need Booking Session:**

- **Seat reservations expire** (Green Ocean: temporary blocking)
- **Form data persistence** during multi-step booking
- **Integration with existing checkout** for mixed bookings (ferry + activities)
- **Mobile UX** - handle app backgrounding during seat selection

**Recommended Session Structure:**

```typescript
interface FerryBookingSession {
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
    routeData: any; // Original API response
  };
  selectedClass?: {
    classId: string;
    className: string;
    price: number;
  };
  seatReservation?: {
    seats: string[];
    reservationId?: string; // For Green Ocean
    expiryTime: Date;
  };
  passengers: PassengerDetail[];
  totalAmount: number;
  createdAt: Date;
  expiresAt: Date;
}
```

### 2. **API Aggregation Strategy**

**Unified Response Structure (aligned with current system patterns):**

```typescript
// src/types/ferry.types.ts
export interface UnifiedFerryResult {
  id: string; // Unique identifier across all operators
  operator: "sealink" | "makruzz" | "greenocean";
  operatorFerryId: string; // Original ferry ID from operator
  ferryName: string;
  route: {
    from: Location;
    to: Location;
    fromCode: string; // Port codes
    toCode: string;
  };
  schedule: {
    departureTime: string; // "HH:MM"
    arrivalTime: string;
    duration: string; // "1h 30m"
    date: string; // "YYYY-MM-DD"
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
    // Store original API response for booking
    originalResponse: any;
    bookingEndpoint: string;
    authToken?: string;
  };
  isActive: boolean;
}

export interface FerryClass {
  id: string;
  name: string; // "Economy", "Premium", "Luxury", "Royal"
  price: number;
  availableSeats: number;
  amenities: string[];
  seatLayout?: SeatLayout; // Only if supports seat selection
}

export interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  number: string; // "1A", "2B", etc.
  status: "available" | "booked" | "blocked" | "selected";
  type: "window" | "aisle" | "middle";
  position: { row: number; column: number };
}
```

**API Aggregation Service:**

```typescript
// src/services/ferryAggregationService.ts
export class FerryAggregationService {
  private static async searchSealink(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Transform Sealink API response to unified format
  }

  private static async searchMakruzz(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Transform Makruzz API response to unified format
  }

  private static async searchGreenOcean(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Transform Green Ocean API response to unified format
  }

  public static async searchAllOperators(params: FerrySearchParams): Promise<{
    results: UnifiedFerryResult[];
    errors: { operator: string; error: string }[];
  }> {
    const promises = [
      this.searchSealink(params).catch((err) => ({
        operator: "sealink",
        error: err.message,
      })),
      this.searchMakruzz(params).catch((err) => ({
        operator: "makruzz",
        error: err.message,
      })),
      this.searchGreenOcean(params).catch((err) => ({
        operator: "greenocean",
        error: err.message,
      })),
    ];

    const responses = await Promise.allSettled(promises);

    const results: UnifiedFerryResult[] = [];
    const errors: { operator: string; error: string }[] = [];

    responses.forEach((response) => {
      if (response.status === "fulfilled") {
        if (Array.isArray(response.value)) {
          results.push(...response.value);
        } else {
          errors.push(response.value);
        }
      }
    });

    // Sort by departure time
    results.sort((a, b) =>
      a.schedule.departureTime.localeCompare(b.schedule.departureTime)
    );

    return { results, errors };
  }
}
```

### 3. **Integration with Existing Checkout System**

**Ferry State Management (Zustand Store):**

```typescript
// src/store/FerryStore.ts
export interface FerryStore {
  // Search & Results
  searchParams: FerrySearchParams;
  searchResults: UnifiedFerryResult[];
  isLoading: boolean;

  // Selection State
  selectedFerry: UnifiedFerryResult | null;
  selectedClass: FerryClass | null;
  selectedSeats: Seat[];

  // Booking Session
  bookingSession: FerryBookingSession | null;

  // Actions
  setSearchParams: (params: FerrySearchParams) => void;
  searchFerries: () => Promise<void>;
  selectFerry: (ferry: UnifiedFerryResult) => void;
  selectClass: (ferryClass: FerryClass) => void;
  selectSeats: (seats: Seat[]) => void;
  createBookingSession: () => void;
  proceedToCheckout: () => void;

  // Seat Management
  blockSeats: (seats: Seat[]) => Promise<void>; // For Green Ocean
  releaseSeats: () => Promise<void>;
}
```

**Integration with CheckoutStore:**

```typescript
// Extend existing CheckoutStore to support ferry bookings
interface CheckoutItem {
  type: "activity" | "ferry";
  activityBooking?: ActivityBooking;
  ferryBooking?: FerryBookingSession; // Add ferry support
}

// Add ferry initialization method
initializeFromFerrySession: (ferrySession: FerryBookingSession) => {
  set((state) => {
    state.bookingType = "ferry";
    state.activities = [
      {
        type: "ferry",
        ferryBooking: ferrySession,
      },
    ];
    state.isInitialized = true;
  });
};
```

### 4. **Mixed Booking Support**

**For activities + ferry combinations:**

```typescript
// src/hooks/useMixedBooking.ts
export const useMixedBooking = () => {
  const { cart: activityCart } = useActivityStore();
  const { bookingSession: ferrySession } = useFerryStore();
  const { initializeFromMixedCart } = useCheckoutStore();

  const proceedToMixedCheckout = () => {
    initializeFromMixedCart(activityCart, ferrySession ? [ferrySession] : []);
    router.push("/checkout");
  };

  return { proceedToMixedCheckout };
};
```

### 5. **Error Handling & Fallbacks**

**Robust API Integration:**

```typescript
// src/services/ferryApiService.ts
export class FerryApiService {
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 2;

  static async callWithFallback<T>(
    apiCalls: (() => Promise<T>)[],
    operatorName: string
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        return await Promise.race([
          ...apiCalls,
          this.timeoutPromise(this.TIMEOUT),
        ]);
      } catch (error) {
        lastError = error as Error;
        console.warn(`${operatorName} API attempt ${i + 1} failed:`, error);
      }
    }

    throw lastError!;
  }

  private static timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("API timeout")), ms)
    );
  }
}
```

**Caching Strategy:**

```typescript
// src/utils/ferryCache.ts
export class FerryCache {
  private static cache = new Map<string, { data: any; expiry: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  static set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });
  }

  static generateKey(params: FerrySearchParams, operator: string): string {
    return `${operator}:${params.from}:${params.to}:${params.date}:${params.adults}:${params.children}`;
  }
}
```

### 6. **Security & Environment Configuration**

**Environment Variables:**

```env
# Ferry API Credentials
# Sealink Configuration
SEALINK_USERNAME=your_username
SEALINK_TOKEN=your_token
SEALINK_API_URL=http://api.gonautika.com:8012/

MAKRUZZ_USERNAME=your_username
MAKRUZZ_PASSWORD=your_password
MAKRUZZ_API_URL=https://staging.makruzz.com/booking_api/

# Green Ocean Configuration
GREEN_OCEAN_PUBLIC_KEY=public-HGTBlexrva
GREEN_OCEAN_PRIVATE_KEY=private-vpFg9TP9D8
GREEN_OCEAN_API_URL=https://tickets.greenoceanseaways.com/test-v-1.0-api/

# Rate Limiting
FERRY_API_RATE_LIMIT=100 # requests per minute
```

**API Security:**

```typescript
// src/middleware/ferryApiSecurity.ts
export const validateApiAccess = (operator: string) => {
  const rateLimiter = new Map<string, number[]>();
  const RATE_LIMIT = parseInt(process.env.FERRY_API_RATE_LIMIT || "100");

  return (req: NextRequest) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const minute = Math.floor(now / 60000);

    if (!rateLimiter.has(ip)) {
      rateLimiter.set(ip, []);
    }

    const requests = rateLimiter.get(ip)!;
    const recentRequests = requests.filter((time) => time > minute - 1);

    if (recentRequests.length >= RATE_LIMIT) {
      throw new Error("Rate limit exceeded");
    }

    recentRequests.push(minute);
    rateLimiter.set(ip, recentRequests);
  };
};
```

### 7. **Payment Integration with Existing System**

**Ferry Payment Processing:**

```typescript
// Update existing payment verification to handle ferry bookings
// src/app/api/payments/verify/route.ts

const processFerryBooking = async (
  ferrySession: FerryBookingSession,
  payload: any
) => {
  const { operator, selectedFerry, selectedClass, seatReservation } =
    ferrySession;

  // Call appropriate operator API for final booking
  let bookingResult;
  switch (operator) {
    case "sealink":
      bookingResult = await SealinkAPI.confirmBooking(ferrySession);
      break;
    case "makruzz":
      bookingResult = await MakruzzAPI.confirmBooking(ferrySession);
      break;
    case "greenocean":
      bookingResult = await GreenOceanAPI.confirmBooking(ferrySession);
      break;
  }

  // Create booking record
  return await payload.create({
    collection: "bookings",
    data: {
      bookingType: "ferry",
      bookedFerries: [
        {
          operator,
          ferryName: selectedFerry.ferryName,
          route: selectedFerry.route,
          schedule: selectedFerry.schedule,
          selectedClass: selectedClass.name,
          seats: seatReservation?.seats || [],
          pnr: bookingResult.pnr,
          operatorBookingId: bookingResult.bookingId,
        },
      ],
      // ... other booking fields
    },
  });
};
```

### 8. **Recommended User Flow Implementation**

**Step-by-step integration with existing patterns:**

1. **Search Page:** `/ferry` (existing)
2. **Results Page:** `/ferry/results`
3. **Seat Selection:** `/ferry/[ferryId]/seats`
4. **Checkout:** `/checkout` (reuse existing with ferry support)
5. **Confirmation:** `/checkout` (step 3, existing confirmation component)

This approach provides a seamless experience while accommodating the different capabilities of each ferry operator's API and integrating perfectly with the existing activities booking system.

---

## INTEGRATION WITH EXISTING ACTIVITIES SYSTEM

### Summary of Design Decisions

**✅ Booking Session over Cart:** Use lightweight booking sessions for ferry bookings instead of persistent cart, because:

- Seat reservations expire quickly (Green Ocean: temporary blocking)
- Ferry bookings are typically immediate/single-journey
- Reduces complexity while maintaining UX

**✅ Reuse Existing Checkout:** Extend the current checkout system because:

- Consistent UX across activities and ferries
- Shared passenger details forms
- Mixed booking support (activities + ferries)
- Unified payment processing

**✅ Separate Ferry Store:** Create dedicated FerryStore while integrating with CheckoutStore because:

- Ferry-specific logic (seat selection, API aggregation)
- Different state management needs
- Clean separation of concerns

### Key Integration Points

1. **State Management:**

   ```typescript
   FerryStore (search, selection) → CheckoutStore (booking, payment)
   ActivityStore (cart) + FerryStore (session) → CheckoutStore (mixed booking)
   ```

2. **User Flows:**

   ```
   Ferry Only: /ferry → /ferry/results → /ferry/[id]/seats → /checkout
   Mixed: Activities cart + Ferry selection → /checkout
   ```

3. **API Structure:**
   ```
   Ferry APIs → Aggregation Service → Unified Response → UI Components
   ```

### Implementation Priority (Ferry-specific)

**Phase 1: Core Ferry Booking**

1. Create FerryStore and API aggregation service
2. Build ferry search and results pages
3. Implement seat selection for each operator
4. Integrate with existing checkout (ferry-only bookings)

**Phase 2: Enhanced Features**

1. Mixed booking support (activities + ferries)
2. Round-trip booking flows
3. Advanced error handling and fallbacks
4. Caching and performance optimization

**Phase 3: Advanced Features**

1. Real-time seat availability updates
2. Group booking support
3. Loyalty program integration
4. Advanced analytics and reporting

### Environment Variables Required

```env
# Ferry API Credentials (add to existing .env)
# Sealink Configuration
SEALINK_USERNAME=
SEALINK_TOKEN=
MAKRUZZ_USERNAME=
MAKRUZZ_PASSWORD=
GREEN_OCEAN_PUBLIC_KEY=
GREEN_OCEAN_PRIVATE_KEY=

# API URLs
SEALINK_API_URL=http://api.gonautika.com:8012/
MAKRUZZ_API_URL=https://staging.makruzz.com/booking_api/
GREEN_OCEAN_API_URL=https://tickets.greenoceanseaways.com/test-v-1.0-api/

# Rate Limiting
FERRY_API_RATE_LIMIT=100
```

### Database Updates Required

**Extend Existing Collections:**

1. **Bookings Collection** - Add ferry booking fields (already supports `bookingType: "ferry"`)
2. **BookingSessions Collection** - Add ferry session support

**New Collections (Optional):**

1. **FerryOperators** - Store operator metadata and credentials
2. **FerryRoutes** - Cache popular routes for better performance

### Testing Considerations

1. **API Integration Tests** - Mock all three ferry APIs
2. **Seat Selection Logic** - Test different operator seat selection flows
3. **Payment Integration** - Test ferry booking payment flows
4. **Mixed Booking Tests** - Test activities + ferry combinations
5. **Error Handling** - Test API failures and fallbacks

This ferry booking system integrates seamlessly with your existing activities booking architecture while maintaining the simplicity and efficiency required for ferry bookings.
