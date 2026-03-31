# 📖 Andaman Excursion - Glossary & FAQ

> **Purpose**: Quick answers to common questions and definitions of key terms used throughout the codebase.

---

## 📚 Glossary

### Platform Terms

**Andaman Excursion**
- The unified booking platform for travel services in the Andaman & Nicobar Islands

**Unified Booking**
- A single checkout flow that handles multiple booking types (ferry, activity, boat) together

**Booking Session**
- Temporary data structure holding booking details with expiration time

**PNR (Passenger Name Record)**
- Unique booking reference number for ferry bookings

---

### Ferry-Specific Terms

**Ferry Operator**
- External service providers (Sealink, Green Ocean, Makruzz) that operate ferry services

**Aggregation**
- Process of searching multiple ferry operators simultaneously and combining results

**Trip Data**
- Complete ferry information including schedule, pricing, and availability (cached for booking flow)

**Seat Class/Tier**
- Category of seating (Premium, Business, Economy) with different pricing

**Seat Layout**
- Visual representation of available seats on a ferry deck

**Unified Ferry Result**
- Standardized data structure combining results from different operators

---

### Technical Terms

**Payload CMS**
- Headless Content Management System used for data storage and admin panel

**Local API (Payload)**
- Direct database access via Payload CMS SDK (server-side only)

**REST API (Payload)**
- HTTP-based API access to Payload CMS (client-side)

**Zustand Store**
- Client-side state management library for UI state

**React Query**
- Server state management library with caching and synchronization

**CheckoutAdapter**
- Pattern that normalizes different booking types into unified format

**Server Component**
- React component that runs on the server (Next.js App Router)

**Client Component**
- React component that runs in the browser (marked with 'use client')

---

### Payment Terms

**Razorpay**
- Payment gateway provider integrated in the platform

**Order ID**
- Unique identifier for payment order created before payment

**Payment Signature**
- HMAC SHA256 hash used to verify payment authenticity

**Webhook**
- Automated callback from Razorpay for payment status updates

**Gateway Response**
- Complete payment data returned from Razorpay after transaction

---

### State Management Terms

**Store**
- Zustand state container for UI state

**Query**
- React Query fetch operation with caching

**Mutation**
- React Query operation that modifies server state

**Cache Invalidation**
- Process of marking cached data as stale to trigger refetch

**Stale Time**
- Duration after which cached data is considered outdated

---

## ❓ Frequently Asked Questions

### General Questions

#### Q: What is the main purpose of this application?
**A:** Andaman Excursion is a unified booking platform for travel services in the Andaman Islands, primarily focused on ferry bookings with support for activities and boat charters.

#### Q: How many ferry operators are integrated?
**A:** Three operators: Sealink/Nautika, Green Ocean, and Makruzz.

#### Q: What payment gateway is used?
**A:** Razorpay is the primary payment gateway for all transactions.

#### Q: What database is used?
**A:** MongoDB, accessed through Payload CMS.

---

### Setup & Configuration

#### Q: How do I set up the development environment?
**A:** 
1. Install Node.js (v18+) and pnpm
2. Clone the repository
3. Run `pnpm install`
4. Create `.env` file with required variables
5. Start MongoDB
6. Run `pnpm dev`

