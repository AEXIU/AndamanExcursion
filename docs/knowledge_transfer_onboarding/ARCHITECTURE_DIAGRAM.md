# Andaman Excursion - System Architecture Diagrams

> **Purpose**: Visual representations of the system architecture for quick understanding of data flows, component relationships, and integration points.

---

## 📐 Complete System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer - Browser"]
        UI[React Components]
        Store[Zustand Stores]
        RQ[React Query Cache]
    end
    
    subgraph NextJS["Next.js Application"]
        FerryAPI["/api/ferry"]
        PaymentAPI["/api/payments"]
        ActivityAPI["/api/activities"]
    end
    
    subgraph Services["Service Layer"]
        FerryAgg[Ferry Aggregation]
        FerryBook[Ferry Booking]
        RazorpayService[Razorpay Service]
        PayloadAPI[Payload CMS]
        EmailService[Email Service]
        WhatsAppService[WhatsApp Service]
    end
    
    subgraph External["External Services"]
        SealinkAPI[Sealink API]
        GreenOceanAPI[Green Ocean API]
        MakruzzAPI[Makruzz API]
        RazorpayGateway[Razorpay]
        ResendAPI[Resend]
        TwilioAPI[Twilio]
    end
    
    subgraph Data["Data Layer"]
        MongoDB[(MongoDB)]
        Cache[In-Memory Cache]
    end
    
    UI --> RQ
    RQ --> FerryAPI
    RQ --> PaymentAPI
    RQ --> ActivityAPI
    
    FerryAPI --> FerryAgg
    FerryAPI --> Cache
    FerryAgg --> SealinkAPI
    FerryAgg --> GreenOceanAPI
    FerryAgg --> MakruzzAPI
    
    PaymentAPI --> RazorpayService
    PaymentAPI --> FerryBook
    RazorpayService --> RazorpayGateway
    
    FerryBook --> SealinkAPI
    FerryBook --> EmailService
    FerryBook --> WhatsAppService
    EmailService --> ResendAPI
    WhatsAppService --> TwilioAPI
    
    ActivityAPI --> PayloadAPI
    PayloadAPI --> MongoDB
    PaymentAPI --> MongoDB
```

---

## 🚢 Ferry Booking System Flow

```mermaid
sequenceDiagram
    participant User
    participant FerryUI as Ferry UI
    participant FerryStore as Ferry Store
    participant API as Ferry API
    participant Agg as Aggregation
    participant Operators as Operators
    participant Cache as Cache
    participant Checkout
    participant Payment
    participant Booking
    
    User->>FerryUI: Enter search params
    FerryUI->>FerryStore: setSearchParams()
    FerryUI->>API: POST /api/ferry?action=search
    API->>Agg: searchAllOperators()
    
    par Parallel API Calls
        Agg->>Operators: Sealink API
        Agg->>Operators: Green Ocean API
        Agg->>Operators: Makruzz API
    end
    
    Operators-->>Agg: Ferry results
    Agg->>Cache: Store trip data
    Agg-->>API: Unified results
    API-->>FerryUI: Display ferry options
    
    User->>FerryUI: Select ferry & class
    FerryUI->>FerryStore: selectFerry()
    FerryUI->>API: GET /api/ferry?action=seat-layout
    API->>Cache: Retrieve trip data
    Cache-->>API: Cached data
    API-->>FerryUI: Seat layout
    
    User->>FerryUI: Select seats
    FerryUI->>FerryStore: selectSeats()
    FerryUI->>Checkout: Navigate to checkout
    
    User->>Checkout: Enter passenger details
    User->>Checkout: Initiate payment
    
    Checkout->>Payment: Create Razorpay order
    Payment-->>Checkout: Order created
    Checkout->>User: Display Razorpay modal
    
    User->>Payment: Complete payment
    Payment->>Payment: Verify signature
    Payment->>Booking: Book with operator
    Booking->>Operators: Confirm booking
    Operators-->>Booking: Booking confirmed
    Booking->>Payment: Store booking record
    Payment-->>Checkout: Success response
    Checkout-->>User: Show confirmation
