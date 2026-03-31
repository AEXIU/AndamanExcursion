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
  Row,
  Column,
} from "@react-email/components";
import type { BookingConfirmationData } from "@/services/notifications/channels/base";

interface BookingEmailTemplateProps extends BookingConfirmationData {}

export const BookingEmailTemplate: React.FC<BookingEmailTemplateProps> = ({
  confirmationNumber,
  customerName,
  bookingDate,
  serviceDate,
  totalAmount,
  currency = "INR",
  bookingType,
  items,
  passengers,
  specialRequests,
  contactPhone,
  bookingId,
}) => {
  const previewText = `Your booking ${confirmationNumber} is confirmed! Andaman Excursion`;

  const formatCurrency = (amount: number, curr: string) => {
    if (curr === "INR") {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `${curr} ${amount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case "ferry":
        return "🚢 Ferry Booking";
      case "activity":
        return "🏝️ Activity Booking";
      case "mixed":
        return "🎯 Combined Booking";
      default:
        return "📅 Booking";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>🏝️ Andaman Excursion</Text>
            <Text style={headerSubtitle}>Your Adventure Awaits!</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Booking Confirmed! 🎉</Heading>

            <Text style={text}>Dear {customerName},</Text>

            <Text style={text}>
              Great news! Your booking has been confirmed. We're excited to be
              part of your Andaman adventure!
            </Text>

            {/* Booking Summary Card */}
            <Section style={bookingCard}>
              <Text style={bookingCardTitle}>
                {getBookingTypeLabel(bookingType)}
              </Text>

              <Row style={bookingDetails}>
                <Column style={detailColumn}>
                  <Text style={detailLabel}>Confirmation Number</Text>
                  <Text style={detailValue}>{confirmationNumber}</Text>
                </Column>
                <Column style={detailColumn}>
                  <Text style={detailLabel}>Booking Date</Text>
                  <Text style={detailValue}>{formatDate(bookingDate)}</Text>
                </Column>
              </Row>

              {serviceDate && (
                <Row style={bookingDetails}>
                  <Column style={detailColumn}>
                    <Text style={detailLabel}>Service Date</Text>
                    <Text style={detailValue}>{formatDate(serviceDate)}</Text>
                  </Column>
                  <Column style={detailColumn}>
                    <Text style={detailLabel}>Total Amount</Text>
                    <Text style={detailValueAmount}>
                      {formatCurrency(totalAmount, currency)}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Items/Services Booked */}
            <Section style={itemsSection}>
              <Heading style={h2}>Your Bookings</Heading>
              {items.map((item, index) => (
                <Section key={index} style={itemCard}>
                  <Text style={itemTitle}>{item.title}</Text>
                  <Text style={itemDetails}>
                    📅 {formatDate(item.date)} • 🕒 {item.time}
                  </Text>
                  {item.location && (
                    <Text style={itemDetails}>📍 {item.location}</Text>
                  )}
                  {item.passengers && (
                    <Text style={itemDetails}>
                      👥 {item.passengers} passengers
                    </Text>
                  )}
                </Section>
              ))}
            </Section>

            {/* Passenger Information */}
            {passengers && passengers.length > 0 && (
              <Section style={passengersSection}>
                <Heading style={h2}>Passenger Details</Heading>
                {passengers.map((passenger, index) => (
                  <Text key={index} style={passengerItem}>
                    {index + 1}. {passenger.fullName} ({passenger.age} years,{" "}
                    {passenger.gender || "N/A"})
                  </Text>
                ))}
              </Section>
            )}

            {/* Special Requests */}
            {specialRequests && (
              <Section style={specialRequestsSection}>
                <Heading style={h2}>Special Requests</Heading>
                <Text style={specialRequestsText}>{specialRequests}</Text>
              </Section>
            )}

            {/* Contact Information */}
            <Section style={contactSection}>
              <Heading style={h2}>Contact Information</Heading>
              <Text style={text}>
                📞 Phone: {contactPhone || "+91-XXXXX-XXXXX"}
              </Text>
              <Text style={text}>📧 Email: booking@andamanexcursion.com</Text>
              <Text style={text}>
                🕒 Support Hours: 9:00 AM - 8:00 PM (IST)
              </Text>
            </Section>

            {/* Important Information */}
            <Section style={importantInfoSection}>
              <Heading style={h2}>Important Information</Heading>
              <Text style={text}>
                • Please carry a valid government ID and this confirmation
              </Text>
              <Text style={text}>
                • Arrive at the departure point 30 minutes early
              </Text>
              <Text style={text}>
                • Check weather conditions before departure
              </Text>
              <Text style={text}>
                • Contact us immediately for any changes or cancellations
              </Text>
            </Section>

            {/* Action Button */}
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
            <Text style={footerText}>
              We're here to make your Andaman experience unforgettable.
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
  backgroundColor: "#3e8cff", // --color-primary
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
  color: "#e6f0ff", // --color-primary-light
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

const bookingCard = {
  backgroundColor: "#ebf3ff", // --color-gray-100
  border: "2px solid #3e8cff", // 2px solid --color-primary
  borderRadius: "16px", // --radius-md
  padding: "24px", // --space-6
  margin: "24px 0", // --space-6 0
};

const bookingCardTitle = {
  color: "#3e8cff", // --color-primary
  fontSize: "24px", // --font-size-2xl
  fontWeight: "bold",
  margin: "0 0 16px", // 0 0 --space-4
  textAlign: "center" as const,
};

const bookingDetails = {
  margin: "8px 0", // --space-2 0
};

const detailColumn = {
  width: "50%",
  paddingRight: "16px", // --space-4
};

const detailLabel = {
  color: "#9b9b9b", // --color-text-disabled
  fontSize: "14px", // --font-size-xs
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  margin: "0 0 4px", // 0 0 --space-1
};

const detailValue = {
  color: "#000e0f", // --color-text-primary
  fontSize: "18px", // --font-size-lg
  fontWeight: "bold",
  margin: "0",
};

const detailValueAmount = {
  color: "#3e8cff", // --color-primary
  fontSize: "20px", // --font-size-xl
  fontWeight: "bold",
  margin: "0",
};

const itemsSection = {
  margin: "32px 0", // --space-8 0
};

const itemCard = {
  backgroundColor: "#f5f9ff", // --color-gray-50
  border: "1px solid #e0e0e0", // 1px solid --color-gray-300
  borderRadius: "12px", // --radius-base
  padding: "16px", // --space-4
  margin: "8px 0", // --space-2 0
};

const itemTitle = {
  color: "#000e0f", // --color-text-primary
  fontSize: "18px", // --font-size-lg
  fontWeight: "bold",
  margin: "0 0 8px", // 0 0 --space-2
};

const itemDetails = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "16px", // --font-size-base
  margin: "0 0 4px", // 0 0 --space-1
};

const passengersSection = {
  margin: "32px 0", // --space-8 0
};

const passengerItem = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "16px", // --font-size-base
  margin: "0 0 8px", // 0 0 --space-2
  paddingLeft: "8px", // --space-2
};

const specialRequestsSection = {
  margin: "32px 0", // --space-8 0
};

const specialRequestsText = {
  backgroundColor: "#fff3e0", // Similar to --color-alert-warning-light
  border: "1px solid #ff9500", // 1px solid --color-alert-warning
  borderRadius: "8px", // --radius-sm
  padding: "16px", // --space-4
  color: "#856404",
  fontSize: "16px", // --font-size-base
  fontStyle: "italic" as const,
  margin: "0",
};

const contactSection = {
  margin: "32px 0", // --space-8 0
  backgroundColor: "#e6f0ff", // --color-primary-light
  padding: "20px", // --space-5
  borderRadius: "12px", // --radius-base
};

const importantInfoSection = {
  margin: "32px 0", // --space-8 0
  backgroundColor: "#f9e2e2", // --color-alert-error-light
  border: "1px solid #e53e3e", // 1px solid --color-alert-error
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

export default BookingEmailTemplate;
