# WhatsApp Business API Templates Setup

This guide covers setting up WhatsApp message templates for your Andaman Excursion booking platform through Twilio.

## 🚨 Important: Template Approval Process

**ALL WhatsApp templates must be pre-approved by Meta before you can send them.** Templates typically take 24-48 hours for approval.

## 📋 Required Templates for Your Booking System

### 1. Booking Confirmation Template
**Template Name:** `booking_confirmation_template`  
**Category:** Utility  
**Language:** English  

**Template Content:**
```
🏝️ *Booking Confirmed - Andaman Excursion*

Hi {{1}}, your booking is confirmed!

📋 *Details:*
• Confirmation: {{2}}
• Amount: {{3}}
• Date: {{4}}
• Services: {{5}}

⚠️ *Important:*
• Arrive 30 minutes early
• Bring valid government ID
• Save this confirmation

Need help? Contact support.
Thank you for choosing us! 🌴
```

**Variables:**
- {{1}} = Customer Name
- {{2}} = Confirmation Number  
- {{3}} = Total Amount (currency format)
- {{4}} = Booking Date
- {{5}} = Services booked

### 2. Status Update Template
**Template Name:** `status_update_template`  
**Category:** Utility  
**Language:** English  

**Template Content:**
```
🏝️ *Booking Update - Andaman Excursion*

Hi {{1}}, your booking status has been updated.

📋 *Booking:* {{2}}
🔄 *Status:* {{3}}
💬 *Message:* {{4}}

For questions, contact our support team.
Thank you! 🌴
```

**Variables:**
- {{1}} = Customer Name
- {{2}} = Confirmation Number
- {{3}} = Status Change (Old → New)
- {{4}} = Custom Message

### 3. Booking Reminder Template
**Template Name:** `booking_reminder_template`  
**Category:** Utility  
**Language:** English  

**Template Content:**
```
🏝️ *Booking Reminder - Andaman Excursion*

Hi {{1}}, friendly reminder about your booking:

📋 *Confirmation:* {{2}}
📅 *Date:* {{3}}

⚠️ *Remember:*
• Arrive 30 minutes early
• Bring valid ID
• Check weather conditions

Safe travels! 🌴
```

**Variables:**
- {{1}} = Customer Name
- {{2}} = Confirmation Number
- {{3}} = Service Date

### 4. Payment Failed Template
**Template Name:** `payment_failed_template`  
**Category:** Utility  
**Language:** English  

**Template Content:**
```
🏝️ *Payment Issue - Andaman Excursion*

Hi {{1}}, your payment of {{2}} could not be processed.

Reason: {{3}}

Please try again or contact our support team for assistance.

We're here to help! 🌴
```

**Variables:**
- {{1}} = Customer Name
- {{2}} = Amount (currency format)
- {{3}} = Failure Reason

### 5. Enquiry Confirmation Template
**Template Name:** `enquiry_confirmation_template`  
**Category:** Utility  
**Language:** English  

**Template Content:**
```
🏝️ *Enquiry Received - Andaman Excursion*

Hi {{1}}, we've received your enquiry!

📋 *Reference:* {{2}}
📦 *Package:* {{3}}

We'll respond within 24 hours. For urgent matters, call us directly.

Thank you for your interest! 🌴
```

**Variables:**
- {{1}} = Customer Name
- {{2}} = Enquiry ID
- {{3}} = Selected Package

## 🔧 Setting Up Templates in Twilio Console