```

---

## 💳 Payment & Checkout Flow

```mermaid
graph LR
    CartData[Cart Data]
    URLParams[URL Params]
    Adapter[CheckoutAdapter]
    Step1[Step 1: Details]
    Step2[Step 2: Review]
    Step3[Step 3: Confirmation]
    CreateOrder[Create Order]
    RazorpayModal[Razorpay Modal]
    VerifyPayment[Verify Payment]
    SignatureCheck[Signature Check]
    PaymentRecord[Payment Record]
    BookingRecord[Booking Record]
    ProviderBooking[Provider Booking]
    Notifications[Notifications]
    
    CartData --> Adapter
    URLParams --> TypeDetection
    TypeDetection --> Adapter
    Adapter --> DataUnification
    DataUnification --> PassengerReqs
    DataUnification --> PaymentPrep
    
    PassengerReqs --> Step1
    Step1 --> Step2
    Step2 --> CreateOrder
    CreateOrder --> RazorpayModal
    RazorpayModal --> VerifyPayment
    VerifyPayment --> SignatureCheck
    
    SignatureCheck -->|Valid| PaymentRecord
    SignatureCheck -->|Invalid| Step3
    
    PaymentRecord --> BookingRecord
    BookingRecord --> ProviderBooking
    ProviderBooking --> Notifications
    Notifications --> Step3
    
    style SignatureCheck fill:#fff3cd
    style ProviderBooking fill:#f8d7da
```

---

## 📊 Data Access Patterns

```mermaid
graph LR
    subgraph Client["Client-Side"]
        ClientComp[React Component]
        APIService[API Service]
        HTTPRequest[HTTP Request]
        APIRoute[API Route]
    end
    
    subgraph Server["Server-Side"]
        ServerComp[Server Component]
        PayloadService[Payload Service]
        DirectQuery[Direct Query]
    end
    
    subgraph Shared["Shared Layer"]
        PayloadCMS[Payload CMS]
        Database[(MongoDB)]
    end
    
    ClientComp --> APIService
    APIService --> HTTPRequest
    HTTPRequest --> APIRoute
    APIRoute --> PayloadCMS
    
    ServerComp --> PayloadService
    PayloadService --> DirectQuery
    DirectQuery --> PayloadCMS
    
    PayloadCMS --> Database
    
    classDef clientStyle fill:#e1f5ff
    classDef serverStyle fill:#d4edda
    classDef sharedStyle fill:#fff3cd
    
    class ClientComp,APIService clientStyle
    class ServerComp,PayloadService serverStyle
    class PayloadCMS sharedStyle
```

---

## 🗂 Service Layer Organization

```mermaid
graph TB
    subgraph API["api/ - Client HTTP"]
        APIActivities[activities.ts]
        APICategories[categories.ts]
        APIBoats[boatRoutes.ts]
    end
    
    subgraph Payload["payload/ - Server DB"]
        Client[client.ts]
        CollActivities[activities.ts]
        CollLocations[locations.ts]
        PageData[page-data.ts]
    end
    
    subgraph Ferry["ferryServices/"]
        FerryAgg[aggregation.ts]
        FerryBook[booking.ts]
        Sealink[sealink.ts]
        GreenOcean[greenOcean.ts]
    end
    
    subgraph Notif["notifications/"]
        NotificationMgr[manager.ts]
        EmailNotif[email.ts]
        WhatsAppNotif[whatsapp.ts]
    end
    
    APIActivities -.HTTP.-> APIRoute["/api/activities"]
    APIRoute --> CollActivities
    CollActivities --> Client
    Client --> MongoDB[(MongoDB)]
    FerryAgg --> Sealink
    FerryAgg --> GreenOcean
    NotificationMgr --> EmailNotif
    NotificationMgr --> WhatsAppNotif
```

---

## 🔄 State Management Architecture

```mermaid
graph TB
    subgraph Zustand["Client State - Zustand"]
        FerryStore[FerryStore]
        ActivityStore[ActivityStore]
        BoatStore[BoatStore]
        CheckoutStore[CheckoutStore]
    end
    
    subgraph ReactQuery["Server State - React Query"]
        FerryQueries[Ferry Queries]
        ActivityQueries[Activity Queries]
        BookingQueries[Booking Queries]
    end
    
    subgraph InMemory["In-Memory Cache"]
        TripCache[Trip Data]
        SeatCache[Seat Layout]
    end
    
    subgraph UI["UI Components"]
        FerryUI[Ferry UI]
        ActivityUI[Activity UI]
        CheckoutUI[Checkout UI]
    end
    
    FerryUI --> FerryStore
    FerryUI --> FerryQueries
    FerryQueries --> TripCache
    
    ActivityUI --> ActivityStore
    ActivityUI --> ActivityQueries
    
    CheckoutUI --> CheckoutStore
    CheckoutUI --> BookingQueries
    
    FerryStore -.-> CheckoutUI
    ActivityStore -.-> CheckoutUI
    BoatStore -.-> CheckoutUI
