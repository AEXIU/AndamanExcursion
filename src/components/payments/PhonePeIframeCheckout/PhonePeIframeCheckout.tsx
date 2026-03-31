// src/components/payments/PhonePeIframeCheckout/PhonePeIframeCheckout.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./PhonePeIframeCheckout.module.css";
import { Loader2, X } from "lucide-react";

interface PhonePeIframeCheckoutProps {
  redirectUrl: string;
  merchantOrderId: string;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  onClose?: () => void;
}

/**
 * PhonePe Iframe Checkout Component
 * Displays PhonePe payment page in an iframe modal overlay
 */
export const PhonePeIframeCheckout: React.FC<PhonePeIframeCheckoutProps> = ({
  redirectUrl,
  merchantOrderId,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("PhonePe iframe loading:", {
      merchantOrderId,
      hasRedirectUrl: !!redirectUrl,
    });

    // Handle iframe load event
    const handleIframeLoad = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      try {
        // Check if iframe has navigated to our return URL
        const iframeUrl = iframe.contentWindow?.location.href;
        console.log("Iframe loaded, checking URL...");

        // If PhonePe redirected back to our site, trigger success
        if (iframeUrl && iframeUrl.includes('checkout/payment-return')) {
          console.log("✅ Payment return detected in iframe!");
          
          // Small delay to ensure PhonePe has updated status
          setTimeout(() => {
            onSuccess?.({ status: 'SUCCESS' });
          }, 1000);
          return;
        }
      } catch (e) {
        // Cross-origin restriction - PhonePe page loaded
        // This is expected and normal
      }

      setIsLoading(false);
      console.log("PhonePe iframe loaded successfully");
    };

    // Handle iframe error
    const handleIframeError = () => {
      setIsLoading(false);
      setLoadError("Failed to load payment page");
      console.error("PhonePe iframe load error");
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
      iframe.addEventListener("error", handleIframeError);

      return () => {
        iframe.removeEventListener("load", handleIframeLoad);
        iframe.removeEventListener("error", handleIframeError);
      };
    }
  }, [redirectUrl, merchantOrderId, onSuccess]);

  // Poll payment status to detect completion
  useEffect(() => {
    if (!merchantOrderId) return;

    console.log("Starting payment status polling for:", merchantOrderId);

    // Start polling after 5 seconds (give user time to initiate payment)
    const startPollingTimeout = setTimeout(() => {
      pollIntervalRef.current = setInterval(async () => {
        try {
          console.log("Checking payment status...");
          
          const response = await fetch(
            `/api/payments/phonepe/status?merchantTransactionId=${merchantOrderId}`
          );
          
          const result = await response.json();
          
          console.log("Status check result:", result.status);

          // If payment successful, trigger success handler
          if (result.success && result.status === "SUCCESS") {
            console.log("✅ Payment detected as successful!");
            
            // Clear polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            // Trigger success
            onSuccess?.(result);
          } else if (result.status === "FAILED") {
            console.log("❌ Payment detected as failed!");
            
            // Clear polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            // Trigger failure
            onFailure?.(result);
          }
        } catch (error) {
          console.error("Status check error:", error);
        }
      }, 3000); // Check every 3 seconds
    }, 5000); // Start after 5 seconds

    // Cleanup
    return () => {
      clearTimeout(startPollingTimeout);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [merchantOrderId, onSuccess, onFailure]);

  // Listen for messages from PhonePe (if they send any)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from PhonePe domain
      if (!event.origin.includes("phonepe.com")) {
        return;
      }

      console.log("Message from PhonePe iframe:", event.data);

      // Handle payment completion messages
      if (event.data.status === "SUCCESS") {
        onSuccess?.(event.data);
      } else if (event.data.status === "FAILED") {
        onFailure?.(event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onFailure]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h3>Complete Your Payment</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close payment"
          >
            <X size={24} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={48} />
            <p>Loading payment page...</p>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{loadError}</p>
            <button onClick={onClose} className={styles.retryButton}>
              Close
            </button>
          </div>
        )}

        {/* PhonePe Iframe */}
        {!loadError && (
          <iframe
            ref={iframeRef}
            src={redirectUrl}
            className={styles.iframe}
            title="PhonePe Payment"
            allow="payment"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        )}

        {/* Footer Info */}
        <div className={styles.footer}>
          <p className={styles.secureText}>
            🔒 Secured by PhonePe • Your payment information is encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhonePeIframeCheckout;
