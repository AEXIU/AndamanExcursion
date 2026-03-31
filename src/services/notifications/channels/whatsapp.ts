/**
 * WhatsApp notification channel with Plivo WhatsApp Business API
 * Uses approved templates for all business-initiated messages
 */

import {
  BaseNotificationChannel,
  NotificationPayload,
  NotificationResult,
  BookingConfirmationData,
  BookingStatusUpdateData,
  PaymentFailedData,
  EnquiryData,
} from "./base";

import * as plivo from "plivo";

export class WhatsAppNotificationChannel extends BaseNotificationChannel {
  name = "whatsapp";
  private client: plivo.Client | null = null;

  // Support phone number for all templates (format as shown in screenshots)
  private readonly SUPPORT_PHONE = "+91-8107664041";

  // Approved Plivo template names (Meta-approved)
  private readonly templates = {
    booking_confirmation: process.env.PLIVO_TEMPLATE_BOOKING_CONFIRMATION || "copy_booking_conformation_hx3a96db396e8ce0dee85b1c9cb6f7ec18",
    booking_status_update: process.env.PLIVO_TEMPLATE_STATUS_UPDATE || "status_update_template_hx9e2ef803ef033cc9e572cd096e77a486",
    booking_reminder: process.env.PLIVO_TEMPLATE_BOOKING_REMINDER || "booking_reminder_template_hx34db11f9481cc4192e939b9593ddabfc",
    payment_failed: process.env.PLIVO_TEMPLATE_PAYMENT_FAILED || "payment_failed_template_hxe3ab754a258d9342213a8f0a732fb37d",
    enquiry_confirmation: process.env.PLIVO_TEMPLATE_ENQUIRY_CONFIRMATION || "enquiry_confirmation_template_hxdef2c5a728890825bd40f13e00da910a",
    activity_confirmation: process.env.PLIVO_TEMPLATE_ACTIVITY_CONFIRMATION || "PASTE_META_ACTIVITY_TEMPLATE_HUB_ID_HERE", // Replace when approved
  };

  constructor() {
    super();

    if (this.isEnabled()) {
      try {
        this.client = new plivo.Client(
          process.env.PLIVO_AUTH_ID!,
          process.env.PLIVO_AUTH_TOKEN!
        );
      } catch (error) {
        console.error("Failed to initialize Plivo client:", error);
        this.client = null;
      }
    }
  }

  private getFromNumber(): string {
    return process.env.PLIVO_WHATSAPP_NUMBER || "";
  }

  isEnabled(): boolean {
    const authId = process.env.PLIVO_AUTH_ID;
    const authToken = process.env.PLIVO_AUTH_TOKEN;
    const fromNumber = this.getFromNumber();

    const enabled = !!(authId && authToken && fromNumber);

    if (!enabled) {
      console.log("WhatsApp is NOT enabled:", {
        hasAuthId: !!authId,
        hasAuthToken: !!authToken,
        hasFromNumber: !!fromNumber,
      });
    }

    return enabled;
  }

  private getClient(): plivo.Client {
    if (!this.client) {
      throw new Error("WhatsApp client not initialized - check Plivo credentials");
    }
    return this.client;
  }

