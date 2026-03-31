# 🚀 Quick Reference Guide - Andaman Excursion

> **Purpose**: Fast reference for common commands, code patterns, and workflows. Keep this handy for daily development.

---

## 📋 Table of Contents

1. [Common Commands](#-common-commands)
2. [Development Workflows](#-development-workflows)
3. [Code Snippets](#-code-snippets)
4. [API Endpoints](#-api-endpoints)
5. [Environment Variables](#-environment-variables)
6. [Debugging Tips](#-debugging-tips)
7. [Common Pitfalls](#-common-pitfalls)

---

## Common Commands

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Type check
pnpm type-check  # or: npx tsc --noEmit
```

### Database

```bash
# Start MongoDB locally
mongod --dbpath /path/to/data/db

# Connect to MongoDB shell
mongosh mongodb://localhost:27017/andaman

# View all collections
show collections

# Query bookings
db.bookings.find({}).limit(10)

# Clear a collection (USE WITH CAUTION)
db['collection-name'].deleteMany({})
```

### Git Workflow (need to work this way as we'll be multiple developers now)

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Stage and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Update from main
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
```

### Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🔄 Development Workflows

### Creating a New API Endpoint

```typescript
// File: src/app/api/your-endpoint/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    const data = await fetchData();
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = yourSchema.parse(body);
    
    // Process request
    const result = await processData(validatedData);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Creating a React Query Hook

```typescript
// File: src/hooks/queries/useYourData.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
export function useYourData() {
  return useQuery({
    queryKey: ['your-data'],
    queryFn: async () => {
      const response = await fetch('/api/your-endpoint');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });
}

// Mutate data
export function useCreateYourData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: YourDataType) => {
      const response = await fetch('/api/your-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['your-data'] });
    }
  });
}
```

### Creating a Zustand Store

```typescript
// File: src/store/YourStore.ts

import { create } from 'zustand';

interface YourState {
  // State
  data: YourDataType | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setData: (data: YourDataType) => void;
  clearData: () => void;
  reset: () => void;
}

export const useYourStore = create<YourState>((set) => ({
  // Initial state
  data: null,
  isLoading: false,
  error: null,
  
  // Actions
  setData: (data) => set({ data, error: null }),
  clearData: () => set({ data: null }),
  reset: () => set({ data: null, isLoading: false, error: null })
}));
```

### Creating a Payload Service

```typescript
// File: src/services/payload/collections/your-collection.ts

import { getCachedPayload } from '../base/client';
import type { YourCollection } from '@/payload-types';

export const yourCollectionService = {
  async getAll(): Promise<YourCollection[]> {
    const payload = await getCachedPayload();
    
    const result = await payload.find({
      collection: 'your-collection',
      limit: 1000,
      where: {
        // Add filters
        status: { equals: 'active' }
      }
    });
    
    return result.docs;
  },
  
  async getById(id: string): Promise<YourCollection | null> {
    const payload = await getCachedPayload();
    
    try {
      const result = await payload.findByID({
        collection: 'your-collection',
        id
      });
      return result;
    } catch {
      return null;
    }
  },
  
  async create(data: Partial<YourCollection>): Promise<YourCollection> {
    const payload = await getCachedPayload();
    
    return await payload.create({
      collection: 'your-collection',
      data
    });
  }
};
```

---

## 📝 Code Snippets

### Form Validation with Zod

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define schema
const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.coerce.number().int().min(1).max(120),
  phone: z.string().regex(/^\+?[0-9\s\-\(\)]{8,20}$/, 'Invalid phone number')
});

type FormData = z.infer<typeof formSchema>;

// Use in component
function YourForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });
  
  const onSubmit = (data: FormData) => {
    console.log('Valid data:', data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('fullName')} />
      {errors.fullName && <span>{errors.fullName.message}</span>}
      {/* More fields */}
    </form>
  );
}
```

### Error Boundary

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### Currency Formatting

```typescript
// File: src/utils/formatCurrency.ts

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

// Usage
formatCurrency(1500); // ₹1,500
formatCurrency(1500.50); // ₹1,500.50
```

### Date Formatting

```typescript
import { format, parseISO } from 'date-fns';

// Format date
export function formatDate(date: string | Date, formatString: string = 'dd MMM yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

// Usage
formatDate('2024-12-25'); // 25 Dec 2024
formatDate(new Date(), 'dd/MM/yyyy'); // 27/11/2025
```

---

## 🌐 API Endpoints

### Ferry APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ferry?action=search` | POST | Search ferries across operators |
| `/api/ferry?action=seat-layout` | GET | Get seat layout for ferry |
| `/api/ferry?action=create-session` | POST | Create booking session |
| `/api/ferry?action=health` | GET | Check operator health |

**Example Request**:
```typescript
// Ferry Search
const response = await fetch('/api/ferry?action=search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'port-blair',
    to: 'havelock',
    date: '2024-12-20',
    adults: 2,
    children: 1
  })
});

const { results, errors } = await response.json();
```

### Payment APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/create-order` | POST | Create Razorpay order |
| `/api/payments/verify` | POST | Verify payment & create booking |
| `/api/payments/webhook` | POST | Handle Razorpay webhooks |

**Example Request**:
```typescript
// Create payment order
const response = await fetch('/api/payments/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 5000, // in rupees
    currency: 'INR',
    bookingData: {
      bookingType: 'ferry',
      items: [/* booking items */],
      members: [/* passenger details */]
    }
  })
});

const { order } = await response.json();
```

### Activity APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/activities?action=search` | GET | Search activities |
| `/api/activities?action=fetch` | GET | Fetch single activity |

---

## 🔐 Environment Variables

### Required Variables

```env
# Database
DATABASE_URI=mongodb://localhost:27017/andaman
PAYLOAD_SECRET=your-secret-min-32-characters

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx

# Ferry Operators
SEALINK_API_URL=https://api.sealink.in/
SEALINK_TOKEN=xxx
MAKRUZZ_API_URL=https://api.makruzz.com/
GREEN_OCEAN_API_URL=https://api.greenocean.in/

# Email
RESEND_API_KEY=re_xxx

# WhatsApp
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx

# reCAPTCHA
RECAPTCHA_SITE_KEY=xxx
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=xxx
```

### Accessing in Code

```typescript
// Server-side (API routes, server components)
const apiKey = process.env.RAZORPAY_KEY_SECRET;

// Client-side (components, hooks)
const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
```

---

## 🐛 Debugging Tips

### React Query DevTools

```typescript
// Add to app layout
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### Zustand Store Inspection

```typescript
// In browser console
useYourStore.getState(); // View current state
useYourStore.subscribe(console.log); // Log state changes
```

### Network Debugging

```typescript
// Add request logging
fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
})
.then(res => {
  console.log('Response status:', res.status);
  return res.json();
})
.then(data => console.log('Response data:', data))
.catch(error => console.error('Request failed:', error));
```

### Payload CMS Debugging

```typescript
// In API route or server component
const payload = await getCachedPayload();

// Log query
const result = await payload.find({
  collection: 'activities',
  where: { /* your query */ }
});

console.log('Query result:', {
  totalDocs: result.totalDocs,
  docs: result.docs.length,
  sample: result.docs[0]
});
```

---

## ⚠️ Common Pitfalls

### 1. Client vs Server Components

```typescript
// ❌ WRONG: Using hooks in server component
export default async function Page() {
  const data = useQuery(); // Error!
  return <div>{data}</div>;
}

// ✅ CORRECT: Use 'use client' directive
'use client';
export default function Page() {
  const data = useQuery();
  return <div>{data}</div>;
}
```

### 2. Environment Variables

```typescript
// ❌ WRONG: Server variable in client code
'use client';
const secret = process.env.RAZORPAY_KEY_SECRET; // undefined!

// ✅ CORRECT: Use public variables in client
'use client';
const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
```

### 3. Payload CMS Query Caching

```typescript
// ❌ WRONG: Not using React cache
const payload = await getPayload({ config });

// ✅ CORRECT: Use cached instance
import { getCachedPayload } from '@/services/payload/base/client';
const payload = await getCachedPayload();
```

### 4. React Query Cache Invalidation

```typescript
// ❌ WRONG: Manual refetch without invalidation
const { data, refetch } = useQuery(['data']);
await createData();
refetch(); // May use stale cache

// ✅ CORRECT: Invalidate cache
const queryClient = useQueryClient();
await createData();
queryClient.invalidateQueries({ queryKey: ['data'] });
```

### 5. Zustand State Updates

```typescript
// ❌ WRONG: Direct mutation
const store = useYourStore();
store.data.name = 'New Name'; // Won't trigger re-render

// ✅ CORRECT: Use setter
const { data, setData } = useYourStore();
setData({ ...data, name: 'New Name' });
```

---

## 🔍 Quick Lookup Tables

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Authentication required |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal error |

### Ferry Operators

| Code | Name | Features |
|------|------|----------|
| `sealink` | Sealink/Nautika | Seat selection required |
| `greenocean` | Green Ocean | Hash authentication |
| `makruzz` | Makruzz | Session-based booking |

### Booking Types

| Type | Description |
|------|-------------|
| `activity` | Activity bookings |
| `ferry` | Ferry bookings |
| `boat` | Boat charters |
| `mixed` | Multiple booking types |

---

## 📞 Quick Help

### When Things Break

1. **Check console** for error messages
2. **Review network tab** for failed requests
3. **Inspect React Query DevTools** for cache state
4. **Check environment variables** are set
5. **Verify MongoDB** is running
6. **Review recent changes** in git

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Payload not initialized" | Check MongoDB connection |
| "Invalid signature" | Verify Razorpay keys |
| "Ferry search failed" | Check operator API credentials |
| "CORS error" | Review API route configuration |
| "Build failed" | Check TypeScript errors |

---

**Pro Tip**: Bookmark this page for quick access during development! 🔖
