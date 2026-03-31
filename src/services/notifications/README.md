# Unified Notification System

This system provides comprehensive multi-channel notifications for the Andaman Excursion booking platform using Payload's built-in email adapter and extensible architecture for future channels.

## 🚀 Setup

### 1. Dependencies

The following packages are required:

```bash
npm install @payloadcms/email-resend @react-email/components
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Required for email service (Payload Resend Adapter)
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@andamanexcursion.com

# Optional configuration
REPLY_TO_EMAIL=support@andamanexcursion.com
TEST_EMAIL=your-test-email@example.com
ADMIN_EMAIL=admin@andamanexcursion.com

# Future WhatsApp integration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_ACCOUNT_ID=your_whatsapp_account_id
WHATSAPP_FROM_NUMBER=+91XXXXXXXXXX
TEST_PHONE=+91XXXXXXXXXX

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Payload Configuration

The email adapter is already configured in `src/payload.config.ts`:

```typescript
export default buildConfig({
  // ... other config
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || "",
    defaultFromAddress: process.env.FROM_EMAIL || "",
    defaultFromName: "Andaman Excursion",
  }),
});
```

## 🏗️ Architecture

### Core Components

1. **NotificationManager** - Central orchestrator for all channels
2. **Channel System** - Pluggable notification channels (Email, WhatsApp, SMS, etc.)
3. **NotificationService** - Legacy-compatible service layer
4. **Template System** - React email templates for rich formatting

### Channel Architecture

```
NotificationManager
├── EmailNotificationChannel (✅ Active - Uses Payload's Resend adapter)
├── WhatsAppNotificationChannel (🚧 Prepared for implementation)
└── SMSNotificationChannel (🔮 Future)
```

### Key Benefits

- **Unified Interface**: Single API for all notification types
- **Multi-Channel Support**: Email, WhatsApp, SMS, and more
- **Scalable**: Easy to add new channels
- **Payload Integration**: Uses Payload's built-in email service
- **Type Safe**: Full TypeScript support
- **Backward Compatible**: Existing code works unchanged

## 📧 Usage

### Basic Usage (Recommended)

```typescript
import { notificationManager } from "@/services/notifications/NotificationManager";

// Send booking confirmation
const results = await notificationManager.sendBookingConfirmation(
  bookingData,
  {
    email: "customer@example.com",
    phone: "+91XXXXXXXXXX",
  },
  {
    sendEmailUpdates: true,
    sendWhatsAppUpdates: true,
    language: "en",
  }
);

// Check results
console.log("Email sent:", results.email?.success);
console.log("WhatsApp sent:", results.whatsapp?.success);
```

### Legacy Usage (Still Supported)

```typescript
import { NotificationService } from "@/services/notifications/notificationService";

// This still works unchanged
await NotificationService.sendBookingConfirmation("booking-id");
```

### Direct Channel Access

```typescript
import { notificationManager } from "@/services/notifications/NotificationManager";

// Get email channel for advanced usage
const emailChannel = notificationManager.getChannel("email");
if (emailChannel?.isEnabled()) {
  const result = await emailChannel.send({
    type: "booking_confirmation",
    recipient: "customer@example.com",
    data: bookingData,
  });
}
```

## 🔧 Available Notifications

### Booking Notifications

- **Booking Confirmation** - Sent after successful payment
- **Status Updates** - Sent when booking status changes
- **Reminders** - Sent before activity date
- **Payment Failed** - Sent when payment fails

### Enquiry Notifications

- **Customer Confirmation** - Sent to customer after enquiry
- **Admin Notification** - Sent to admin about new enquiries

### Bulk Notifications

- **Promotional Emails** - Marketing campaigns
- **System Updates** - Platform announcements

## 🧪 Testing

### Test All Channels

```typescript
import { NotificationService } from "@/services/notifications/notificationService";

const results = await NotificationService.testAllChannels();
console.log("Email test:", results.email);
console.log("WhatsApp test:", results.whatsapp);
```

### Test via API Endpoint

```bash
# Test notification system
curl -X POST /api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "booking-confirmation",
    "testEmail": "test@example.com",
    "testPhone": "+91XXXXXXXXXX"
  }'
