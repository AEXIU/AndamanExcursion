// src/services/payments/phonePeOAuthService.ts
// PhonePe OAuth Token Service for v2 API

/**
 * PhonePe OAuth Token Service
 * Handles OAuth token generation and caching for PhonePe Checkout v2 API
 */
export class PhonePeOAuthService {
  private clientId: string;
  private clientSecret: string;
  private authUrl: string;
  private cachedToken?: {
    token: string;
    expiresAt: number;
  };

  constructor() {
    this.clientId = process.env.PHONEPE_MERCHANT_ID!;
    this.clientSecret = process.env.PHONEPE_SALT_KEY!;

    // Production uses identity-manager for auth, sandbox uses pg-sandbox for everything
    const isProduction = process.env.PHONEPE_ENV === "production";
    this.authUrl = isProduction
      ? process.env.PHONEPE_AUTH_URL || "https://api.phonepe.com/apis/identity-manager"
      : process.env.PHONEPE_API_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("PhonePe OAuth credentials not configured. Check PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY");
    }

    console.log("PhonePe OAuth Service initialized:", {
      isProduction,
      hasCredentials: !!(this.clientId && this.clientSecret),
    });
  }

  /**
   * Get OAuth access token (with caching)
   * Tokens are valid for 1 hour, we cache them to avoid unnecessary API calls
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a cached token that's still valid
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      console.log("Using cached OAuth token (expires in", 
        Math.round((this.cachedToken.expiresAt - Date.now()) / 1000), "seconds)");
      return this.cachedToken.token;
    }

    console.log("Generating new OAuth token...");

    try {
      // Prepare request body as URL-encoded form data
      const requestBody = new URLSearchParams({
        client_version: "1",
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }).toString();

      // Call OAuth token endpoint
      const response = await fetch(`${this.authUrl}/v1/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OAuth token request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error("No access token in OAuth response");
      }

      // Cache the token with its expiration time
      // expires_at is in seconds, convert to milliseconds
      this.cachedToken = {
        token: data.access_token,
        expiresAt: data.expires_at * 1000,
      };

      console.log("✅ OAuth token generated successfully (expires at:", 
        new Date(this.cachedToken.expiresAt).toISOString(), ")");

      return data.access_token;
    } catch (error: any) {
      console.error("❌ OAuth token generation failed:", error);
      throw new Error(`Failed to get OAuth token: ${error.message}`);
    }
  }

  /**
   * Clear cached token (useful for testing or error recovery)
   */
  clearCache(): void {
    this.cachedToken = undefined;
    console.log("OAuth token cache cleared");
  }

  /**
   * Check if current token is valid
   */
  hasValidToken(): boolean {
    return !!(this.cachedToken && this.cachedToken.expiresAt > Date.now());
  }
}

// Export singleton instance
export const phonePeOAuthService = new PhonePeOAuthService();
