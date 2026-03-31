# Plivo WhatsApp Integration

WhatsApp messaging via **Plivo WhatsApp Business API** using approved Meta templates.

## Architecture

```
User Action (Booking/Payment/Enquiry)
    ↓
API Endpoint (e.g., phonepe/status/route.ts)
    ↓
NotificationManager.sendNotification()
    ↓
WhatsAppNotificationChannel
    ↓
Plivo SDK → client.messages.create(src, dst, text, { type: "whatsapp", template: {...} })
    ↓
Plivo WhatsApp API → Meta → Recipient WhatsApp
    ↓
Delivery Status → POST /api/webhooks/plivo/whatsapp
```

## Files

| File | Description |
|------|-------------|
| `src/services/notifications/channels/whatsapp.ts` | WhatsApp channel (Plivo) |
| `src/services/notifications/NotificationManager.ts` | Notification orchestrator |
| `src/services/notifications/channels/base.ts` | Base interfaces |
| `src/app/api/test/whatsapp/route.ts` | Test endpoint |
| `src/app/api/webhooks/plivo/whatsapp/route.ts` | Delivery status webhook |

## Environment Variables

```env
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token
PLIVO_WHATSAPP_NUMBER=+15558372537
```

## Approved Templates

All 5 templates are approved on Plivo/Meta:

| Notification Type | Plivo Template Name | Parameters |
|-------------------|---------------------|------------|
| Booking Confirmation | `copy_booking_conformation_hx3a96db396e8ce0dee85b1c9cb6f7ec18` | customerName, confirmationNumber, bookingType, title, date, time, passengers, amount |
| Status Update | `status_update_template_hx9e2ef803ef033cc9e572cd096e77a486` | customerName, confirmationNumber, statusChange, message |
| Booking Reminder | `booking_reminder_template_hx34db11f9481cc4192e939b9593ddabfc` | customerName, confirmationNumber, date |
| Payment Failed | `payment_failed_template_hxe3ab754a258d9342213a8f0a732fb37d` | customerName, amount, failureReason |
| Enquiry Confirmation | `enquiry_confirmation_template_hxdef2c5a728890825bd40f13e00da910a` | fullName, enquiryId, selectedPackage |

## Webhook URL

Add this URL in your Plivo Console under WhatsApp > Configurations > Message Status URL:

```
https://your-domain.com/api/webhooks/plivo/whatsapp
```

This receives delivery status callbacks (sent, delivered, read, failed).

## How Messages Are Sent

All messages use approved templates (required by WhatsApp Business API for business-initiated messages). The Plivo SDK call:

```typescript
client.messages.create(
  src,           // PLIVO_WHATSAPP_NUMBER
  dst,           // Recipient phone (+91XXXXXXXXXX)
  "",            // Empty text (template provides content)
  {
    type: "whatsapp",
    template: JSON.stringify({
      name: "template_name",
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: "value1" },
            { type: "text", text: "value2" },
          ]
        }
      ]
    })
  }
);
```

## Usage

### Via NotificationManager

```typescript
import { notificationManager } from "@/services/notifications/NotificationManager";

// Booking confirmation
await notificationManager.sendNotification({
  type: "booking_confirmation",
  recipients: { phone: "+919876543210" },
  data: {
    bookingId: "BK123",
    confirmationNumber: "CONF-456",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    bookingDate: new Date(),
    totalAmount: 5000,
    currency: "INR",
    bookingType: "ferry",
    items: [{
      title: "Ferry: Port Blair to Havelock",
      date: "2024-01-15",
      time: "08:00 AM",
      passengers: 2
    }]
  }
});

// Enquiry confirmation
await notificationManager.sendNotification({
  type: "enquiry_confirmation",
  recipients: { phone: "+919876543210" },
  data: {
    enquiryId: "ENQ-789",
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "+919876543210",
    selectedPackage: "Havelock Island Package",
    message: "Interested in 3-day package",
    submissionDate: new Date().toISOString()
  }
});
```

### Direct Channel Usage

```typescript
import { WhatsAppNotificationChannel } from "@/services/notifications/channels/whatsapp";

const whatsapp = new WhatsAppNotificationChannel();

const result = await whatsapp.send({
  type: "enquiry_confirmation",
  recipient: "+919876543210",
  data: {
    fullName: "Test User",
    enquiryId: "TEST-001",
    selectedPackage: "Test Package"
  }
});

console.log(result.success, result.messageId);
```

## Test Endpoint

```bash
# Check config
curl http://localhost:3000/api/test/whatsapp

# Send test (uses enquiry_confirmation template)
curl -X POST http://localhost:3000/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid WhatsApp number | Wrong phone format | Use +91XXXXXXXXXX |
| Template not approved | Meta hasn't approved | Check Plivo Console |
| Rate limit exceeded | Too many messages | Throttle sends |
| Plivo authentication failed | Wrong credentials | Check PLIVO_AUTH_ID/TOKEN |
| WhatsApp number not registered | From number not set up | Register in Plivo Console |
| Phone Number Registration Error | From number not registered with WhatsApp | Complete WhatsApp number registration in Plivo |

## Message Status Check

```typescript
const status = await whatsapp.getMessageStatus("message-uuid-here");
// { status: "delivered", errorCode: undefined }
```
