# 🚀 Andaman Excursion - Production Deployment Guide

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [PhonePe Configuration](#phonepe-configuration)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Debugging](#monitoring--debugging)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All lint errors resolved (`pnpm lint`)
- [ ] All TypeScript errors resolved (`pnpm build`)
- [ ] All tests passing (if applicable)
- [ ] No console.log statements in production code (or use conditional logging)

### Security
- [ ] All environment variables configured
- [ ] No hardcoded credentials in code
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled on payment endpoints
- [ ] Webhook signature verification implemented

### Testing
- [ ] Activity booking flow tested end-to-end
- [ ] Ferry booking flow tested end-to-end
- [ ] Payment success scenario tested
- [ ] Payment failure scenario tested
- [ ] Webhook endpoint tested

---

## 💳 PhonePe Configuration

### 1. Upgrade to Production Credentials

**Contact PhonePe:**
- Email: developers@phonepe.com
- Request: Upgrade test merchant to production
- Current Merchant ID: `TEST-M22MJAWSWDOOT_25070`

**What you'll receive:**
- Production Merchant ID
- Production Salt Key
- Production API URL
- Dashboard access credentials

### 2. Configure Webhook URL

**In PhonePe Dashboard:**

1. Login to https://business.phonepe.com/
2. Go to **Settings** → **API Configuration**
3. Set **Webhook URL**:
   ```
   https://yourdomain.com/api/payments/phonepe/webhook
   ```
4. Set **Return URL**:
   ```
   https://yourdomain.com/checkout/payment-return
   ```
5. Enable **Server-to-Server Callback**
6. Save changes

**Webhook Features:**
- ✅ Real-time payment updates
- ✅ Automatic booking processing
- ✅ No user interaction required
- ✅ Signature verification for security
- ✅ Retries on failure

### 3. Test Webhook

**Using Postman or cURL:**

```bash
curl -X POST https://yourdomain.com/api/payments/phonepe/webhook \
  -H "Content-Type: application/json" \
  -H "x-verify: YOUR_SIGNATURE" \
  -d '{
    "response": "BASE64_ENCODED_RESPONSE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## 🔐 Environment Variables

### Required Variables

Create `.env.production` file:

```bash
# Database
MONGODB_URI=mongodb+srv://your-prod-database

# PayloadCMS
PAYLOAD_SECRET=your-production-secret-key
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com

# PhonePe Production
PHONEPE_MERCHANT_ID=your-production-merchant-id
PHONEPE_SALT_KEY=your-production-salt-key
PHONEPE_SALT_INDEX=1
PHONEPE_API_URL=https://api.phonepe.com/apis/hermes
PHONEPE_DEV_MODE=false

# UploadThing (if using)
UPLOADTHING_TOKEN=your-uploadthing-token
UPLOADTHING_SECRET_KEY=your-secret-key
NEXT_PUBLIC_UPLOADTHING_APP_ID=your-app-id

# Email/SMS (if configured)
EMAIL_SERVICE_API_KEY=your-email-api-key
SMS_SERVICE_API_KEY=your-sms-api-key

# reCAPTCHA (if using)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret

# External APIs
FERRY_API_KEY=your-ferry-api-key
ACTIVITY_API_KEY=your-activity-api-key
```

### Critical Changes from Development

**PhonePe:**
- ✅ `PHONEPE_API_URL` → `https://api.phonepe.com/apis/hermes` (prod)
- ✅ `PHONEPE_DEV_MODE` → `false`
- ✅ Use production merchant credentials

**Security:**
- ✅ Generate new `PAYLOAD_SECRET` (min 32 characters)
- ✅ Use production database connection
- ✅ Set proper `PAYLOAD_PUBLIC_SERVER_URL`

---

## 🗄️ Database Setup

### Production MongoDB

**Recommended: MongoDB Atlas**

1. **Create Cluster:**
   - Go to https://cloud.mongodb.com/
   - Create new cluster (M10+ recommended)
   - Choose region closest to your users
   - Enable automatic backups

2. **Security:**
   - Add IP whitelist (0.0.0.0/0 for serverless, or specific IPs)
   - Create database user with strong password
   - Enable encryption at rest

3. **Connection String:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/andaman-excursion?retryWrites=true&w=majority
   ```

4. **Indexes:**
   ```javascript
   // Payments collection
   db.payments.createIndex({ "phonepeData.merchantOrderId": 1 })
   db.payments.createIndex({ "transactionId": 1 })
   db.payments.createIndex({ "status": 1, "createdAt": -1 })

   // Bookings collection
   db.bookings.createIndex({ "confirmationNumber": 1 }, { unique: true })
   db.bookings.createIndex({ "contactDetails.email": 1 })
   db.bookings.createIndex({ "status": 1, "createdAt": -1 })
   ```

---

## 🚀 Deployment Steps

### Option 1: Vercel (Recommended)

**Prerequisites:**
- Vercel account
- GitHub repository

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   pnpm add -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Link Project:**
   ```bash
   vercel link
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add MONGODB_URI production
   vercel env add PHONEPE_MERCHANT_ID production
   vercel env add PHONEPE_SALT_KEY production
   # ... add all other env vars
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

6. **Configure Domain:**
   - Go to Vercel dashboard
   - Settings → Domains
   - Add your custom domain

### Option 2: Railway

1. **Create Account:** https://railway.app/
2. **New Project:** Select your GitHub repo
3. **Add MongoDB Plugin**
4. **Set Environment Variables** in Settings
5. **Deploy:** Automatic on git push

### Option 3: VPS (DigitalOcean, AWS, etc.)

**For transactional platform** (recommended based on earlier analysis):

```bash
# On VPS
git clone your-repo
cd andamanexcursion

# Install dependencies
pnpm install

# Build
pnpm build

# Start with PM2
pm2 start npm --name "andaman-excursion" -- start
pm2 save
pm2 startup
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔍 Post-Deployment

### 1. Verify Deployment

**Test Pages:**
- [ ] Homepage loads: `https://yourdomain.com/`
- [ ] Activities search: `https://yourdomain.com/activities`
- [ ] Ferry search: `https://yourdomain.com/ferry`
- [ ] Admin panel: `https://yourdomain.com/admin`

**Test APIs:**
```bash
# Health check
curl https://yourdomain.com/api/ferry?action=health

# Webhook endpoint
curl https://yourdomain.com/api/payments/phonepe/webhook
```

### 2. Test Payment Flow

**End-to-End Test:**

1. Create activity booking
2. Fill passenger details
3. Proceed to payment
4. Complete payment on PhonePe
5. Verify:
   - [ ] Redirected back to site
   - [ ] Confirmation page shows
   - [ ] Email notification sent
   - [ ] Booking in database
   - [ ] Payment marked "success"

### 3. Configure Monitoring

**Recommended Tools:**

- **Error Tracking:** Sentry
  ```bash
  pnpm add @sentry/nextjs
  ```

- **Analytics:** Google Analytics, Plausible

- **Uptime Monitoring:** UptimeRobot, Pingdom

- **Performance:** Vercel Analytics, Lighthouse CI

### 4. Set Up Alerts

**Critical Alerts:**
- Payment failures spike
- Booking creation failures
- External API timeouts
- Database connection errors
- High error rates

---

## 📊 Monitoring & Debugging

### Key Metrics to Track

**Business Metrics:**
- Conversion rate (search → booking)
- Average booking value
- Most popular activities/ferries
- Booking completion time

**Technical Metrics:**
- API response times
- Payment success rate
- External API uptime
- Database query performance

### Logging

**Production Logging Strategy:**

```typescript
// utils/logger.ts
const isDev = process.env.PHONEPE_DEV_MODE === 'true';

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
  },
  payment: (message: string, data: any) => {
    // Always log payment events
    console.log(`[PAYMENT] ${message}`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};
```

### PhonePe Transaction Logs

**Check these logs:**
```bash
# Successful payment
✅ PhonePe v2 payment order created: { merchantOrderId: 'AE_...' }
✅ PhonePe v2 status response: { state: 'COMPLETED' }
✅ Payment successful, processing booking...
✅ Activity booking created

# Webhook received
📥 PhonePe webhook received
✅ Webhook signature verified
✅ Payment record updated via webhook
✅ Booking processing triggered
```

---

## 🔧 Troubleshooting

### Common Production Issues

#### 1. Payments Failing

**Symptoms:**
- "Payment failed" errors
- Users not redirected back
- Bookings not created

**Debugging:**
```bash
# Check PhonePe logs
grep "PhonePe v2" logs.txt

# Check payment records
db.payments.find({ status: "failed" }).sort({ createdAt: -1 })

# Verify credentials
curl https://api.phonepe.com/apis/hermes/v1/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"clientId":"YOUR_MERCHANT_ID","clientSecret":"YOUR_SALT_KEY"}'
```

**Solutions:**
- ✅ Verify production credentials
- ✅ Check webhook URL is accessible
- ✅ Verify signature calculation
- ✅ Check PhonePe dashboard for errors

#### 2. Webhooks Not Working

**Symptoms:**
- Bookings not processing automatically
- Payment status stuck as "pending"

**Debugging:**
```bash
# Test webhook endpoint
curl -X GET https://yourdomain.com/api/payments/phonepe/webhook

# Check webhook logs
grep "webhook" logs.txt

# Verify in PhonePe dashboard
# Settings → Webhooks → View logs
```

**Solutions:**
- ✅ Verify webhook URL in PhonePe dashboard
- ✅ Check server is accessible (no firewall blocking)
- ✅ Verify signature verification logic
- ✅ Check PhonePe sends to correct URL

#### 3. External API Timeouts

**Symptoms:**
- Ferry bookings timing out
- Activity searches failing
- 504 Gateway Timeout errors

**Debugging:**
```javascript
// Add timeout logging
console.time('ferry-api-call');
const result = await ferryApi.search(params);
console.timeEnd('ferry-api-call');
```

**Solutions:**
- ✅ Increase timeout limits
- ✅ Implement retry logic
- ✅ Cache responses when possible
- ✅ Use background jobs for slow operations

#### 4. Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- Intermittent booking failures
- Slow page loads

**Solutions:**
- ✅ Check MongoDB Atlas IP whitelist
- ✅ Verify connection string format
- ✅ Enable connection pooling
- ✅ Add connection retry logic

---

## 📞 Support Contacts

### PhonePe Support
- **Email:** developers@phonepe.com
- **Phone:** +91-80-68727374
- **Dashboard:** https://business.phonepe.com/

### External APIs
- **Sealink:** support@sealink-andaman.com
- **Makruzz:** booking@makruzz.com
- **Green Ocean:** support@greenoceanferry.com

### Hosting
- **Vercel:** support@vercel.com
- **Railway:** team@railway.app

---

## 🎯 Performance Optimization

### Before Launch

1. **Enable Edge Caching:**
   ```typescript
   // next.config.js
   export const revalidate = 60; // ISR
   ```

2. **Optimize Images:**
   ```typescript
   // Use Next.js Image component
   import Image from 'next/image';
   ```

3. **Minimize Bundle Size:**
   ```bash
   pnpm build
   pnpm analyze # if bundle analyzer configured
   ```

4. **Database Indexes:**
   - Create indexes on frequently queried fields
   - Monitor slow queries

### Post-Launch Monitoring

- Run Lighthouse audits monthly
- Monitor Core Web Vitals
- Track API response times
- Review error logs weekly

---

## ✅ Final Checklist

### Before Going Live

- [ ] All environment variables set in production
- [ ] Production database configured and tested
- [ ] PhonePe production credentials obtained
- [ ] Webhook URL configured in PhonePe dashboard
- [ ] Custom domain configured and SSL enabled
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Monitoring/alerts configured
- [ ] Payment flow tested end-to-end
- [ ] Backup strategy in place
- [ ] Support email/phone configured

### After Going Live

- [ ] Monitor error logs for 24 hours
- [ ] Test payment flow with real transactions
- [ ] Verify webhooks working correctly
- [ ] Check external API integrations
- [ ] Monitor database performance
- [ ] Verify email/SMS notifications
- [ ] Test booking confirmations

---

## 🎉 You're Ready for Production!

Your Andaman Excursion platform is now production-ready with:

✅ **PhonePe v2 Integration** - Redirect flow with webhook support
✅ **Booking System** - Activities, ferries, boats
✅ **Payment Processing** - Create orders, status checks, webhooks
✅ **Error Handling** - Edge cases covered
✅ **Database Integration** - Payload CMS with MongoDB
✅ **Production Webhook** - Real-time payment updates

**Questions?** Check the documentation in `/docs` folder.

**Good luck with your launch!** 🚀