### Step 1: Access WhatsApp Templates
1. Log into [Twilio Console](https://console.twilio.com)
2. Navigate to **Messaging** → **Try it out** → **WhatsApp**
3. Click on **WhatsApp Templates**

### Step 2: Create Each Template
For each template above:

1. Click **Create new template**
2. Enter the **Template Name** (exactly as shown above)
3. Select **Category**: Utility (for all booking-related templates)
4. Select **Language**: English
5. Paste the **Template Content** 
6. Add **Variable Placeholders** using {{1}}, {{2}}, etc.
7. Click **Submit for Approval**

### Step 3: Wait for Approval
- Templates typically take 24-48 hours for approval
- You'll receive email notifications about approval status
- Check template status in Twilio Console

### Step 4: Update Your Environment Variables
Once templates are approved, add to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token  
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Template Names (use exact approved names)
WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION=booking_confirmation_template
WHATSAPP_TEMPLATE_STATUS_UPDATE=status_update_template
WHATSAPP_TEMPLATE_BOOKING_REMINDER=booking_reminder_template
WHATSAPP_TEMPLATE_PAYMENT_FAILED=payment_failed_template
WHATSAPP_TEMPLATE_ENQUIRY_CONFIRMATION=enquiry_confirmation_template
```

## 💰 Cost Estimation for Your Use Case

### Template Costs (Meta Fees + Twilio Fees)
**India Rates (approximate):**
- Utility Messages: ~$0.010 per message
- Authentication: ~$0.008 per message  
- Marketing: ~$0.035 per message

**Monthly Cost Examples:**
- 1,000 booking confirmations: ~$10
- 500 status updates: ~$5
- 200 reminders: ~$2
- **Total for 1,700 messages/month: ~$17**

### Volume Discounts
- Higher volume gets better rates
- Exact pricing varies by country
- Check [WhatsApp Pricing](https://developers.facebook.com/docs/whatsapp/pricing) for current rates

## 🚀 Installation & Dependencies

```bash
# Install required packages
npm install twilio

# Install types (if using TypeScript)
npm install @types/twilio
```

## 🧪 Testing Your Integration

### 1. Update NotificationManager
Enable WhatsApp in your notification manager:

```typescript
// In NotificationManager constructor
const whatsappChannel = new WhatsAppNotificationChannel();
this.channels.set(whatsappChannel.name, whatsappChannel);
```

### 2. Test Single Notification
```typescript
import { notificationManager } from '@/services/notifications/NotificationManager';

// Test booking confirmation
const result = await notificationManager.sendBookingConfirmation(
  bookingData,
  {
    email: 'customer@example.com',
    phone: '+919999999999', // Your test number
  },
  {
    sendEmailUpdates: true,
    sendWhatsAppUpdates: true, // Enable WhatsApp
    language: 'en',
  }
);

console.log('WhatsApp sent:', result.whatsapp?.success);
```

### 3. Test via API Endpoint
Create a test endpoint:

```typescript
// pages/api/test-whatsapp.ts
import { notificationManager } from '@/services/notifications/NotificationManager';

export default async function handler(req, res) {
  const testData = {
    bookingId: 'TEST001',
    confirmationNumber: 'AE-TEST-001',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    bookingDate: new Date().toISOString(),
    totalAmount: 5000,
    currency: 'INR',
    bookingType: 'ferry',
    items: [{
      title: 'Test Ferry Booking',
      date: '2024-02-15',
      time: '10:30 AM',
      location: 'Port Blair to Havelock',
      passengers: 2
    }]
  };

  const result = await notificationManager.sendBookingConfirmation(
    testData,
    {
      email: 'test@example.com',
      phone: '+919999999999', // Replace with your number
    },
    {
      sendEmailUpdates: false,
      sendWhatsAppUpdates: true,
      language: 'en',
    }
  );

  res.json({ success: result.whatsapp?.success, result });
}
```

## ⚠️ Important Considerations

### Template Compliance
- Templates must follow WhatsApp guidelines
- No promotional content in utility templates
- Variables must match exactly
- Templates can be rejected for policy violations

### Rate Limits  
- 250 messages per day initially
- Increases based on phone number status
- Monitor rate limits in Twilio Console

### Phone Number Verification
- Users must opt-in to WhatsApp messaging
- International format required (+91XXXXXXXXXX)
- Invalid numbers will fail silently

### Customer Service Window
- 24-hour window after customer messages you
- Free-form messages allowed during window
- Template messages can be sent anytime

## 🔍 Monitoring & Analytics

### Message Status Tracking
```typescript
// Check delivery status
const whatsappChannel = notificationManager.getChannel('whatsapp');
const status = await whatsappChannel.getMessageStatus(messageSid);
console.log('Delivery status:', status.status);
```

### Analytics Dashboard
Monitor in Twilio Console:
- Message delivery rates
- Template approval status  
- Cost breakdown
- Error rates by type

### Error Handling
Common errors and solutions:
- **21211**: Invalid phone number format
- **63016**: Template not approved
- **63017**: Rate limit exceeded  
- **63024**: Template parameter mismatch

## 📈 Scaling Considerations

### Production Checklist
- [ ] All templates approved by Meta
- [ ] Test with real phone numbers
- [ ] Monitor delivery rates
- [ ] Set up error alerting
- [ ] Configure webhook for delivery status
- [ ] Plan for rate limit increases

### Future Enhancements
- Interactive buttons in templates
- Rich media messages (images, documents)
- WhatsApp Web integration
- Analytics dashboard
- A/B testing for templates

---

Once you've set up the templates and they're approved, your existing notification system will automatically start sending WhatsApp messages alongside emails. The integration is designed to be backwards-compatible with your current booking flow.