"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { AlertDialog } from "@/components/atoms/AlertDialog";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import styles from "./page.module.css";

function PhonePeReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setBookingConfirmation, setCurrentStep } = useCheckoutStore();
  const [status, setStatus] = useState<
    "checking" | "success" | "failed" | "pending" | "payment_success_booking_failed"
  >("checking");
  const [message, setMessage] = useState("Verifying your payment...");
  const [errorDetails, setErrorDetails] = useState<{
    errorType?: string;
    requiresRefund?: boolean;
    bookingId?: string;
    transactionId?: string;
  }>({});
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 10; // Check for up to 20 seconds (10 * 2 seconds)
  
  // State for clipboard copy alert
  const [showClipboardAlert, setShowClipboardAlert] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const checkPaymentStatus = async () => {
      try {
        // Get order ID from URL params (primary) or session storage (fallback)
        // PhonePe v2 redirects with merchantOrderId in URL query params
        const merchantOrderId =
          searchParams.get("merchantOrderId") || // Primary source (from URL) - v2
          searchParams.get("merchantTransactionId") || // Alternative param name - v1 compatibility
          sessionStorage.getItem("phonepe_merchant_order_id") || // Fallback to sessionStorage
          sessionStorage.getItem("phonepe_transaction_id"); // Old session storage key

        if (!merchantOrderId) {
          console.error("❌ No merchantOrderId found", {
            urlParams: Object.fromEntries(searchParams.entries()),
            sessionStorage: {
              merchantOrderId: sessionStorage.getItem("phonepe_merchant_order_id"),
              transactionId: sessionStorage.getItem("phonepe_transaction_id"),
            }
          });
          setStatus("failed");
          setMessage(
            "Order ID not found. Please contact support if payment was deducted."
          );
          return;
        }

        console.log(
          "✅ Checking PhonePe v2 payment status:",
          merchantOrderId,
          `(Attempt ${retryCount + 1}/${MAX_RETRIES})`
        );

        // Check payment status with backend
        const response = await fetch(
          `/api/payments/phonepe/status?merchantOrderId=${merchantOrderId}`
        );

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.statusText}`);
        }

        const result = await response.json();

        console.log("PhonePe status check result:", result);
        console.log("Booking data structure:", {
          hasBooking: !!result.booking,
          bookingId: result.booking?.id,
          bookedFerries: result.booking?.bookedFerries?.length,
          bookedActivities: result.booking?.bookedActivities?.length,
          bookedBoats: result.booking?.bookedBoats?.length,
          passengers: result.booking?.passengers?.length,
        });
        
        // Log the ACTUAL activity data received
        if (result.booking?.bookedActivities?.length > 0) {
          console.log("ACTUAL bookedActivities data from API:", JSON.stringify(result.booking.bookedActivities, null, 2));
        }
        if (result.booking?.bookedFerries?.length > 0) {
          console.log("ACTUAL bookedFerries data from API:", JSON.stringify(result.booking.bookedFerries, null, 2));
        }

        // Handle different status scenarios
        // PhonePe v2 returns "SUCCESS" instead of "COMPLETED"
        if (result.success && (result.status === "SUCCESS" || result.status === "COMPLETED")) {
          // Payment successful and booking confirmed
          setStatus("success");
          setMessage("Payment successful! Redirecting to confirmation...");

          // Set booking confirmation in store with FULL booking data
          if (result.booking) {
            console.log("Setting booking confirmation:", {
              bookingId: result.booking.id,
              confirmationNumber: result.booking.confirmationNumber,
              hasProviderBooking: !!result.providerBooking,
              hasFullData: true,
            });
            
            setBookingConfirmation({
              bookingId: result.booking.id,
              confirmationNumber: result.booking.confirmationNumber || result.booking.id,
              bookingDate: result.booking.createdAt || new Date().toISOString(),
              status: result.booking.status || "confirmed",
              paymentStatus: "paid",
              successMessage: result.message,
              providerBooking: result.providerBooking,
              fullBookingData: result.booking, // Store ENTIRE booking object
            });
            
            console.log("Stored full booking data:", {
              bookedFerries: result.booking.bookedFerries?.length,
              bookedActivities: result.booking.bookedActivities?.length,
              passengers: result.booking.passengers?.length,
            });
          }

          // Clean up session storage (both v1 and v2 keys)
          sessionStorage.removeItem("phonepe_merchant_order_id");
          sessionStorage.removeItem("phonepe_transaction_id");
          sessionStorage.removeItem("phonepe_booking_data");
          sessionStorage.removeItem("phonepe_order_id");

          // Redirect to confirmation step
          setTimeout(() => {
            router.push("/checkout?step=3");
          }, 2000);
        } else if (!result.success && (result.status === "SUCCESS" || result.status === "COMPLETED")) {
          // Payment succeeded but booking failed (critical edge case)
          console.error("⚠️ POST-PAYMENT BOOKING FAILURE:", {
            errorType: result.errorType,
            requiresRefund: result.requiresRefund,
            transactionId: result.transactionId,
            bookingId: result.booking?.id,
          });

          setStatus("payment_success_booking_failed");
          setMessage(result.message || "Payment successful but booking needs processing");
          setErrorDetails({
            errorType: result.errorType,
            requiresRefund: result.requiresRefund,
            bookingId: result.booking?.id || result.transactionId,
            transactionId: result.transactionId,
          });

          // Clean up session storage
          sessionStorage.removeItem("phonepe_transaction_id");
          sessionStorage.removeItem("phonepe_booking_data");

          // Don't auto-redirect - let user read the message
        } else if (result.status === "FAILED") {
          // Payment failed
          setStatus("failed");
          setMessage(
            result.message || "Payment failed. Please try again or contact support."
          );

          // Clean up session storage
          sessionStorage.removeItem("phonepe_transaction_id");
          sessionStorage.removeItem("phonepe_booking_data");

          // Redirect back to checkout after delay
          setTimeout(() => {
            router.push("/checkout?step=2");
          }, 5000);
        } else if (result.status === "PENDING" || result.status === "pending") {
          // Still processing - retry if not exceeded max attempts
          if (retryCount < MAX_RETRIES) {
            setMessage(
              `Payment is processing... (${retryCount + 1}/${MAX_RETRIES})`
            );
            setRetryCount((prev) => prev + 1);
            timeoutId = setTimeout(checkPaymentStatus, 2000); // Retry after 2 seconds
          } else {
            // Max retries exceeded
            setStatus("pending");
            setMessage(
              "Payment verification is taking longer than expected. You will receive confirmation via email shortly."
            );

            // Redirect after extended delay
            setTimeout(() => {
              router.push("/checkout");
            }, 10000);
          }
        } else {
          // Unknown status
          setStatus("pending");
          setMessage(
            "Payment status unknown. Please check your email for confirmation or contact support."
          );
        }
      } catch (error: any) {
        console.error("Payment status check error:", error);

        if (retryCount < MAX_RETRIES) {
          // Retry on network errors
          setMessage(
            `Connection issue. Retrying... (${retryCount + 1}/${MAX_RETRIES})`
          );
          setRetryCount((prev) => prev + 1);
          timeoutId = setTimeout(checkPaymentStatus, 2000);
        } else {
          setStatus("failed");
          setMessage(
            "Unable to verify payment status. Please check your email or contact support."
          );
        }
      }
    };

    // Start status checking
    checkPaymentStatus();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [retryCount, router, searchParams, setBookingConfirmation, setCurrentStep]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "checking" && (
          <>
            <Loader2 className={styles.iconSpinning} size={64} />
            <h1 className={styles.title}>Verifying Payment</h1>
            <p className={styles.message}>{message}</p>
            <p className={styles.subMessage}>Please do not close this window</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className={styles.iconSuccess} size={64} />
            <h1 className={styles.title}>Payment Successful!</h1>
            <p className={styles.message}>{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className={styles.iconError} size={64} />
            <h1 className={styles.title}>Payment Failed</h1>
            <p className={styles.message}>{message}</p>
            <button
              className={styles.button}
              onClick={() => router.push("/checkout?step=2")}
            >
              Return to Checkout
            </button>
          </>
        )}

        {status === "pending" && (
          <>
            <Clock className={styles.iconPending} size={64} />
            <h1 className={styles.title}>Payment Processing</h1>
            <p className={styles.message}>{message}</p>
            <button
              className={styles.button}
              onClick={() => router.push("/checkout")}
            >
              Continue
            </button>
          </>
        )}

        {status === "payment_success_booking_failed" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <CheckCircle className={styles.iconSuccess} size={48} />
              <XCircle className={styles.iconError} size={24} style={{ marginTop: "-16px" }} />
            </div>
            <h1 className={styles.title} style={{ color: "#f59e0b" }}>
              Payment Successful - Booking Needs Attention
            </h1>
            
            <div style={{ 
              background: "#fef3c7", 
              border: "2px solid #f59e0b", 
              borderRadius: "8px", 
              padding: "20px",
              marginTop: "16px",
              textAlign: "left",
              maxWidth: "600px"
            }}>
              <div style={{ whiteSpace: "pre-line", lineHeight: "1.6", fontSize: "14px" }}>
                {message}
              </div>

              {errorDetails.bookingId && (
                <div style={{ 
                  marginTop: "20px", 
                  padding: "12px", 
                  background: "white", 
                  borderRadius: "6px",
                  fontSize: "13px"
                }}>
                  <strong>Reference Details:</strong><br />
                  Booking ID: {errorDetails.bookingId}<br />
                  Transaction ID: {errorDetails.transactionId}<br />
                  {errorDetails.errorType && (
                    <>Error Type: {errorDetails.errorType}<br /></>
                  )}
                  {errorDetails.requiresRefund && (
                    <span style={{ color: "#059669", fontWeight: "bold" }}>
                      ✓ Refund eligible if needed
                    </span>
                  )}
                </div>
              )}

              <div style={{ 
                marginTop: "16px", 
                padding: "12px", 
                background: "#dcfce7", 
                borderRadius: "6px",
                fontSize: "13px",
                border: "1px solid #10b981"
              }}>
                <strong style={{ color: "#059669" }}>✓ Your Money is Safe</strong><br />
                Your payment has been successfully processed and is secure. Our team will resolve this shortly.
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                className={styles.button}
                onClick={() => router.push("/")}
                style={{ background: "#6b7280" }}
              >
                Go to Home
              </button>
              <button
                className={styles.button}
                onClick={() => {
                  // Copy booking details to clipboard
                  const details = `Booking Reference: ${errorDetails.bookingId}\nTransaction ID: ${errorDetails.transactionId}`;
                  navigator.clipboard.writeText(details);
                  setShowClipboardAlert(true);
                }}
              >
                Copy Reference
              </button>
            </div>
          </>
        )}
      </div>

      {/* Clipboard Copy Confirmation */}
      <AlertDialog
        open={showClipboardAlert}
        onOpenChange={setShowClipboardAlert}
        title="Copied!"
        description="Reference details copied to clipboard!"
        actionLabel="Got it"
        onAction={() => setShowClipboardAlert(false)}
        onCancel={() => setShowClipboardAlert(false)}
        showOnlyAction={true}
      />
    </div>
  );
}

// Suspense fallback component
function PaymentReturnFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Loader2 className={styles.iconSpinning} size={64} />
        <h1 className={styles.title}>Loading...</h1>
        <p className={styles.message}>Please wait</p>
      </div>
    </div>
  );
}

// Main page component wrapped with Suspense
export default function PhonePeReturnPage() {
  return (
    <Suspense fallback={<PaymentReturnFallback />}>
      <PhonePeReturnContent />
    </Suspense>
  );
}