  async send<T>(payload: NotificationPayload<T>): Promise<NotificationResult> {
    if (!this.isEnabled()) {
      return this.createResult(
        false,
        undefined,
        "WhatsApp service not configured - missing Plivo credentials or WhatsApp number"
      );
    }

    if (!this.validatePhoneNumber(payload.recipient)) {
      return this.createResult(
        false,
        undefined,
        `Invalid phone number format: ${payload.recipient}. Must be in +91XXXXXXXXXX format`
      );
    }

    try {
      const client = this.getClient();
      const to = this.formatPhoneNumber(payload.recipient);
      const template = this.buildTemplate(payload);

      console.log("Sending WhatsApp template:", {
        type: "whatsapp",
        templateName: template.name,
        recipientMasked: this.maskPhoneNumber(to),
      });

      const response = await client.messages.create(
        this.getFromNumber(),
        to,
        "", // Empty string for text content when using template
        {
          type: "whatsapp",
          template: {
            name: template.name,
            language: template.language,
            components: template.components,
          },
        }
      );

      const messageUuid = response.messageUuid?.[0] || "unknown";

      console.log("WhatsApp sent:", {
        messageUuid,
        recipient: this.maskPhoneNumber(payload.recipient),
      });

      return this.createResult(true, messageUuid, undefined, {
        provider: "plivo-whatsapp",
        recipient: this.maskPhoneNumber(payload.recipient),
        template: template.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`WhatsApp error for ${payload.type}:`, error);

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid destination")) return this.createResult(false, undefined, "Invalid WhatsApp number");
        if (msg.includes("template")) return this.createResult(false, undefined, "Message template not approved or invalid");
        if (msg.includes("rate limit") || msg.includes("throttl")) return this.createResult(false, undefined, "Rate limit exceeded");
        if (msg.includes("authentication") || msg.includes("unauthorized")) return this.createResult(false, undefined, "Plivo authentication failed");
        if (msg.includes("not registered")) return this.createResult(false, undefined, "WhatsApp number not registered on Plivo");
      }

      return this.createResult(
        false,
        undefined,
        error instanceof Error ? error.message : "Unknown WhatsApp error"
      );
    }
  }

  private buildTemplate<T>(
    payload: NotificationPayload<T>
  ): { name: string; language: string; components: any[] } {
    let template;

    switch (payload.type) {
      case "booking_confirmation":
        if ((payload.data as BookingConfirmationData).bookingType === "activity") {
          template = this.activityConfirmationTemplate(payload.data as BookingConfirmationData);
        } else {
          template = this.bookingConfirmationTemplate(payload.data as BookingConfirmationData);
        }
        break;
      case "booking_status_update":
        template = this.statusUpdateTemplate(payload.data as BookingStatusUpdateData);
        break;
      case "booking_reminder":
        template = this.reminderTemplate(payload.data as BookingStatusUpdateData);
        break;
      case "payment_failed":
        template = this.paymentFailedTemplate(payload.data as PaymentFailedData);
        break;
      case "enquiry_confirmation":
        template = this.enquiryConfirmationTemplate(payload.data as EnquiryData);
        break;
      default:
        template = this.enquiryConfirmationTemplate({
          fullName: "Customer",
          enquiryId: "N/A",
          selectedPackage: "General",
        } as EnquiryData);
    }

    // Debug log to verify template structure
    console.log("Template Debug:", {
      type: payload.type,
      templateName: template.name,
      language: template.language,
      componentCount: template.components.length,
      parameterCount: template.components[0]?.parameters?.length || 0,
      parameters: template.components[0]?.parameters?.map((p: any) => p.text) || []
    });

    return template;
  }