See [DEVELOPER_ONBOARDING_GUIDE.md](DEVELOPER_ONBOARDING_GUIDE.md#-getting-started) for details.

#### Q: Where do I get the API keys for ferry operators?
**A:** Contact the project lead or check the team's secure credential storage (e.g., 1Password, AWS Secrets Manager).

#### Q: Can I use MongoDB Atlas instead of local MongoDB?
**A:** Yes! Update `DATABASE_URI` in `.env` to your MongoDB Atlas connection string.

#### Q: How do I access the Payload CMS admin panel?
**A:** Navigate to `http://localhost:3000/admin` after starting the dev server.

---

### Architecture Questions

#### Q: What's the difference between `services/api/` and `services/payload/`?
**A:** 
- `services/api/`: Client-side HTTP calls (used in React components)
- `services/payload/`: Server-side direct database access (used in API routes, server components)

See [SERVICES_ARCHITECTURE_DOCUMENTATION.md](file:///c:/Users/Lenovo/Downloads/andamanexcursion-master/andamanexcursion-master/SERVICES_ARCHITECTURE_DOCUMENTATION.md)

#### Q: Why are there multiple state management solutions (Zustand + React Query)?
**A:** 
- **Zustand**: UI state (form inputs, selections, temporary data)
- **React Query**: Server state (API responses, caching, synchronization)

Each serves a different purpose.

#### Q: What is the CheckoutAdapter and why is it important?
**A:** CheckoutAdapter normalizes different booking types (ferry, activity, boat) into a unified format, enabling a single checkout flow for all booking types. It's the key abstraction for the checkout system.

#### Q: How does ferry search aggregation work?
**A:** The `FerryAggregationService` queries all operators in parallel, caches trip data, and returns unified results in a standardized format.

---

### Ferry Booking Questions

#### Q: How is ferry trip data cached?
**A:** Ferry trip data is stored in an in-memory Map cache after search. This cache is critical for the booking flow as it contains details needed for seat selection and booking confirmation.

#### Q: What happens if a ferry operator API is down?
**A:** The aggregation service continues with available operators and returns partial results with error information for unavailable operators.

#### Q: How long does a booking session last?
**A:** Booking sessions typically expire after 15 minutes of inactivity.

#### Q: Can users book without selecting seats?
**A:** For Sealink, seat selection is implemented. For other operators, seats may be auto-assigned.

---

### Payment Questions

#### Q: How is payment security ensured?
**A:** 
1. HMAC SHA256 signature verification
2. Server-side secret key storage
3. HTTPS-only communication
4. Razorpay handles card data (PCI compliant)

#### Q: What happens if payment succeeds but booking fails?
**A:** The payment is recorded as successful, and the booking is marked as pending/failed with detailed error information. Manual intervention is required to process the booking.

#### Q: How do I test payments without actual money?
**A:** Use Razorpay test mode keys and test card numbers:
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002

See [RAZORPAY_INTEGRATION_DOCUMENTATION.md](file:///c:/Users/Lenovo/Downloads/andamanexcursion-master/andamanexcursion-master/docs/RAZORPAY_INTEGRATION_DOCUMENTATION.md)

#### Q: What is the 45-second timeout for ferry bookings?
**A:** Vercel serverless functions have a timeout limit. Ferry provider API calls that take longer than 45 seconds will timeout, though the payment and local booking record are still created.

---

### Development Questions

#### Q: How do I add a new API endpoint?
**A:** 
1. Create `src/app/api/your-endpoint/route.ts`
2. Export `GET`, `POST`, or other HTTP methods
3. Handle request, validate data, return response

See [QUICK_REFERENCE_GUIDE.md](QUICK_REFERENCE_GUIDE.md#creating-a-new-api-endpoint)

#### Q: How do I create a new Payload CMS collection?
**A:** 
1. Create collection config in `src/app/(payload)/collections/`
2. Register in `payload.config.ts`
3. Create service in `src/services/payload/collections/`

#### Q: When should I use 'use client' directive?
**A:** Use `'use client'` when you need:
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window)
- Event handlers
- Client-side libraries (Zustand, React Query hooks)

#### Q: How do I debug React Query cache issues?
**A:** 
1. Add React Query DevTools to your layout
2. Open DevTools panel in browser
3. Inspect query state, cache data, and refetch behavior

See [QUICK_REFERENCE_GUIDE.md](QUICK_REFERENCE_GUIDE.md#react-query-devtools)

---

### Deployment Questions

#### Q: Can I deploy this on platforms other than Vercel?
**A:** Yes, but Vercel is optimized for Next.js. Other platforms (AWS, Azure, Netlify) require additional configuration.

#### Q: How do I handle environment variables in production?
**A:** Set environment variables in your deployment platform's dashboard (Vercel Environment Variables, AWS Parameter Store, etc.).

#### Q: What's the serverless function limit on Vercel?
**A:** Vercel Hobby plan has a 12-function limit. The codebase is optimized to stay under this limit by consolidating API routes.

#### Q: How do I trigger a production deployment?
**A:** Push to the main branch or use `vercel --prod` with Vercel CLI.

---

### Troubleshooting Questions

#### Q: Why am I getting "Payload not initialized" error?
**A:** 
- MongoDB is not running
- Invalid `DATABASE_URI` in `.env`
- Payload config has errors

Start MongoDB and verify connection string.

#### Q: Ferry search returns no results, what's wrong?
**A:** Check:
1. Ferry operator API credentials in `.env`
2. Network connectivity
3. Operator API status (may be down)
4. Console logs for specific errors

#### Q: Why does my client component not have access to environment variables?
**A:** Only variables prefixed with `NEXT_PUBLIC_` are accessible in client-side code. Server-only variables remain secure.

#### Q: Build fails with TypeScript errors, how do I fix?
**A:** 
1. Run `pnpm type-check` locally
2. Fix type errors shown in console
3. Ensure all imports are correct
4. Check `tsconfig.json` configuration

#### Q: How do I clear all cached data during development?
**A:** 
- **React Query**: Use DevTools to clear cache
- **Zustand**: Call `store.reset()` methods
- **Browser**: Clear localStorage and cookies
- **In-Memory Cache**: Restart dev server

---

## 🔍 Quick Term Lookup

| Term | Location | Definition |
|------|----------|------------|
| `FerryStore` | [src/store/FerryStore.ts](file:///c:/Users/Lenovo/Downloads/andamanexcursion-master/andamanexcursion-master/src/store/FerryStore.ts) | Zustand store for ferry search and selection |
| `CheckoutAdapter` | [src/utils/CheckoutAdapter.ts](file:///c:/Users/Lenovo/Downloads/andamanexcursion-master/andamanexcursion-master/src/utils/CheckoutAdapter.ts) | Unified booking data transformer |
| `getCachedPayload` | [src/services/payload/base/client.ts](file:///c:/Users/Lenovo/Downloads/andamanexcursion-master/andamanexcursion-master/src/services/payload/base/client.ts) | Get cached Payload CMS instance |
| `UnifiedFerryResult` | Type definition | Standardized ferry data structure |
| `PaymentData` | Type definition | Payment and booking information |

---

## 📞 Getting More Help

### Documentation References

- **Onboarding**: [DEVELOPER_ONBOARDING_GUIDE.md](DEVELOPER_ONBOARDING_GUIDE.md)
- **Quick Reference**: [QUICK_REFERENCE_GUIDE.md](QUICK_REFERENCE_GUIDE.md)
- **Architecture**: [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)
- **Ferry System**: [docs/FERRY_BOOKING_SYSTEM_ARCHITECTURE.md](file:///c:/Users/Lenovo/Downloads/andamanexcursion-master/andamanexcursion-master/docs/FERRY_BOOKING_SYSTEM_ARCHITECTURE.md)
- **Checkout**: [docs/CHECKOUT_PROCESS_SYSTEM.md](file:///c:/Users/Lenovo/Downloads/andamanexcursion-master/andamanexcursion-master/docs/CHECKOUT_PROCESS_SYSTEM.md)
- **Services**: [SERVICES_ARCHITECTURE_DOCUMENTATION.md](file:///c:/Users/Lenovo/Downloads/andamanexcursion-master/andamanexcursion-master/SERVICES_ARCHITECTURE_DOCUMENTATION.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Razorpay Documentation](https://razorpay.com/docs/)

---

## 💡 Common Acronyms

| Acronym | Full Form | Context |
|---------|-----------|---------|
| CMS | Content Management System | Payload CMS |
| API | Application Programming Interface | REST APIs, Payload Local API |
| PNR | Passenger Name Record | Booking reference |
| SSR | Server-Side Rendering | Next.js rendering |
| SSG | Static Site Generation | Next.js pre-rendering |
| HTTP | Hypertext Transfer Protocol | API communication |
| CRUD | Create, Read, Update, Delete | Database operations |
| SDK | Software Development Kit | Razorpay SDK, Payload SDK |
| ENV | Environment | Environment variables |
| DB | Database | MongoDB |

---

*Can't find your question? Ask the team or refer to the comprehensive documentation files listed above.* 📚
