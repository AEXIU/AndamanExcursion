/**
 * Email notification channel using Payload's built-in Resend adapter
 * This replaces the direct Resend SDK usage with Payload's email service
 */

import { getPayload } from "payload";
import config from "@/payload.config";
import { render } from "@react-email/render"; // Add this import
import React from "react"; // Add React import for JSX
import {
  BaseNotificationChannel,
  NotificationPayload,
  NotificationResult,
  BookingConfirmationData,
  BookingStatusUpdateData,
  PaymentFailedData,
  EnquiryData,
  ChannelConfig,
} from "./base";

// Import React email templates - make sure these are default exports
import BookingEmailTemplate from "@/templates/email/BookingConfirmationTemplate";
import BookingStatusUpdateTemplate from "@/templates/email/BookingStatusUpdateTemplate";
import PaymentFailedTemplate from "@/templates/email/PaymentFailedTemplate";
import EnquiryConfirmationTemplate from "@/templates/email/EnquiryConfirmationTemplate";
import EnquiryNotificationTemplate from "@/templates/email/EnquiryNotificationTemplate";

export class EmailNotificationChannel extends BaseNotificationChannel {
  name = "email";

  private readonly defaultConfig: Required<ChannelConfig["email"]> = {
    fromAddress: process.env.FROM_EMAIL || "noreply@andamanexcursion.com",
    fromName: "Andaman Excursion",
    replyTo: process.env.REPLY_TO_EMAIL || "support@andamanexcursion.com",
  };

  isEnabled(): boolean {
    return !!(process.env.RESEND_API_KEY && this.defaultConfig?.fromAddress);
  }

