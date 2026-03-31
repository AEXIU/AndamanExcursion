# NgRok Setup for PhonePe Testing

## Why NgRok is Required

PhonePe's payment gateway needs to redirect users back to your application after payment. When developing locally:
- Your app runs on `http://localhost:3000` or `http://127.0.0.1:3000`
- PhonePe cannot redirect to localhost URLs (not accessible from internet)
- NgRok creates a public HTTPS tunnel to your local server

## Setup Steps

### 1. Start NgRok Tunnel

```bash
ngrok http 3000
```

This will output something like:
```
Forwarding: https://mechanomorphic-nonvocational-rolanda.ngrok-free.dev -> http://localhost:3000
```

### 2. Update Environment Variables

Update `.env.local` with your ngrok URL:

```env
# For local development with ngrok
NEXT_PUBLIC_BASE_URL=https://mechanomorphic-nonvocational-rolanda.ngrok-free.dev
PHONEPE_MERCHANT_REDIRECT_URL=https://mechanomorphic-nonvocational-rolanda.ngrok-free.dev/api/payments/phonepe/redirect-handler
PHONEPE_MERCHANT_CALLBACK_URL=https://mechanomorphic-nonvocational-rolanda.ngrok-free.dev/api/payments/phonepe/callback
```

### 3. Restart Next.js Dev Server

**IMPORTANT:** You must restart the dev server after changing environment variables:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
pnpm dev
```

### 4. Update PhonePe Webhook URL

In PhonePe dashboard, update webhook URL to:
```
https://mechanomorphic-nonvocational-rolanda.ngrok-free.dev/api/payments/phonepe/webhook
```

### 5. Access Your App via NgRok URL

**CRITICAL:** You must access your app through the ngrok URL, not localhost:

✅ **Correct:** `https://mechanomorphic-nonvocational-rolanda.ngrok-free.dev/activities`
❌ **Wrong:** `http://localhost:3000/activities`

## Payment Flow with NgRok

1. User accesses: `https://your-ngrok-url.ngrok-free.dev/activities`
2. User proceeds to checkout and clicks "Pay"
3. App creates payment with redirect URL: `https://your-ngrok-url.ngrok-free.dev/checkout/payment-return?merchantOrderId=XXX`
4. User is redirected to PhonePe payment page
5. After payment, PhonePe redirects to: `https://your-ngrok-url.ngrok-free.dev/checkout/payment-return?merchantOrderId=XXX`
6. Payment verification succeeds ✅
7. User sees confirmation page

## Common Issues

### Issue 1: Stuck at payment-return page
**Cause:** Environment variables not updated or dev server not restarted
**Solution:** 
1. Update `NEXT_PUBLIC_BASE_URL` in `.env.local`
2. Restart dev server
3. Clear browser cache

### Issue 2: NgRok URL changes on restart
**Cause:** Free ngrok URLs change each time you restart ngrok
**Solution:**
1. Get new ngrok URL
2. Update `.env.local`
3. Restart dev server
4. Update PhonePe webhook URL in dashboard

### Issue 3: "Invalid redirect URL" error
**Cause:** Accessing app via localhost instead of ngrok URL
**Solution:** Always use the ngrok URL in your browser

## NgRok Free Tier Limitations

- URL changes on each restart
- Session timeout after 2 hours
- Limited to 40 connections/minute

**For Production:** Use your actual domain, not ngrok.

## Quick Checklist

Before testing PhonePe payment:
- [ ] NgRok tunnel is running
- [ ] `.env.local` has correct ngrok URL
- [ ] Dev server restarted after env changes
- [ ] Accessing app via ngrok URL (not localhost)
- [ ] PhonePe webhook URL updated in dashboard

## Switching Back to Localhost

When not testing PhonePe, you can switch back:

```env
NEXT_PUBLIC_BASE_URL=http://127.0.0.1:3000
```

Then restart dev server.

## Production Setup

In production, use your actual domain:

```env
NEXT_PUBLIC_BASE_URL=https://andamanexcursion.com
PHONEPE_MERCHANT_REDIRECT_URL=https://andamanexcursion.com/api/payments/phonepe/redirect-handler
PHONEPE_MERCHANT_CALLBACK_URL=https://andamanexcursion.com/api/payments/phonepe/callback
```

No ngrok needed in production!
