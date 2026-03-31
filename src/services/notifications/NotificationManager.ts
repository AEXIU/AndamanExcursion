/**
 * Unified Notification Manager
 * Orchestrates multiple notification channels (email, WhatsApp, SMS, etc.)
 * Provides a scalable, unified interface for sending notifications across all channels
 */

import {
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
  NotificationType,
  NotificationOptions,
  BookingConfirmationData,
  BookingStatusUpdateData,
  PaymentFailedData,
  EnquiryData,
  BulkNotificationData,
} from "./channels/base";

import { EmailNotificationChannel } from "./channels/email";
import { WhatsAppNotificationChannel } from "./channels/whatsapp";

export interface NotificationPreferences {
  sendEmailUpdates: boolean;
  sendWhatsAppUpdates: boolean;
  language: "en" | "hi";
}

export interface MultiChannelResult {
  email?: NotificationResult;
  whatsapp?: NotificationResult;
  sms?: NotificationResult;
}

export interface NotificationRequest<T = any> {
  type: NotificationType;
  recipients: {
    email?: string;
    phone?: string;
  };
  data: T;
  preferences?: NotificationPreferences;
  options?: NotificationOptions;
}

/**
 * Main NotificationManager class
 * Provides unified interface for all notification channels
 */
export class NotificationManager {
  private channels: Map<string, NotificationChannel> = new Map();

  constructor() {
    this.initializeChannels();
  }

  private initializeChannels(): void {
    // Initialize all available channels
    const emailChannel = new EmailNotificationChannel();
    const whatsappChannel = new WhatsAppNotificationChannel();

    this.channels.set(emailChannel.name, emailChannel);
    this.channels.set(whatsappChannel.name, whatsappChannel);

    // Future channels can be added here:
    // const smsChannel = new SMSNotificationChannel();
    // this.channels.set(smsChannel.name, smsChannel);
  }

  /**
   * Send notification to multiple channels based on preferences
   */
  async sendNotification<T>(
    request: NotificationRequest<T>
  ): Promise<MultiChannelResult> {
    const results: MultiChannelResult = {};
    const { type, recipients, data, preferences, options } = request;

    // Default preferences if not provided
    const prefs = preferences ?? {
      sendEmailUpdates: true,
      sendWhatsAppUpdates: false,
      language: "en" as const,
    };

    // Send email notification
    if (recipients.email && prefs.sendEmailUpdates) {
      const emailChannel = this.channels.get("email");
      if (emailChannel?.isEnabled()) {
        results.email = await emailChannel.send({
          type,
          recipient: recipients.email,
          data,
          options,
        });
      } else {
        results.email = {
          success: false,
          error: "Email channel not available",
        };
      }
    }

    // Send WhatsApp notification
    if (recipients.phone && prefs.sendWhatsAppUpdates) {
      const whatsappChannel = this.channels.get("whatsapp");
      if (whatsappChannel?.isEnabled()) {
        results.whatsapp = await whatsappChannel.send({
          type,
          recipient: recipients.phone,
          data,
          options,
        });
      } else {
        results.whatsapp = {
          success: false,
          error: "WhatsApp channel not available",
        };
      }
    }

    // Log results for monitoring
    this.logNotificationResults(type, results);

    return results;
  }

  /**
   * Send booking confirmation to all enabled channels
   */
  async sendBookingConfirmation(
    bookingData: BookingConfirmationData,
    recipients: { email?: string; phone?: string },
    preferences?: NotificationPreferences
  ): Promise<MultiChannelResult> {
    return this.sendNotification({
      type: "booking_confirmation",
      recipients,
      data: bookingData,
      preferences,
      options: {
        priority: "high",
        metadata: { bookingId: bookingData.bookingId },
      },
    });
  }

  /**
   * Send booking status update to all enabled channels
   */
  async sendBookingStatusUpdate(
    updateData: BookingStatusUpdateData,
    recipients: { email?: string; phone?: string },
    preferences?: NotificationPreferences,
    customMessage?: string
  ): Promise<MultiChannelResult> {
    const dataWithMessage = {
      ...updateData,
      message: customMessage || updateData.message,
    };

    return this.sendNotification({
      type: "booking_status_update",
      recipients,
      data: dataWithMessage,
      preferences,
      options: {
        priority: "normal",
        metadata: {
          bookingId: updateData.bookingId,
          statusChange: `${updateData.oldStatus}->${updateData.newStatus}`,
        },
      },
    });
  }