  private activityConfirmationTemplate(data: BookingConfirmationData) {
    // Activity Template: 9 variables in body
    // {{1}} Customer Name, {{2}} Booking ID, {{3}} Activity Name, {{4}} Date,
    // {{5}} Time, {{6}} Location/Meeting Point, {{7}} Participants,
    // {{8}} Amount, {{9}} Support Phone
    const firstItem = data.items[0] || {};

    const formatDate = (dateInput?: string | Date): string => {
      if (!dateInput) return "15 Dec 2025";
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };

    return {
      name: this.templates.activity_confirmation,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName || "Customer" },                 // {{1}} Customer Name
            { type: "text", text: data.confirmationNumber || "AE2025001234" },       // {{2}} Booking ID
            { type: "text", text: firstItem.title || "Scuba Diving" },               // {{3}} Activity Name
            { type: "text", text: formatDate(firstItem.date || data.bookingDate) },  // {{4}} Date
            { type: "text", text: firstItem.time || "10:00 AM" },                    // {{5}} Time
            { type: "text", text: firstItem.location || "Havelock Island Beach" },   // {{6}} Location
            { type: "text", text: (firstItem.passengers || 2).toString() },          // {{7}} Participants Count
            { type: "text", text: data.totalAmount ? data.totalAmount.toLocaleString("en-IN") : "3,500" }, // {{8}} Amount
            { type: "text", text: this.SUPPORT_PHONE },                               // {{9}} Support Phone
          ],
        },
      ],
    };
  }

  private bookingConfirmationTemplate(data: BookingConfirmationData) {
    // From LIVE META SCREENSHOT: 10 variables in body
    // {{1}} Customer Name, {{2}} Booking ID, {{3}} Route, {{4}} Date,
    // {{5}} Departure Time, {{6}} Passengers, {{7}} Seat/Class,
    // {{8}} Amount, {{9}} Arrival Time, {{10}} Support Phone
    const firstItem = data.items[0] || {};

    const formatDate = (dateInput?: string | Date): string => {
      if (!dateInput) return "15 Dec 2025";
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };

    return {
      name: this.templates.booking_confirmation,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName || "Customer" },                 // {{1}} Customer Name
            { type: "text", text: data.confirmationNumber || "AE2025001234" },       // {{2}} Booking ID
            { type: "text", text: firstItem.location || "Port Blair to Havelock" },  // {{3}} Route
            { type: "text", text: formatDate(firstItem.date || data.bookingDate) },  // {{4}} Date
            { type: "text", text: firstItem.time || "08:30 AM" },                    // {{5}} Departure Time
            { type: "text", text: (firstItem.passengers || 2).toString() },          // {{6}} Passengers Count
            { type: "text", text: firstItem.seatClass || "Premium" },                // {{7}} Seat/Class
            { type: "text", text: data.totalAmount ? data.totalAmount.toLocaleString("en-IN") : "2,800" }, // {{8}} Amount
            { type: "text", text: "1 hour" },                                       // {{9}} Arrive X before departure
            { type: "text", text: this.SUPPORT_PHONE },                               // {{10}} Support Phone
          ],
        },
      ],
    };
  }

  private statusUpdateTemplate(data: BookingStatusUpdateData) {
    // From screenshot 170607.png: 9 variables
    const getStatusEmoji = (status: string): string => {
      const lowerStatus = (status || "").toLowerCase();
      if (lowerStatus.includes('cancel')) return '❌';
      if (lowerStatus.includes('complet')) return '✅';
      if (lowerStatus.includes('confirm')) return '✅';
      if (lowerStatus.includes('update')) return '🔄';
      return '😊';
    };

    const formatDate = (dateInput?: string | Date): string => {
      if (!dateInput) return "15 Dec 2025";
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };

    const newStatus = data.newStatus || "Updated";
    const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    const statusEmoji = getStatusEmoji(newStatus);
    const updateDate = formatDate(data.updateDate);

    return {
      name: this.templates.booking_status_update,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: statusText },                    // {{1}} Status text (Updated/Cancelled/Completed)
            { type: "text", text: statusEmoji },                    // {{2}} Status emoji (😊)
            { type: "text", text: data.customerName || "Customer" }, // {{3}} Customer Name
            { type: "text", text: data.confirmationNumber || "N/A" }, // {{4}} Confirmation Number
            { type: "text", text: data.oldStatus || "Pending" },    // {{5}} Old Status
            { type: "text", text: newStatus },                       // {{6}} New Status
            { type: "text", text: updateDate },                      // {{7}} Date
            { type: "text", text: data.message || "Your booking status has been updated." }, // {{8}} Custom message
            { type: "text", text: this.SUPPORT_PHONE },              // {{9}} Support phone
          ],
        },
      ],
    };
  }

  private reminderTemplate(data: BookingStatusUpdateData) {
    // From screenshot 170527.png: 5 variables
    const formatDate = (dateInput?: string | Date): string => {
      if (!dateInput) return "15 Dec 2025";
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };

    const reminderDate = formatDate(data.updateDate);

    return {
      name: this.templates.booking_reminder,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName || "Customer" },      // {{1}} Customer Name
            { type: "text", text: data.confirmationNumber || "N/A" },     // {{2}} Confirmation Number
            { type: "text", text: reminderDate },                          // {{3}} Date
            { type: "text", text: "😊" },                                  // {{4}} Closing emoji
            { type: "text", text: this.SUPPORT_PHONE },                    // {{5}} Support phone
          ],
        },
      ],
    };
  }

  private paymentFailedTemplate(data: PaymentFailedData) {
    // From screenshot 170454.png: 4 variables
    return {
      name: this.templates.payment_failed,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName || "Customer" },                          // {{1}} Customer Name
            { type: "text", text: `₹${data.attemptedAmount?.toLocaleString("en-IN") || "4,500"}` }, // {{2}} Amount (₹4,500)
            { type: "text", text: data.failureReason || "Insufficient funds" },               // {{3}} Failure Reason
            { type: "text", text: this.SUPPORT_PHONE },                                       // {{4}} Support phone
          ],
        },
      ],
    };
  }

  private enquiryConfirmationTemplate(data: EnquiryData) {
    // Corrected Logic based on LIVE META SCREENSHOTS (5:03 PM)
    // The template DEFINITELY has 6 variables:
    // {{1}} Customer Name
    // {{2}} Enquiry ID
    // {{3}} Selected Package
    // {{4}} Submission Date
    // {{5}} Closing emoji (Variable!)
    // {{6}} Support phone (Variable!)

    // Helper for date
    const formatDate = (dateInput?: string | Date): string => {
      if (!dateInput) return "15 Dec 2025";
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };

    return {
      name: this.templates.enquiry_confirmation,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.fullName || "Customer" },        // {{1}} Customer Name
            { type: "text", text: data.enquiryId || "ENQ123456" },      // {{2}} Enquiry ID
            { type: "text", text: data.selectedPackage || "Island Tour" }, // {{3}} Package
            { type: "text", text: formatDate(data.submissionDate) },     // {{4}} Date
            { type: "text", text: "🌴" },                                // {{5}} Closing Emoji
            { type: "text", text: this.SUPPORT_PHONE },                  // {{6}} Support Phone
          ],
        },
      ],
    };
  }

  // Test method for debugging - send hello_world template
  async sendHelloWorld(phoneNumber: string): Promise<NotificationResult> {
    try {
      const client = this.getClient();
      const to = this.formatPhoneNumber(phoneNumber);

      console.log("Sending hello_world test message to:", to);

      const response = await client.messages.create(
        this.getFromNumber(),
        to,
        "", // Empty string for text content when using template
        {
          type: "whatsapp",
          template: {
            name: "hello_world",
            language: "en_US",
            components: [],
          },
        }
      );

      const messageUuid = response.messageUuid?.[0] || "unknown";

      return this.createResult(true, messageUuid, undefined, {
        provider: "plivo-whatsapp",
        recipient: this.maskPhoneNumber(phoneNumber),
        template: "hello_world",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Hello world test failed:", error);
      return this.createResult(
        false,
        undefined,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  private validatePhoneNumber(phone: string): boolean {
    if (!this.validateRecipient(phone)) return false;
    return /^\+[1-9]\d{1,14}$/.test(phone.trim());
  }

  private formatPhoneNumber(phone: string): string {
    return phone.startsWith("+") ? phone.trim() : "+" + phone.trim();
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length < 8) return phone;
    return phone.substring(0, 4) + "X".repeat(phone.length - 7) + phone.substring(phone.length - 3);
  }

  async getMessageStatus(messageUuid: string): Promise<{
    status: string;
    errorCode?: string;
  }> {
    const client = this.getClient();
    const message = await client.messages.get(messageUuid);
    return {
      status: message.messageState || "unknown",
      errorCode: message.errorCode || undefined,
    };
  }
}