```

### Channel Status Check

```typescript
const status = NotificationService.getChannelStatus();
console.log("Available channels:", status);
// Output: { email: { enabled: true, name: "email" }, whatsapp: { enabled: false, name: "whatsapp" } }
```

## 📱 WhatsApp Integration (Future)

The WhatsApp channel is prepared and ready for implementation. When you're ready to add WhatsApp notifications:

1. Set up WhatsApp Business API account
2. Add environment variables (see above)
3. Implement the `sendWhatsAppMessage` method in `WhatsAppNotificationChannel`
4. Enable the channel by updating `isEnabled()` method

The channel will automatically start working with all existing notification calls.

## 🔌 Adding New Channels

To add a new notification channel (e.g., SMS):

1. Create a new channel class:

```typescript
// src/services/notifications/channels/sms.ts
import { BaseNotificationChannel } from "./base";

export class SMSNotificationChannel extends BaseNotificationChannel {
  name = "sms";

  isEnabled(): boolean {
    return !!process.env.SMS_API_KEY;
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // Implement SMS sending logic
  }
}
```

2. Register the channel:

```typescript
// In NotificationManager constructor
const smsChannel = new SMSNotificationChannel();
this.channels.set(smsChannel.name, smsChannel);
```

3. Use it immediately:

```typescript
await notificationManager.sendNotification({
  type: "booking_confirmation",
  recipients: { phone: "+91XXXXXXXXXX" },
  data: bookingData,
  preferences: { sendSMSUpdates: true },
});
```

## 🏷️ Templates

Email templates are located in `src/templates/email/`:

- `BookingConfirmationTemplate.tsx` - Booking confirmations
- `BookingStatusUpdateTemplate.tsx` - Status updates and reminders
- `PaymentFailedTemplate.tsx` - Payment failures

Templates are React components with full styling and can be easily customized.

## 🔍 Monitoring & Logging

The system provides comprehensive logging:

```typescript
// All notifications are logged with structured data
[NotificationManager] {
  "type": "booking_confirmation",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "results": {
    "email": { "success": true, "messageId": "msg_123" },
    "whatsapp": { "success": true, "messageId": "wa_456" }
  }
}
```

## 🔧 Migration from Old System

The new system is fully backward compatible. Your existing code using `EmailService` or `NotificationService` will continue to work unchanged while benefiting from the new architecture.

### Key Changes Made

1. ✅ **Payload Integration** - Now uses Payload's built-in Resend adapter
2. ✅ **Multi-Channel Architecture** - Extensible for WhatsApp, SMS, etc.
3. ✅ **Unified Interface** - Single API for all notification types
4. ✅ **Better Error Handling** - Structured error responses
5. ✅ **Type Safety** - Full TypeScript support
6. ✅ **Backward Compatibility** - Existing code unchanged

### Performance Benefits

- **Reduced Dependencies** - Fewer direct API calls
- **Better Caching** - Payload handles connection pooling
- **Unified Logging** - Centralized monitoring
- **Parallel Sending** - Multi-channel notifications in parallel

## 🚀 Production Checklist

- [ ] Set `RESEND_API_KEY` in production environment
- [ ] Configure `FROM_EMAIL` with your verified domain
- [ ] Set up `ADMIN_EMAIL` for enquiry notifications
- [ ] Test email deliverability
- [ ] Monitor notification success rates
- [ ] Set up WhatsApp Business API (when ready)
- [ ] Configure webhook endpoints for delivery status

## 📊 Future Roadmap

- [ ] WhatsApp Business API integration
- [ ] SMS notifications via Twilio/AWS SNS
- [ ] Push notifications for mobile app
- [ ] Slack notifications for admin alerts
- [ ] Email analytics and tracking
- [ ] A/B testing for templates
- [ ] Scheduled notifications
- [ ] Notification preferences management UI

---

For detailed implementation examples, see the code in `src/services/notifications/` directory.