  /**
   * Send booking reminder to all enabled channels
   */
  async sendBookingReminder(
    bookingData: BookingStatusUpdateData,
    recipients: { email?: string; phone?: string },
    preferences?: NotificationPreferences
  ): Promise<MultiChannelResult> {
    const reminderData = {
      ...bookingData,
      message:
        "This is a friendly reminder about your upcoming booking. Please arrive 30 minutes early and bring a valid ID.",
    };

    return this.sendNotification({
      type: "booking_reminder",
      recipients,
      data: reminderData,
      preferences,
      options: {
        priority: "normal",
        metadata: { bookingId: bookingData.bookingId },
      },
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedNotification(
    paymentData: PaymentFailedData,
    preferences?: NotificationPreferences
  ): Promise<MultiChannelResult> {
    return this.sendNotification({
      type: "payment_failed",
      recipients: { 
        email: paymentData.customerEmail,
        phone: paymentData.customerPhone
      },
      data: paymentData,
      preferences,
      options: {
        priority: "high",
        metadata: { amount: paymentData.attemptedAmount },
      },
    });
  }

  /**
   * Send enquiry confirmation to customer
   */
  async sendEnquiryConfirmation(
    enquiryData: EnquiryData,
    preferences?: NotificationPreferences
  ): Promise<MultiChannelResult> {
    return this.sendNotification({
      type: "enquiry_confirmation",
      recipients: {
        email: enquiryData.email,
        phone: enquiryData.phone,
      },
      data: enquiryData,
      preferences,
      options: {
        priority: "normal",
        metadata: { enquiryId: enquiryData.enquiryId },
      },
    });
  }

  /**
   * Send enquiry notification to admin
   */
  async sendEnquiryNotification(
    enquiryData: EnquiryData,
    adminEmail?: string
  ): Promise<MultiChannelResult> {
    const adminEmailAddress =
      adminEmail || process.env.ADMIN_EMAIL || "admin@andamanexcursion.com";

    return this.sendNotification({
      type: "enquiry_notification",
      recipients: { email: adminEmailAddress },
      data: enquiryData,
      preferences: {
        sendEmailUpdates: true,
        sendWhatsAppUpdates: false,
        language: "en",
      },
      options: {
        priority: "normal",
        metadata: { enquiryId: enquiryData.enquiryId },
      },
    });
  }

  /**
   * Send bulk notifications (promotional, announcements, etc.)
   */
  async sendBulkNotification(
    recipients: string[],
    subject: string,
    template: string,
    templateData: any,
    channelType: "email" | "whatsapp" | "both" = "email"
  ): Promise<{
    success: boolean;
    results: NotificationResult[];
    errors: string[];
  }> {
    const results: NotificationResult[] = [];
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        if (channelType === "email" || channelType === "both") {
          const emailChannel = this.channels.get("email");
          if (emailChannel?.isEnabled()) {
            const result = await emailChannel.send({
              type: "bulk_notification",
              recipient,
              data: { subject, template, templateData },
              options: {
                priority: "low",
                metadata: { bulkSend: true },
              },
            });
            results.push(result);

            if (!result.success) {
              errors.push(`${recipient}: ${result.error}`);
            }
          }
        }

        // Add WhatsApp bulk sending when implemented
        if (channelType === "whatsapp" || channelType === "both") {
          // TODO: Implement WhatsApp bulk sending
          errors.push(
            `${recipient}: WhatsApp bulk sending not implemented yet`
          );
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`${recipient}: ${errorMsg}`);
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
    };
  }

  /**
   * Test all notification channels
   */
  async testAllChannels(): Promise<MultiChannelResult> {
    const results: MultiChannelResult = {};

    // Test email channel
    const emailChannel = this.channels.get("email");
    if (emailChannel) {
      results.email = (await emailChannel.test?.()) || {
        success: false,
        error: "Test method not available",
      };
    }

    // Test WhatsApp channel
    const whatsappChannel = this.channels.get("whatsapp");
    if (whatsappChannel) {
      results.whatsapp = (await whatsappChannel.test?.()) || {
        success: false,
        error: "Test method not available",
      };
    }

    return results;
  }

  /**
   * Get status of all channels
   */
  getChannelStatus(): Record<string, { enabled: boolean; name: string }> {
    const status: Record<string, { enabled: boolean; name: string }> = {};

    for (const [key, channel] of this.channels) {
      status[key] = {
        enabled: channel.isEnabled(),
        name: channel.name,
      };
    }

    return status;
  }

  /**
   * Get a specific channel for direct access
   */
  getChannel(channelName: string): NotificationChannel | undefined {
    return this.channels.get(channelName);
  }

  /**
   * Add a new notification channel
   */
  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.name, channel);
  }

  /**
   * Remove a notification channel
   */
  removeChannel(channelName: string): boolean {
    return this.channels.delete(channelName);
  }

  private logNotificationResults(
    type: NotificationType,
    results: MultiChannelResult
  ): void {
    const logData = {
      type,
      timestamp: new Date().toISOString(),
      results: {
        email: results.email
          ? {
              success: results.email.success,
              messageId: results.email.messageId,
            }
          : null,
        whatsapp: results.whatsapp
          ? {
              success: results.whatsapp.success,
              messageId: results.whatsapp.messageId,
            }
          : null,
      },
    };

    console.log("[NotificationManager]", JSON.stringify(logData, null, 2));

    // Log errors separately for monitoring
    if (results.email && !results.email.success) {
      console.error(
        `[NotificationManager] Email error for ${type}:`,
        results.email.error
      );
    }
    if (results.whatsapp && !results.whatsapp.success) {
      console.error(
        `[NotificationManager] WhatsApp error for ${type}:`,
        results.whatsapp.error
      );
    }
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
export default notificationManager;
