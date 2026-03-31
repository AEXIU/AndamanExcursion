/**
 * Base notification channel interface and types
 * Provides a unified structure for all notification channels (email, WhatsApp, SMS, etc.)
 */

export interface NotificationChannel {
  name: string;
  isEnabled(): boolean;
  send<T>(payload: NotificationPayload<T>): Promise<NotificationResult>;
  test?(): Promise<NotificationResult>;
}

export interface NotificationPayload<T = any> {
  type: NotificationType;
  recipient: string;
  data: T;
  options?: NotificationOptions;
}

export interface NotificationOptions {
  priority?: "low" | "normal" | "high" | "urgent";
  retryCount?: number;
  delay?: number;
  headers?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export type NotificationType =
  | "booking_confirmation"
  | "booking_status_update"
  | "booking_reminder"
  | "payment_failed"
  | "enquiry_confirmation"
  | "enquiry_notification"
  | "bulk_notification"
  | "test";

export abstract class BaseNotificationChannel implements NotificationChannel {
  abstract name: string;

  abstract isEnabled(): boolean;

  abstract send<T>(
    payload: NotificationPayload<T>
  ): Promise<NotificationResult>;

  async test(): Promise<NotificationResult> {
    return { success: false, error: "Test method not implemented" };
  }

  protected createResult(
    success: boolean,
    messageId?: string,
    error?: string,
    metadata?: Record<string, any>
  ): NotificationResult {
    return { success, messageId, error, metadata };
  }

  protected validateRecipient(recipient: string): boolean {
    return !!(recipient && recipient.trim().length > 0);
  }
}

/**
 * Template data interfaces for different notification types
 */
export interface BookingConfirmationData {
  bookingId: string;
  confirmationNumber: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  serviceDate?: string;
  totalAmount: number;
  currency: string;
  bookingType: "ferry" | "activity" | "mixed";
  items: Array<{
    title: string;
    date: string;
    time: string;
    location?: string;
    passengers?: number;
    seatClass?: string;
    arrivalTime?: string;
  }>;
  passengers?: Array<{
    fullName: string;
    age: number;
    gender?: string;
  }>;
  specialRequests?: string;
  contactPhone?: string;
}

export interface BookingStatusUpdateData {
  bookingId: string;
  confirmationNumber: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  message?: string;
  updateDate: string;
}

export interface PaymentFailedData {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  attemptedAmount: number;
  failureReason?: string;
  bookingType?: "ferry" | "activity" | "mixed";
  currency: string;
}

export interface EnquiryData {
  enquiryId: string;
  fullName: string;
  email: string;
  phone: string;
  selectedPackage?: string;
  message?: string;
  additionalMessage?: string;
  packageInfo?: {
    title?: string;
    price?: number;
    period?: string;
  };
  enquirySource?: "search" | "other" | "package-detail" | "direct";
  submissionDate: string;
}

export interface BulkNotificationData {
  recipients: string[];
  subject: string;
  template: string;
  templateData: any;
}

/**
 * Channel-specific configurations
 */
export interface ChannelConfig {
  email?: {
    fromAddress?: string;
    fromName?: string;
    replyTo?: string;
  };
  whatsapp?: {
    accountId?: string;
    fromNumber?: string;
  };
  sms?: {
    fromNumber?: string;
    provider?: "twilio" | "aws_sns" | "other";
  };
}
