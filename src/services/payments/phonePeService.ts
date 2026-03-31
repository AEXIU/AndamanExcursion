// src/services/payments/phonePeService.ts
// PhonePe Payment Gateway Service - Official API v2 Implementation

import crypto from "crypto";

/**
 * PhonePe Payment Gateway Service
 * Implements PhonePe Standard Checkout API with proper X-VERIFY authentication
 */
export class PhonePeService {
  private merchantId: string;
  private saltKey: string;
  private saltIndex: string;
  private apiUrl: string;
  private devMode: boolean;

  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID!;
    this.saltKey = process.env.PHONEPE_SALT_KEY!;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    this.apiUrl = process.env.PHONEPE_API_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
    this.devMode = process.env.PHONEPE_DEV_MODE === "true";

    if (!this.merchantId || !this.saltKey) {
      throw new Error("PhonePe credentials not configured. Check PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY");
    }

    console.log("PhonePe Service initialized:", {
      devMode: this.devMode,
      hasCredentials: !!(this.merchantId && this.saltKey),
    });
  }

  /**
   * Generate X-VERIFY header for authentication
   * Format: SHA256(base64Payload + apiEndpoint + saltKey) + "###" + saltIndex
   * @param base64Payload - Already base64 encoded payload
   * @param apiEndpoint - API endpoint path
   */
  private generateXVerifyHeader(base64Payload: string, apiEndpoint: string): string {
    const stringToHash = base64Payload + apiEndpoint + this.saltKey;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    return `${sha256Hash}###${this.saltIndex}`;
  }

  /**
   * Verify X-VERIFY header from PhonePe callback
   */
  private verifyXVerifyHeader(
    base64Response: string,
    xVerifyHeader: string
  ): boolean {
    const stringToHash = base64Response + this.saltKey;
    const expectedHash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const receivedHash = xVerifyHeader.split("###")[0];
    return expectedHash === receivedHash;
  }

  /**
   * Generate unique merchant transaction ID
   */
  public generateMerchantTransactionId(): string {
    return `AE_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  }

  /**
   * Generate unique merchant user ID
   */
  public generateMerchantUserId(email?: string): string {
    if (email) {
      return `USER_${crypto.createHash("md5").update(email).digest("hex").substring(0, 8)}`;
    }
    return `USER_${crypto.randomBytes(4).toString("hex")}`;
  }


  /**
   * Initiate payment with PhonePe
   */
  public async initiatePayment(params: {
    amount: number; // Amount in rupees (will be converted to paise)
    merchantTransactionId: string;
    merchantUserId: string;
    redirectUrl: string;
    callbackUrl: string;
    mobileNumber?: string;
  }) {
    const amountInPaise = Math.round(params.amount * 100);

    // PhonePe Standard Checkout payload structure
    const payload = {
      merchantId: this.merchantId,
      merchantTransactionId: params.merchantTransactionId,
      merchantUserId: params.merchantUserId,
      amount: amountInPaise,
      redirectUrl: params.redirectUrl,
      redirectMode: "REDIRECT",
      callbackUrl: params.callbackUrl,
      mobileNumber: params.mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString("base64");
    const apiEndpoint = `/pg/v1/pay`;
    const xVerifyHash = this.generateXVerifyHeader(base64Payload, apiEndpoint);

    console.log("PhonePe payment initiation:", {
      merchantTransactionId: params.merchantTransactionId,
      amount: amountInPaise,
      endpoint: `${this.apiUrl}${apiEndpoint}`,
    });



    try {
      const response = await fetch(`${this.apiUrl}${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyHash,
        },
        body: JSON.stringify({
          request: base64Payload,
        }),
      });

      const result = await response.json();

      console.log("PhonePe payment initiation response:", {
        success: result.success,
        code: result.code,
        hasRedirectUrl: !!result.data?.instrumentResponse?.redirectInfo?.url,
      });

      if (!result.success) {
        console.error("PhonePe API error:", result);
        throw new Error(result.message || "Payment initiation failed");
      }

      return {
        success: true,
        merchantTransactionId: params.merchantTransactionId,
        checkoutUrl: result.data?.instrumentResponse?.redirectInfo?.url || result.data?.url,
        code: result.code,
        message: result.message,
      };
    } catch (error: any) {
      console.error("PhonePe payment initiation error:", error);
      throw new Error(error.message || "Failed to initiate payment with PhonePe");
    }
  }

  /**
   * Check payment status
   */
  public async checkPaymentStatus(merchantTransactionId: string) {
    const apiEndpoint = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
    const stringToHash = apiEndpoint + this.saltKey;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerify = `${sha256Hash}###${this.saltIndex}`;

    console.log("Checking PhonePe payment status:", {
      merchantTransactionId,
      endpoint: `${this.apiUrl}${apiEndpoint}`,
    });

    try {
      const response = await fetch(`${this.apiUrl}${apiEndpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
        },
      });

      const result = await response.json();

      console.log("PhonePe status check response:", {
        success: result.success,
        code: result.code,
        state: result.data?.state,
        transactionId: result.data?.transactionId,
      });

      return {
        success: result.success,
        code: result.code,
        message: result.message,
        state: result.data?.state, // COMPLETED, FAILED, PENDING
        transactionId: result.data?.transactionId,
        amount: result.data?.amount,
        responseCode: result.data?.responseCode,
        paymentInstrument: result.data?.paymentInstrument,
      };
    } catch (error: any) {
      console.error("PhonePe status check error:", error);
      throw new Error(error.message || "Failed to check payment status");
    }
  }

  /**
   * Validate callback from PhonePe webhook
   */
  public validateCallback(base64Response: string, xVerifyHeader: string): {
    isValid: boolean;
    data?: any;
  } {
    try {
      // Verify signature
      const isValid = this.verifyXVerifyHeader(base64Response, xVerifyHeader);

      if (!isValid && !this.devMode) {
        console.error("PhonePe callback signature verification failed");
        return { isValid: false };
      }

      // Decode response
      const decodedResponse = Buffer.from(base64Response, "base64").toString("utf-8");
      const data = JSON.parse(decodedResponse);

      console.log("PhonePe callback validated:", {
        isValid: isValid || this.devMode,
        merchantTransactionId: data.merchantTransactionId,
        state: data.state,
        devModeSkip: !isValid && this.devMode,
      });

      return {
        isValid: isValid || this.devMode, // Skip validation in dev mode
        data,
      };
    } catch (error: any) {
      console.error("PhonePe callback validation error:", error);
      return { isValid: false };
    }
  }
}

// Export singleton instance
export const phonePeService = new PhonePeService();
export default phonePeService;
