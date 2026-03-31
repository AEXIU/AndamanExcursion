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

interface PaymentFailedTemplateProps {
  customerEmail: string;
  customerName: string;
  attemptedAmount: number;
  failureReason?: string;
  bookingType?: string;
  currency?: string;
}

export const PaymentFailedTemplate: React.FC<PaymentFailedTemplateProps> = ({
  customerName,
  attemptedAmount,
  failureReason,
  bookingType = "booking",
  currency = "INR",
}) => {
  const previewText = `Payment failed for your ${bookingType} - Andaman Excursion`;

  const formatCurrency = (amount: number, curr: string) => {
    if (curr === "INR") {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `${curr} ${amount}`;
  };

  const getCommonFailureReasons = (reason?: string) => {
    const commonReasons = [
      {
        title: "Insufficient Balance",
        description: "Your account may not have enough funds",
        solution: "Check your account balance and try again",
      },
      {
        title: "Card Expired",
        description: "Your payment card may have expired",
        solution: "Update your card details and retry payment",
      },
      {
        title: "Network Issue",
        description: "Connection was lost during payment",
        solution: "Check your internet connection and try again",
      },
      {
        title: "Bank Declined",
        description: "Your bank declined the transaction",
        solution: "Contact your bank or try a different payment method",
      },
    ];

    return commonReasons;
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
            <Text style={headerSubtitle}>Payment Issue</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Payment Failed ❌</Heading>

            <Text style={text}>Dear {customerName},</Text>

            <Text style={text}>
              We're sorry, but your payment was not successful. Don't worry -
              your booking hasn't been lost, and you can easily retry your
              payment.
            </Text>

            {/* Payment Failure Card */}
            <Section style={failureCard}>
              <Text style={failureEmoji}>💳</Text>
              <Text style={failureTitle}>Payment Processing Failed</Text>
              <Text style={failureAmount}>
                Amount: {formatCurrency(attemptedAmount, currency)}
              </Text>

              {failureReason && (
                <Section style={reasonSection}>
                  <Text style={reasonTitle}>Reason:</Text>
                  <Text style={reasonText}>{failureReason}</Text>
                </Section>
              )}
            </Section>

            {/* What You Can Do */}
            <Section style={solutionSection}>
              <Heading style={h2}>What You Can Do</Heading>

              {/* Retry Payment Button */}
              <Section style={buttonSection}>
                <Button
                  style={retryButton}
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/checkout/retry`}
                >
                  Retry Payment
                </Button>
              </Section>

              <Text style={text}>
                <strong>Or try these solutions:</strong>
              </Text>

              {getCommonFailureReasons().map((reason, index) => (
                <Section key={index} style={reasonCard}>
                  <Text style={reasonCardTitle}>{reason.title}</Text>
                  <Text style={reasonCardDescription}>
                    {reason.description}
                  </Text>
                  <Text style={reasonCardSolution}>💡 {reason.solution}</Text>
                </Section>
              ))}
            </Section>

            {/* Alternative Payment Methods */}
            <Section style={paymentMethodsSection}>
              <Heading style={h2}>Alternative Payment Methods</Heading>
              <Text style={text}>
                If you continue to experience issues, try these payment options:
              </Text>

              <Section style={methodsList}>
                <Text style={methodItem}>💳 Different Credit/Debit Card</Text>
                <Text style={methodItem}>🏦 Net Banking</Text>
                <Text style={methodItem}>📱 UPI Payment</Text>
                <Text style={methodItem}>
                  💰 Digital Wallets (Paytm, PhonePe, etc.)
                </Text>
              </Section>
            </Section>

            {/* Booking Assistance */}
            <Section style={assistanceSection}>
              <Heading style={h2}>Need Assistance?</Heading>
              <Text style={text}>
                Our booking team is here to help you complete your reservation:
              </Text>

              <Text style={contactText}>
                📞 Call us at: <strong>+91-XXXXX-XXXXX</strong>
              </Text>
              <Text style={contactText}>
                📧 Email us: <strong>support@andamanexcursion.com</strong>
              </Text>
              <Text style={contactText}>
                💬 WhatsApp: <strong>+91-XXXXX-XXXXX</strong>
              </Text>
              <Text style={contactText}>
                🕒 Available: <strong>9:00 AM - 8:00 PM (IST)</strong>
              </Text>
            </Section>

            {/* Important Note */}
            <Section style={noteSection}>
              <Text style={noteTitle}>📌 Important Note</Text>
              <Text style={noteText}>
                • Your booking details have been saved securely
              </Text>
              <Text style={noteText}>
                • No amount has been charged to your account
              </Text>
              <Text style={noteText}>
                • You can retry payment within 24 hours to secure the same rates
              </Text>
              <Text style={noteText}>
                • Our team can help you complete the booking over the phone
              </Text>
            </Section>

            {/* Security Notice */}
            <Section style={securitySection}>
              <Text style={securityTitle}>
                🔐 Your Security is Our Priority
              </Text>
              <Text style={text}>
                All payment information is processed securely through encrypted
                connections. We never store your complete card details on our
                servers.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Don't give up on your Andaman adventure! 🌴
            </Text>
            <Text style={footerText}>
              We're here to help you complete your booking successfully.
            </Text>
            <Text style={footerSubtext}>
              If you need immediate assistance, please contact our support team.
              We're committed to making your booking experience smooth and
              secure.
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
  backgroundColor: "#e53e3e", // --color-alert-error
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

const text = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "18px", // --font-size-lg (body-base)
  lineHeight: "24px",
  margin: "0 0 16px", // 0 0 --space-4
};

const failureCard = {
  backgroundColor: "#f9e2e2", // --color-alert-error-light
  border: "2px solid #e53e3e", // 2px solid --color-alert-error
  borderRadius: "16px", // --radius-md
  padding: "48px 24px", // --space-12 --space-6
  margin: "32px 0", // --space-8 0
  textAlign: "center" as const,
};

const failureEmoji = {
  fontSize: "56px", // Larger for better visual impact
  margin: "0 0 16px", // 0 0 --space-4
  display: "block",
};

const failureTitle = {
  color: "#e53e3e", // --color-alert-error
  fontSize: "28px", // --font-size-4xl - 12px for better fit
  fontWeight: "bold",
  margin: "0 0 12px", // 0 0 --space-3
};

const failureAmount = {
  color: "#991b1b", // Darker red for contrast
  fontSize: "24px", // --font-size-2xl
  fontWeight: "bold",
  margin: "0 0 16px", // 0 0 --space-4
};

const reasonSection = {
  backgroundColor: "#ffffff", // --color-white
  border: "1px solid #e53e3e", // 1px solid --color-alert-error
  borderRadius: "12px", // --radius-base
  padding: "16px", // --space-4
  margin: "16px 0 0", // --space-4 0 0
  textAlign: "left" as const,
};

const reasonTitle = {
  color: "#e53e3e", // --color-alert-error
  fontSize: "16px", // --font-size-base
  fontWeight: "bold",
  margin: "0 0 4px", // 0 0 --space-1
};

const reasonText = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "16px", // --font-size-base
  margin: "0",
};

const solutionSection = {
  margin: "32px 0", // --space-8 0
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0", // --space-6 0
};

const retryButton = {
  backgroundColor: "#00c851", // --color-alert-success
  borderRadius: "8px", // --radius-button
  color: "#ffffff", // --color-text-inverse
  fontSize: "18px", // --font-size-lg
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "16px 0", // --space-4 0
  margin: "0 auto",
  transition: "background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)", // --duration-fast --easing-standard
};

const reasonCard = {
  backgroundColor: "#f5f9ff", // --color-gray-50
  border: "1px solid #e0e0e0", // 1px solid --color-gray-300
  borderRadius: "12px", // --radius-base
  padding: "16px", // --space-4
  margin: "12px 0", // --space-3 0
};

const reasonCardTitle = {
  color: "#000e0f", // --color-text-primary
  fontSize: "18px", // --font-size-lg
  fontWeight: "bold",
  margin: "0 0 8px", // 0 0 --space-2
};

const reasonCardDescription = {
  color: "#5f5f5f", // --color-text-secondary
  fontSize: "16px", // --font-size-base
  margin: "0 0 8px", // 0 0 --space-2
};

const reasonCardSolution = {
  color: "#3e8cff", // --color-primary
  fontSize: "16px", // --font-size-base
  fontWeight: "500",
  margin: "0",
};

const paymentMethodsSection = {
  margin: "32px 0", // --space-8 0
  backgroundColor: "#e6f0ff", // --color-primary-light
  padding: "24px", // --space-6
  borderRadius: "16px", // --radius-md
  border: "2px solid #3e8cff", // 2px solid --color-primary
};

const methodsList = {
  margin: "16px 0", // --space-4 0
};

const methodItem = {
  color: "#002cba", // --color-tertiary
  fontSize: "16px", // --font-size-base
  margin: "0 0 8px", // 0 0 --space-2
  paddingLeft: "8px", // --space-2
};

const assistanceSection = {
  margin: "32px 0", // --space-8 0
  backgroundColor: "#e8f5e9", // --color-alert-success-light
  padding: "24px", // --space-6
  borderRadius: "16px", // --radius-md
  border: "2px solid #00c851", // 2px solid --color-alert-success
};

const contactText = {
  color: "#15803d", // Darker green for better contrast
  fontSize: "16px", // --font-size-base
  margin: "0 0 8px", // 0 0 --space-2
};

const noteSection = {
  margin: "32px 0", // --space-8 0
  backgroundColor: "#fff3e0", // --color-alert-warning-light
  border: "2px solid #ff9500", // 2px solid --color-alert-warning
  borderRadius: "16px", // --radius-md
  padding: "24px", // --space-6
};

const noteTitle = {
  color: "#92400e", // Darker orange for better contrast
  fontSize: "20px", // --font-size-xl
  fontWeight: "bold",
  margin: "0 0 12px", // 0 0 --space-3
};

const noteText = {
  color: "#92400e",
  fontSize: "16px", // --font-size-base
  margin: "0 0 8px", // 0 0 --space-2
};

const securitySection = {
  margin: "32px 0", // --space-8 0
  backgroundColor: "#ebf3ff", // --color-gray-100
  border: "1px solid #c0c0c0", // 1px solid --color-gray-500
  borderRadius: "16px", // --radius-md
  padding: "24px", // --space-6
};

const securityTitle = {
  color: "#3e3e3e", // --color-text-tertiary
  fontSize: "20px", // --font-size-xl
  fontWeight: "bold",
  margin: "0 0 12px", // 0 0 --space-3
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

export default PaymentFailedTemplate;
