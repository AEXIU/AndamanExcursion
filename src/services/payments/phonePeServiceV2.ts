// src/services/payments/phonePeServiceV2.ts
// PhonePe Checkout API v2 Implementation

import crypto from "crypto";
import { phonePeOAuthService } from "./phonePeOAuthService";

/**
 * PhonePe Payment Service - Checkout API v2
 * Uses OAuth authentication and supports both iframe and redirect flows
 */
export class PhonePeServiceV2 {
  private merchantId: string;
  private saltKey: string;
  private saltIndex: string;
  private apiUrl: string;
  private devMode: boolean;
  private isProduction: boolean;

  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID!;
    this.saltKey = process.env.PHONEPE_SALT_KEY!;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    this.devMode = process.env.PHONEPE_DEV_MODE === "true";
    this.isProduction = process.env.PHONEPE_ENV === "production";

    // Production uses /apis/pg for payments, sandbox uses pg-sandbox for everything
    this.apiUrl = this.isProduction
      ? process.env.PHONEPE_PG_URL || "https://api.phonepe.com/apis/pg"
      : process.env.PHONEPE_API_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!this.merchantId) {
      console.warn("⚠️ PhonePe merchant ID not configured. Will fail if payment is attempted.");
    }

    console.log("PhonePe Service V2 initialized:", {
      isProduction: this.isProduction,
      hasCredentials: !!(this.merchantId && this.saltKey),
    });
  }

  /**
   * Generate unique merchant order ID
   */
  public generateMerchantOrderId(): string {
    return `AE_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * Initiate payment with PhonePe Checkout v2 API
   */
  public async initiatePayment(params: {
    amount: number; // Amount in rupees (will be converted to paise)
    merchantOrderId: string;
    redirectUrl: string;
    metaInfo?: Record<string, string>;
  }) {
    const amountInPaise = Math.round(params.amount * 100);

    console.log("PhonePe v2 payment initiation:", {
      merchantOrderId: params.merchantOrderId,
      amount: amountInPaise,
      amountInRupees: params.amount,
    });

    try {
      // Step 1: Get OAuth token
      const accessToken = await phonePeOAuthService.getAccessToken();

      // Step 2: Prepare payment request payload
      const requestBody = {
        amount: amountInPaise,
        expireAfter: 1200, // 20 minutes expiry
        merchantOrderId: params.merchantOrderId,
        metaInfo: params.metaInfo || {
          udf1: "Andaman Excursion Booking",
          udf2: "Ferry/Activity Booking",
        },
        paymentFlow: {
          type: "PG_CHECKOUT", // This enables both iframe and redirect
          message: "Complete your booking payment",
          merchantUrls: {
            redirectUrl: params.redirectUrl,
          },
        },
      };

      if (this.devMode) {
        console.log("🔍 PhonePe v2 Request Debug:", {
          endpoint: `${this.apiUrl}/checkout/v2/pay`,
          merchantOrderId: params.merchantOrderId,
          amount: amountInPaise,
          hasToken: !!accessToken,
        });
      }

      // Step 3: Call PhonePe Checkout API
      const response = await fetch(`${this.apiUrl}/checkout/v2/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PhonePe v2 API error response:", errorText);
        throw new Error(`PhonePe API request failed: ${response.status}`);
      }

      const result = await response.json();

      console.log("PhonePe v2 payment initiation response:", {
        orderId: result.orderId,
        state: result.state,
        hasRedirectUrl: !!result.redirectUrl,
        expiresAt: result.expireAt,
      });

      // Log production transaction
      this.logProductionTransaction({
        type: "PAYMENT_INITIATED",
        transactionId: result.orderId,
        merchantOrderId: params.merchantOrderId,
        amount: amountInPaise,
      });

      // v2 API returns different structure than v1
      return {
        success: true,
        orderId: result.orderId, // PhonePe's internal order ID
        merchantOrderId: params.merchantOrderId, // Our order ID
        state: result.state, // PENDING, COMPLETED, FAILED
        redirectUrl: result.redirectUrl, // URL for payment page
        expireAt: result.expireAt,
      };
    } catch (error: any) {
      console.error("PhonePe v2 payment initiation error:", error.message);
      throw new Error(error.message || "Failed to initiate payment with PhonePe v2");
    }
  }

  /**
   * Check payment status with PhonePe Checkout v2 API
   */
  public async checkPaymentStatus(merchantOrderId: string) {
    console.log("Checking PhonePe v2 payment status for:", merchantOrderId);

    try {
      // Get OAuth token
      const accessToken = await phonePeOAuthService.getAccessToken();

      // Call status API
      const response = await fetch(
        `${this.apiUrl}/checkout/v2/order/${merchantOrderId}/status`,
        {
          method: "GET",
          headers: {
            Authorization: `O-Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PhonePe v2 status check error:", errorText);
        throw new Error(`Status check failed: ${response.status}`);
      }

      const result = await response.json();

      console.log("PhonePe v2 status check result:", {
        orderId: result.orderId,
        state: result.state,
        amount: result.amount,
        paymentDetailsCount: result.paymentDetails?.length || 0,
      });

      // Map v2 response to our standard format
      return {
        success: result.state === "SUCCESS",
        state: result.state, // PENDING, SUCCESS, FAILED, EXPIRED
        orderId: result.orderId,
        amount: result.amount,
        paymentDetails: result.paymentDetails || [],
        metaInfo: result.metaInfo || {},
        // For compatibility with existing code
        code: result.state === "SUCCESS" ? "PAYMENT_SUCCESS" : "PAYMENT_PENDING",
        message: this.getStatusMessage(result.state),
      };
    } catch (error: any) {
      console.error("PhonePe v2 status check error:", error.message);
      throw new Error(error.message || "Failed to check payment status");
    }
  }

  /**
   * Initiate refund with PhonePe Checkout v2 API
   * @param merchantOrderId - The original order's merchant order ID
   * @param amount - Refund amount in rupees (full or partial)
   * @param reason - Reason for refund
   */
  public async initiateRefund(params: {
    merchantOrderId: string;
    amount: number; // Amount in rupees
    reason?: string;
  }) {
    const amountInPaise = Math.round(params.amount * 100);

    console.log("PhonePe v2 refund initiation:", {
      merchantOrderId: params.merchantOrderId,
      amount: amountInPaise,
      amountInRupees: params.amount,
      reason: params.reason,
    });

    try {
      const accessToken = await phonePeOAuthService.getAccessToken();

      const requestBody = {
        amount: amountInPaise,
        merchantOrderId: params.merchantOrderId,
        ...(params.reason && { reason: params.reason }),
      };

      const response = await fetch(
        `${this.apiUrl}/checkout/v2/order/${params.merchantOrderId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `O-Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PhonePe v2 refund error:", errorText);
        throw new Error(`Refund request failed: ${response.status}`);
      }

      const result = await response.json();

      console.log("PhonePe v2 refund response:", {
        orderId: result.orderId,
        state: result.state,
        refundId: result.refundId,
      });

      this.logProductionTransaction({
        type: "REFUND_INITIATED",
        transactionId: result.orderId || params.merchantOrderId,
        refundId: result.refundId,
        amount: amountInPaise,
      });

      return {
        success: result.state === "SUCCESS" || result.state === "PENDING",
        state: result.state,
        refundId: result.refundId,
        orderId: result.orderId,
        amount: result.amount,
        message: result.state === "SUCCESS"
          ? "Refund processed successfully"
          : result.state === "PENDING"
          ? "Refund is being processed"
          : "Refund request failed",
      };
    } catch (error: any) {
      console.error("PhonePe v2 refund error:", error.message);
      throw new Error(error.message || "Failed to initiate refund");
    }
  }

  /**
   * Check refund status for an order
   */
  public async checkRefundStatus(merchantOrderId: string) {
    console.log("Checking PhonePe v2 refund status for:", merchantOrderId);

    try {
      const accessToken = await phonePeOAuthService.getAccessToken();

      const response = await fetch(
        `${this.apiUrl}/checkout/v2/order/${merchantOrderId}/refund/status`,
        {
          method: "GET",
          headers: {
            Authorization: `O-Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PhonePe v2 refund status error:", errorText);
        throw new Error(`Refund status check failed: ${response.status}`);
      }

      const result = await response.json();

      console.log("PhonePe v2 refund status:", {
        orderId: result.orderId,
        state: result.state,
        refundDetails: result.refundDetails?.length || 0,
      });

      return {
        success: true,
        state: result.state,
        orderId: result.orderId,
        refundDetails: result.refundDetails || [],
      };
    } catch (error: any) {
      console.error("PhonePe v2 refund status error:", error.message);
      throw new Error(error.message || "Failed to check refund status");
    }
  }

  /**
   * Get user-friendly status message
   */
  private getStatusMessage(state: string): string {
    const messages: Record<string, string> = {
      PENDING: "Payment is being processed",
      SUCCESS: "Payment completed successfully",
      FAILED: "Payment failed",
      EXPIRED: "Payment link expired",
    };
    return messages[state] || "Unknown payment status";
  }

  /**
   * Validate webhook/callback signature using SHA256
   * Verifies that the callback actually came from PhonePe
   */
  public validateCallback(base64Response: string, receivedSignature: string): boolean {
    if (!this.saltKey) {
      console.error("PHONEPE_SALT_KEY not configured — cannot validate callback");
      return false;
    }

    try {
      // PhonePe callback signature: SHA256(base64Response + callbackEndpoint + saltKey) + "###" + saltIndex
      // Try multiple endpoint paths for compatibility between v1 and v2
      const endpoints = ["/pg/v1/pay", "/pg/v1/callback"];

      for (const endpoint of endpoints) {
        const stringToHash = base64Response + endpoint + this.saltKey;
        const calculatedHash = crypto
          .createHash("sha256")
          .update(stringToHash)
          .digest("hex");
        const expectedSignature = `${calculatedHash}###${this.saltIndex}`;

        if (expectedSignature === receivedSignature) {
          return true;
        }
      }

      // In dev mode, log mismatch but still allow
      if (this.devMode) {
        console.warn("Callback signature mismatch in dev mode — allowing anyway");
        return true;
      }

      console.error("Callback signature verification failed");
      return false;
    } catch (error) {
      console.error("Callback signature verification error:", error);
      return false;
    }
  }

  /**
   * Production-specific request validation
   * Validates timestamp to prevent replay attacks
   */
  public validateProductionRequest(request: { timestamp?: number; ip?: string }): boolean {
    if (!this.isProduction) return true;

    // Timestamp validation (prevent replay attacks)
    if (request.timestamp) {
      const timeDiff = Math.abs(Date.now() - request.timestamp);
      if (timeDiff > 300000) { // 5 minutes
        console.error("Request timestamp expired:", { timeDiff });
        return false;
      }
    }

    return true;
  }

  /**
   * Production transaction logging (no sensitive data)
   */
  private logProductionTransaction(data: {
    type: string;
    transactionId?: string;
    merchantOrderId?: string;
    refundId?: string;
    amount?: number;
  }) {
    if (this.isProduction) {
      console.log("📊 PhonePe Transaction:", {
        ...data,
        merchantId: this.merchantId,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export singleton instance
export const phonePeServiceV2 = new PhonePeServiceV2();
