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
import { EnquiryData } from "@/services/notifications/channels/base";

interface EnquiryNotificationTemplateProps extends EnquiryData {}

export const EnquiryNotificationTemplate: React.FC<
  EnquiryNotificationTemplateProps
> = ({
  enquiryId,
  fullName,
  email,
  phone,
  selectedPackage,
  message,
  additionalMessage,
  packageInfo,
  enquirySource,
  submissionDate,
}) => {
  const previewText = `New Enquiry ${enquiryId} - Andaman Excursion`;

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

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>🏝️ Andaman Excursion</Text>
            <Text style={headerSubtitle}>New Enquiry Received</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>New Enquiry Received</Heading>

            {/* Alert Box */}
            <Section style={alertBox}>
              <Text style={alertText}>
                <strong>Enquiry ID:</strong> {enquiryId}
              </Text>
              <Text style={alertText}>
                <strong>Source:</strong> {enquirySource || "Unknown"}
              </Text>
              <Text style={alertText}>
                <strong>Submitted:</strong> {formatDate(submissionDate)}
              </Text>
            </Section>

            {/* Customer Information */}
            <Section style={infoSection}>
              <Heading style={h2}>Customer Information</Heading>
              <Text style={detailText}>
                <strong>Name:</strong> {fullName}
              </Text>
              <Text style={detailText}>
                <strong>Email:</strong> {email}
              </Text>
              <Text style={detailText}>
                <strong>Phone:</strong> {phone}
              </Text>
            </Section>

            {/* Package Information */}
            {selectedPackage && (
              <Section style={infoSection}>
                <Heading style={h2}>Package Information</Heading>
                <Text style={detailText}>
                  <strong>Package:</strong> {selectedPackage}
                </Text>
                {packageInfo?.price && (
                  <Text style={detailText}>
                    <strong>Price:</strong> ₹
                    {packageInfo.price.toLocaleString()}
                  </Text>
                )}
                {packageInfo?.period && (
                  <Text style={detailText}>
                    <strong>Duration:</strong> {packageInfo.period}
                  </Text>
                )}
              </Section>
            )}

            {/* Customer Message */}
            {message && (
              <Section style={infoSection}>
                <Heading style={h2}>Customer Message</Heading>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}

            {/* Additional Message */}
            {additionalMessage && (
              <Section style={infoSection}>
                <Heading style={h2}>Additional Message</Heading>
                <Text style={messageText}>{additionalMessage}</Text>
              </Section>
            )}

            {/* Action Button */}
            <Section style={buttonSection}>
              <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_URL}/admin/collections/enquiries/${enquiryId}`}
              >
                View in Admin Panel
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated notification for enquiry {enquiryId}.
            </Text>
            <Text style={footerSubtext}>
              Please respond to the customer within 24 hours.
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
  backgroundColor: "#e53e3e", // --color-alert-error (urgent notification)
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
  color: "#f9e2e2", // --color-alert-error-light
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

const alertBox = {
  backgroundColor: "#f9e2e2", // --color-alert-error-light
  borderLeft: "4px solid #e53e3e", // 4px solid --color-alert-error
  padding: "20px", // --space-5
  margin: "24px 0", // --space-6 0
  borderRadius: "0 8px 8px 0", // 0 --radius-sm --radius-sm 0
};

const alertText = {
  color: "#e53e3e", // --color-alert-error
  fontSize: "16px", // --font-size-base
  fontWeight: "600",
  margin: "0 0 8px", // 0 0 --space-2
};

const infoSection = {
  margin: "24px 0", // --space-6 0
  backgroundColor: "#f5f9ff", // --color-gray-50
  padding: "20px", // --space-5
  borderRadius: "12px", // --radius-base
  border: "1px solid #e0e0e0", // 1px solid --color-gray-300
};

const detailText = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "16px", // --font-size-base
  margin: "0 0 8px", // 0 0 --space-2
};

const messageText = {
  backgroundColor: "#ffffff", // --color-white
  padding: "20px", // --space-5
  borderRadius: "8px", // --radius-sm
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "16px", // --font-size-base
  margin: "0",
  border: "1px solid #e0e0e0", // 1px solid --color-gray-300
  fontStyle: "italic",
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

export default EnquiryNotificationTemplate;