  async send<T>(payload: NotificationPayload<T>): Promise<NotificationResult> {
    if (!this.isEnabled()) {
      return this.createResult(
        false,
        undefined,
        "Email service not configured - missing RESEND_API_KEY or FROM_EMAIL"
      );
    }

    if (!this.validateEmailRecipient(payload.recipient)) {
      return this.createResult(false, undefined, "Invalid email recipient");
    }

    try {
      const emailPayload = await this.buildEmailPayload(payload); // Make this async
      const result = await this.sendEmail(emailPayload);
      return result;
    } catch (error) {
      console.error(`Email channel error for type ${payload.type}:`, error);
      return this.createResult(
        false,
        undefined,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  async test(): Promise<NotificationResult> {
    const testEmail = process.env.TEST_EMAIL || "test@andamanexcursion.com";

    const testPayload: NotificationPayload<{ message: string }> = {
      type: "test",
      recipient: testEmail,
      data: { message: "This is a test email from your notification system." },
    };

    return this.send(testPayload);
  }

  private validateEmailRecipient(email: string): boolean {
    if (!this.validateRecipient(email)) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Make this method async to handle React rendering
  private async buildEmailPayload<T>(payload: NotificationPayload<T>) {
    const { type, recipient, data, options } = payload;

    switch (type) {
      case "booking_confirmation":
        return await this.buildBookingConfirmationEmail(
          recipient,
          data as BookingConfirmationData,
          options
        );

      case "booking_status_update":
        return await this.buildStatusUpdateEmail(
          recipient,
          data as BookingStatusUpdateData,
          options
        );

      case "booking_reminder":
        return await this.buildReminderEmail(
          recipient,
          data as BookingStatusUpdateData,
          options
        );

      case "payment_failed":
        return await this.buildPaymentFailedEmail(
          recipient,
          data as PaymentFailedData,
          options
        );

      case "enquiry_confirmation":
        return await this.buildEnquiryConfirmationEmail(
          recipient,
          data as EnquiryData,
          options
        );

      case "enquiry_notification":
        return await this.buildEnquiryNotificationEmail(
          recipient,
          data as EnquiryData,
          options
        );

      case "test":
        return this.buildTestEmail(recipient, data as any, options);

      default:
        throw new Error(`Unsupported email notification type: ${type}`);
    }
  }

  // Update all email builder methods to be async and render React to HTML
  private async buildBookingConfirmationEmail(
    recipient: string,
    data: BookingConfirmationData,
    options?: any
  ) {
    const htmlContent = await render(
      React.createElement(BookingEmailTemplate, data)
    );

    return {
      to: recipient,
      from: `${this.defaultConfig?.fromName} <${this.defaultConfig?.fromAddress}>`,
      replyTo: this.defaultConfig?.replyTo,
      subject: `Booking Confirmed - ${data.confirmationNumber}`,
      html: htmlContent, // ✅ Use 'html' instead of 'react'
      headers: {
        "X-Entity-Ref-ID": data.bookingId,
        "X-Booking-Type": data.bookingType,
        "X-Notification-Type": "booking_confirmation",
        ...options?.headers,
      },
    };
  }

  private async buildStatusUpdateEmail(
    recipient: string,
    data: BookingStatusUpdateData,
    options?: any
  ) {
    const subject = this.getStatusUpdateSubject(
      data.newStatus,
      data.confirmationNumber
    );

    const htmlContent = await render(
      React.createElement(BookingStatusUpdateTemplate, data)
    );

    return {
      to: recipient,
      from: `${this.defaultConfig?.fromName} <${this.defaultConfig?.fromAddress}>`,
      replyTo: this.defaultConfig?.replyTo,
      subject,
      html: htmlContent, // ✅ Use 'html' instead of 'react'
      headers: {
        "X-Entity-Ref-ID": data.bookingId,
        "X-Status-Update": `${data.oldStatus}->${data.newStatus}`,
        "X-Notification-Type": "booking_status_update",
        ...options?.headers,
      },
    };
  }

  private async buildReminderEmail(
    recipient: string,
    data: BookingStatusUpdateData,
    options?: any
  ) {
    const reminderData = {
      ...data,
      newStatus: data.oldStatus, // Keep same status for reminder
      message:
        data.message ||
        "This is a friendly reminder about your upcoming booking. Please arrive 30 minutes early and bring a valid ID.",
    };

    const htmlContent = await render(
      React.createElement(BookingStatusUpdateTemplate, reminderData)
    );

    return {
      to: recipient,
      from: `${this.defaultConfig?.fromName} <${this.defaultConfig?.fromAddress}>`,
      replyTo: this.defaultConfig?.replyTo,
      subject: `Reminder - ${data.confirmationNumber}`,
      html: htmlContent, // ✅ Use 'html' instead of 'react'
      headers: {
        "X-Entity-Ref-ID": data.bookingId,
        "X-Notification-Type": "booking_reminder",
        ...options?.headers,
      },
    };
  }

  private async buildPaymentFailedEmail(
    recipient: string,
    data: PaymentFailedData,
    options?: any
  ) {
    const htmlContent = await render(
      React.createElement(PaymentFailedTemplate, data)
    );

    return {
      to: recipient,
      from: `${this.defaultConfig?.fromName} <${this.defaultConfig?.fromAddress}>`,
      replyTo: this.defaultConfig?.replyTo,
      subject: "Payment Failed - Andaman Excursion",
      html: htmlContent, // ✅ Use 'html' instead of 'react'
      headers: {
        "X-Payment-Failed": "true",
        "X-Amount": data.attemptedAmount.toString(),
        "X-Notification-Type": "payment_failed",
        ...options?.headers,
      },
    };
  }

  private async buildEnquiryConfirmationEmail(
    recipient: string,
    data: EnquiryData,
    options?: any
  ) {
    const htmlContent = await render(
      React.createElement(EnquiryConfirmationTemplate, data)
    );

    return {
      to: recipient,
      from: `${this.defaultConfig?.fromName} <${this.defaultConfig?.fromAddress}>`,
      replyTo: this.defaultConfig?.replyTo,
      subject: `Enquiry Received - ${data.enquiryId}`,
      html: htmlContent, // ✅ Use 'html' instead of 'react'
      headers: {
        "X-Entity-Ref-ID": data.enquiryId,
        "X-Enquiry-Type": "confirmation",
        "X-Notification-Type": "enquiry_confirmation",
        ...options?.headers,
      },
    };
  }

  private async buildEnquiryNotificationEmail(
    recipient: string,
    data: EnquiryData,
    options?: any
  ) {
    const htmlContent = await render(
      React.createElement(EnquiryNotificationTemplate, data)
    );

    return {
      to: recipient,
      from: `${this.defaultConfig?.fromName} <${this.defaultConfig?.fromAddress}>`,
      replyTo: this.defaultConfig?.replyTo,
      subject: `New Enquiry - ${data.enquiryId}`,
      html: htmlContent, // ✅ Use 'html' instead of 'react'
      headers: {
        "X-Entity-Ref-ID": data.enquiryId,
        "X-Enquiry-Type": "notification",
        "X-Notification-Type": "enquiry_notification",
        ...options?.headers,
      },
    };
  }

  private buildTestEmail(recipient: string, data: any, options?: any) {
    return {
      to: recipient,
      from: `${this.defaultConfig?.fromName} <${this.defaultConfig?.fromAddress}>`,
      replyTo: this.defaultConfig?.replyTo,
      subject: "Email Configuration Test - Andaman Excursion",
      html: `
        <h1>Email service is working correctly!</h1>
        <p>This is a test email from your Andaman Excursion notification system.</p>
        <p><strong>Test Data:</strong> ${JSON.stringify(data, null, 2)}</p>
        <p><em>Sent at: ${new Date().toISOString()}</em></p>
      `,
      headers: {
        "X-Notification-Type": "test",
        ...options?.headers,
      },
    };
  }

  private async sendEmail(emailPayload: any): Promise<NotificationResult> {
    try {
      const payload = await getPayload({ config });

      // Use Payload's built-in email service (Resend adapter)
      const result = await payload.sendEmail(emailPayload);

      return this.createResult(
        true,
        (result as any)?.messageId || "email-sent",
        undefined,
        {
          provider: "payload-resend",
          timestamp: new Date().toISOString(),
          to: emailPayload.to,
        }
      );
    } catch (error) {
      console.error("Payload email service error:", error);
      return this.createResult(
        false,
        undefined,
        error instanceof Error ? error.message : "Email sending failed"
      );
    }
  }

  private getStatusUpdateSubject(
    status: string,
    confirmationNumber: string
  ): string {
    const statusMessages = {
      confirmed: "Booking Confirmed",
      cancelled: "Booking Cancelled",
      completed: "Booking Completed",
      no_show: "Booking Update - No Show",
      pending: "Booking Pending",
    };

    const message =
      statusMessages[status as keyof typeof statusMessages] || "Booking Update";
    return `${message} - ${confirmationNumber}`;
  }
}
