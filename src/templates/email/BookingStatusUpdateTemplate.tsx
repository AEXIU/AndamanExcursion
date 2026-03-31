import React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import type { BookingStatusUpdateData } from "@/services/notifications/channels/base";

interface BookingStatusUpdateTemplateProps extends BookingStatusUpdateData {}

export const BookingStatusUpdateTemplate: React.FC<
  BookingStatusUpdateTemplateProps
> = ({
  confirmationNumber,
  customerName,
  oldStatus,
  newStatus,
  message,
  updateDate,
  bookingId,
}) => {
  const previewText = `Your booking ${confirmationNumber} status has been updated`;

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return {
          emoji: "✅",
          color: "#00c851", // --color-alert-success
          backgroundColor: "#e8f5e9", // --color-alert-success-light
          title: "Booking Confirmed",
          description: "Your booking is now confirmed and ready to go!",
        };
      case "cancelled":
        return {
          emoji: "❌",
          color: "#e53e3e", // --color-alert-error
          backgroundColor: "#f9e2e2", // --color-alert-error-light
          title: "Booking Cancelled",
          description: "Your booking has been cancelled.",
        };
      case "completed":
        return {
          emoji: "🎉",
          color: "#3e8cff", // --color-primary
          backgroundColor: "#e6f0ff", // --color-primary-light
          title: "Booking Completed",
          description:
            "Thank you for choosing us! We hope you had an amazing experience.",
        };
      case "no_show":
        return {
          emoji: "⚠️",
          color: "#ff9500", // --color-alert-warning
          backgroundColor: "#fff3e0", // --color-alert-warning-light
          title: "No Show Recorded",
          description: "You did not show up for your scheduled booking.",
        };
      case "pending":
        return {
          emoji: "⏳",
          color: "#9b9b9b", // --color-text-disabled
          backgroundColor: "#f5f9ff", // --color-gray-50
          title: "Booking Pending",
          description: "Your booking is pending confirmation.",
        };
      default:
        return {
          emoji: "📋",
          color: "#17a2b8", // --color-alert-info
          backgroundColor: "#e0f2f7", // --color-alert-info-light
          title: "Status Updated",
          description: "Your booking status has been updated.",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusInfo = getStatusInfo(newStatus);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>🏝️ Andaman Excursion</Text>
            <Text style={headerSubtitle}>Booking Status Update</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Booking Status Update</Heading>

            <Text style={text}>Dear {customerName},</Text>

            <Text style={text}>
              We wanted to update you on the status of your booking.
            </Text>

            {/* Status Update Card */}
            <Section
              style={{
                ...statusCard,
                borderColor: statusInfo.color,
                backgroundColor: statusInfo.backgroundColor,
              }}
            >
              <Text style={statusEmoji}>{statusInfo.emoji}</Text>
              <Text style={{ ...statusTitle, color: statusInfo.color }}>
                {statusInfo.title}
              </Text>
              <Text style={statusDescription}>{statusInfo.description}</Text>

              <Section style={statusDetails}>
                <Text style={detailText}>
                  <strong>Confirmation Number:</strong> {confirmationNumber}
                </Text>
                <Text style={detailText}>
                  <strong>Updated:</strong> {formatDate(updateDate)}
                </Text>
                <Text style={detailText}>
                  <strong>Previous Status:</strong> {oldStatus}
                </Text>
                <Text style={detailText}>
                  <strong>Current Status:</strong> {newStatus}
                </Text>
              </Section>
            </Section>

            {/* Custom Message */}
            {message && (
              <Section style={messageSection}>
                <Heading style={h2}>Additional Information</Heading>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}

            {/* Status-specific Actions */}
            {newStatus === "confirmed" && (
              <Section style={actionSection}>
                <Text style={text}>
                  <strong>What's Next:</strong>
                </Text>
                <Text style={text}>• Save this confirmation email</Text>
                <Text style={text}>• Arrive 30 minutes before departure</Text>
                <Text style={text}>• Bring a valid government ID</Text>
                <Text style={text}>
                  • Check weather conditions before departure
                </Text>
              </Section>
            )}

            {newStatus === "cancelled" && (
              <Section style={actionSection}>
                <Text style={text}>
                  <strong>Cancellation Information:</strong>
                </Text>
                <Text style={text}>
                  • Refund processing time: 5-7 business days
                </Text>
                <Text style={text}>
                  • You will receive a separate email about refunds
                </Text>
                <Text style={text}>• Contact us if you need to rebook</Text>
              </Section>
            )}

            {newStatus === "completed" && (
              <Section style={actionSection}>
                <Text style={text}>
                  <strong>We'd Love Your Feedback:</strong>
                </Text>
                <Text style={text}>
                  Help us improve by sharing your experience with other
                  travelers.
                </Text>
                <Section style={buttonSection}>
                  <Button
                    style={button}
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/review/${bookingId}`}
                  >
                    Leave a Review
                  </Button>
                </Section>
              </Section>
            )}

            {/* Contact Information */}
            <Section style={contactSection}>
              <Heading style={h2}>Need Help?</Heading>
              <Text style={text}>📞 Phone: +91-XXXXX-XXXXX</Text>
              <Text style={text}>📧 Email: support@andamanexcursion.com</Text>
              <Text style={text}>
                🕒 Support Hours: 9:00 AM - 8:00 PM (IST)
              </Text>
            </Section>

            {/* View Booking Button */}
            <Section style={buttonSection}>
              <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}`}
              >
                View Booking Details
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for choosing Andaman Excursion! 🌴
            </Text>
            <Text style={footerSubtext}>
              This email was sent regarding booking {confirmationNumber}. If you
              have any questions, please contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Updated Styles using Design System Variables
const main = {
  backgroundColor: "#f5f9ff", // --color-gray-50
  fontFamily:
    "Quicksand, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif", // --font-family-primary
};

const container = {
  backgroundColor: "#ffffff", // --color-white
  margin: "0 auto",
  padding: "32px 0 48px", // --space-8 0 --space-12
  marginBottom: "64px", // --space-16
  maxWidth: "600px",
  borderRadius: "16px", // --radius-md
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // --shadow-card
};

const header = {
  backgroundColor: "#ff8a34", // --color-secondary
  borderRadius: "16px 16px 0 0", // --radius-md --radius-md 0 0
  padding: "48px 40px", // --space-12 --space-10
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff", // --color-text-inverse
  fontSize: "40px", // --font-size-4xl
  fontWeight: "bold",
  margin: "0 0 8px", // 0 0 --space-2
};

const headerSubtitle = {
  color: "#ffe6d4", // --color-orange-100
  fontSize: "18px", // --font-size-lg
  margin: "0",
};

const content = {
  padding: "40px", // --space-10
};

const h1 = {
  color: "#000e0f", // --color-text-primary
  fontSize: "32px", // --font-size-3xl
  fontWeight: "bold",
  margin: "0 0 24px", // 0 0 --space-6
  textAlign: "center" as const,
};

const h2 = {
  color: "#000e0f", // --color-text-primary
  fontSize: "24px", // --font-size-2xl
  fontWeight: "bold",
  margin: "32px 0 16px", // --space-8 0 --space-4
};

const text = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "18px", // --font-size-lg (body-base)
  lineHeight: "24px",
  margin: "0 0 16px", // 0 0 --space-4
};

const statusCard = {
  border: "2px solid",
  borderRadius: "16px", // --radius-md
  padding: "48px 24px", // --space-12 --space-6
  margin: "32px 0", // --space-8 0
  textAlign: "center" as const,
};

const statusEmoji = {
  fontSize: "56px", // Larger for better visual impact
  margin: "0 0 16px", // 0 0 --space-4
  display: "block",
};

const statusTitle = {
  fontSize: "32px", // --font-size-3xl
  fontWeight: "bold",
  margin: "0 0 12px", // 0 0 --space-3
};

const statusDescription = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "18px", // --font-size-lg
  margin: "0 0 24px", // 0 0 --space-6
};

const statusDetails = {
  backgroundColor: "#ffffff", // --color-white
  border: "1px solid #e0e0e0", // 1px solid --color-gray-300
  borderRadius: "12px", // --radius-base
  padding: "20px", // --space-5
  margin: "24px 0 0", // --space-6 0 0
  textAlign: "left" as const,
};

const detailText = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "16px", // --font-size-base
  margin: "0 0 8px", // 0 0 --space-2
};

const messageSection = {
  margin: "32px 0", // --space-8 0
};

const messageText = {
  backgroundColor: "#fff3e0", // --color-alert-warning-light
  border: "1px solid #ff9500", // 1px solid --color-alert-warning
  borderRadius: "12px", // --radius-base
  padding: "20px", // --space-5
  color: "#856404",
  fontSize: "16px", // --font-size-base
  margin: "0",
};

const actionSection = {
  margin: "32px 0", // --space-8 0
  backgroundColor: "#e6f0ff", // --color-primary-light
  padding: "24px", // --space-6
  borderRadius: "12px", // --radius-base
  border: "1px solid #3e8cff", // 1px solid --color-primary
};

const contactSection = {
  margin: "32px 0", // --space-8 0
  backgroundColor: "#e6f0ff", // --color-primary-light
  padding: "20px", // --space-5
  borderRadius: "12px", // --radius-base
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "40px 0", // --space-10 0
};

const button = {
  backgroundColor: "#3e8cff", // --color-primary
  borderRadius: "8px", // --radius-button
  color: "#ffffff", // --color-text-inverse
  fontSize: "18px", // --font-size-lg
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "240px",
  padding: "16px 0", // --space-4 0
  margin: "0 auto",
  transition: "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)", // --duration-fast --easing-standard
};

const hr = {
  borderColor: "#e0e0e0", // --color-gray-300
  margin: "24px 0", // --space-6 0
};

const footer = {
  color: "#9b9b9b", // --color-text-disabled
  fontSize: "14px", // --font-size-xs
  lineHeight: "20px",
  padding: "0 40px", // 0 --space-10
  textAlign: "center" as const,
};

const footerText = {
  margin: "0 0 8px", // 0 0 --space-2
};

const footerSubtext = {
  margin: "16px 0 0", // --space-4 0 0
  color: "#c0c0c0", // --color-gray-500
};

export default BookingStatusUpdateTemplate;
