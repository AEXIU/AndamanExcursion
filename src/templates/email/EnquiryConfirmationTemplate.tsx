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

interface EnquiryConfirmationTemplateProps extends EnquiryData {}

export const EnquiryConfirmationTemplate: React.FC<
  EnquiryConfirmationTemplateProps
> = ({
  enquiryId,
  fullName,
  email,
  phone,
  selectedPackage,
  message,
  packageInfo,
  enquirySource,
  submissionDate,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const previewText = `Thank you for your enquiry ${enquiryId} - Andaman Excursion`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>🏝️ Andaman Excursion</Text>
            <Text style={headerSubtitle}>Thank You for Your Enquiry!</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Thank You for Your Enquiry!</Heading>

            <Text style={text}>Dear {fullName},</Text>

            <Text style={text}>
              We have received your enquiry and will respond within 24 hours.
              Here are the details:
            </Text>

            {/* Enquiry Details Card */}
            <Section style={enquiryCard}>
              <Text style={enquiryCardTitle}>Enquiry Details</Text>

              <Text style={detailText}>
                <strong>Enquiry ID:</strong> {enquiryId}
              </Text>
              <Text style={detailText}>
                <strong>Submission Date:</strong> {formatDate(submissionDate)}
              </Text>
              {selectedPackage && (
                <Text style={detailText}>
                  <strong>Package:</strong> {selectedPackage}
                </Text>
              )}
              {packageInfo?.price && (
                <Text style={detailText}>
                  <strong>Price:</strong> ₹{packageInfo.price.toLocaleString()}
                </Text>
              )}
              {packageInfo?.period && (
                <Text style={detailText}>
                  <strong>Duration:</strong> {packageInfo.period}
                </Text>
              )}
            </Section>

            {/* Customer Message */}
            {message && (
              <Section style={messageSection}>
                <Heading style={h2}>Your Message</Heading>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}

            <Text style={text}>
              Our team will review your enquiry and get back to you soon with a
              detailed quote and itinerary.
            </Text>

            <Text style={text}>
              Best regards,
              <br />
              The Andaman Excursion Team
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              If you have any immediate questions, please contact us at:
            </Text>
            <Text style={footerText}>📞 +91-XXXX-XXXX-XX</Text>
            <Text style={footerText}>📧 info@andamanexcursion.com</Text>
            <Text style={footerSubtext}>
              This email was sent regarding enquiry {enquiryId}. If you have any
              questions, please contact our support team.
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
  backgroundColor: "#002cba", // --color-tertiary
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

const enquiryCard = {
  backgroundColor: "#ebf3ff", // --color-gray-100
  padding: "24px", // --space-6
  borderRadius: "16px", // --radius-md
  border: "2px solid #002cba", // 2px solid --color-tertiary
  margin: "24px 0", // --space-6 0
};

const enquiryCardTitle = {
  color: "#002cba", // --color-tertiary
  fontSize: "24px", // --font-size-2xl
  fontWeight: "bold",
  margin: "0 0 16px", // 0 0 --space-4
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
  fontStyle: "italic" as const,
  margin: "0",
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

export default EnquiryConfirmationTemplate;