```

---

## 🔐 Security & Payment Architecture

```mermaid
graph TB
    subgraph Frontend
        CheckoutForm[Checkout Form]
        RazorpaySDK[Razorpay SDK]
    end
    
    subgraph API["API Layer"]
        CreateOrder[Create Order]
        VerifyPayment[Verify Payment]
        Webhook[Webhook]
    end
    
    subgraph Security["Security Layer"]
        EnvVars[Env Variables]
        SignatureVerify[Signature Verify]
    end
    
    subgraph Gateway["Razorpay"]
        RazorpayAPI[API]
        PaymentModal[Modal]
    end
    
    subgraph DB["Database"]
        PaymentRecords[(Payments)]
        BookingRecords[(Bookings)]
    end
    
    CheckoutForm --> CreateOrder
    CreateOrder --> EnvVars
    EnvVars --> RazorpayAPI
    RazorpayAPI --> CreateOrder
    CreateOrder --> RazorpaySDK
    RazorpaySDK --> PaymentModal
    
    PaymentModal --> VerifyPayment
    VerifyPayment --> SignatureVerify
    SignatureVerify --> EnvVars
    
    SignatureVerify -->|Valid| PaymentRecords
    SignatureVerify -->|Valid| BookingRecords
    SignatureVerify -->|Invalid| CheckoutForm
    
    RazorpayAPI -.Webhook.-> Webhook
    Webhook --> PaymentRecords
```

---

## 📱 Component Hierarchy

```mermaid
graph TB
    subgraph "App Structure"
        Root[Root Layout]
        
        subgraph "(frontend)/ - Public Pages"
            Home[Homepage]
            Ferry[Ferry Pages]
            Activities[Activity Pages]
            Packages[Package Pages]
            Checkout[Checkout Page]
            Blogs[Blog Pages]
        end
        
        subgraph "(payload)/ - CMS"
            Admin[Admin Panel]
            Collections[Collections Config]
        end
    end
    
    subgraph "Ferry Feature"
        FerrySearch[Ferry Search Page]
        FerryResults[Ferry Results List]
        FerryBooking[Ferry Booking Page]
        SeatSelection[Seat Selection]
    end
    
    subgraph "Checkout Feature"
        CheckoutFlow[Checkout Flow Container]
        MemberDetails[Member Details Step]
        ReviewStep[Review & Payment Step]
        ConfirmationStep[Confirmation Step]
    end
    
    subgraph "Shared Components"
        subgraph "Atoms"
            Button[Button]
            Input[Input]
            Select[Select]
            DatePicker[Date Picker]
        end
        
        subgraph "Molecules"
            SearchForm[Search Form]
            PassengerForm[Passenger Form]
            PriceCard[Price Card]
        end
        
        subgraph "Organisms"
            Header[Header]
            Footer[Footer]
            BookingCard[Booking Card]
        end
    end
    
    Root --> Home
    Root --> Ferry
    Root --> Checkout
    
    Ferry --> FerrySearch
    FerrySearch --> FerryResults
    FerryResults --> FerryBooking
    FerryBooking --> SeatSelection
    
    Checkout --> CheckoutFlow
    CheckoutFlow --> MemberDetails
    CheckoutFlow --> ReviewStep
    CheckoutFlow --> ConfirmationStep
    
    FerrySearch --> SearchForm
    MemberDetails --> PassengerForm
    FerryResults --> BookingCard
    
    SearchForm --> Input
    SearchForm --> DatePicker
    PassengerForm --> Input
    BookingCard --> PriceCard
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph Dev["Development"]
        DevLocal[Local Dev]
        DevMongoDB[(Local MongoDB)]
    end
    
    subgraph Vercel["Vercel Platform"]
        CDN[CDN]
        FerryFunc[Ferry API]
        PaymentFunc[Payment API]
        SSRFunc[SSR Pages]
    end
    
    subgraph Ext["External Services"]
        MongoAtlas[(MongoDB Atlas)]
        Razorpay[Razorpay]
        FerryAPIs[Ferry APIs]
        Resend[Resend]
        Twilio[Twilio]
    end
    
    DevLocal --> DevMongoDB
    DevLocal --> DevEnv
    
    CDN --> Users[End Users]
    
    Users --> SSRFunc
    Users --> FerryFunc
    Users --> PaymentFunc
    
    FerryFunc --> MongoAtlas
    PaymentFunc --> MongoAtlas
    SSRFunc --> MongoAtlas
    
    PaymentFunc --> Razorpay
    FerryFunc --> FerryAPIs
    PaymentFunc --> Resend
    PaymentFunc --> Twilio
```

---

## 📝 Legend

### Diagram Types

- **Graph TB/LR** - Component relationships and data flow
- **Sequence** - Time-based interactions
- **Flowchart** - Process flows with decision points

---

*Use these diagrams as reference when discussing system architecture, debugging issues, or planning new features.*
