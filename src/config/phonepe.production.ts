// src/config/phonepe.production.ts
// PhonePe production configuration — imported by services and routes

const isProduction = process.env.PHONEPE_ENV === "production";

export const phonePeProductionConfig = {
  isProduction,
  
  // Rate limiting for production
  rateLimit: {
    statusChecks: { windowMs: 60000, max: 30 }, // 30 requests per minute
    callbacks: { windowMs: 60000, max: 100 },    // 100 requests per minute
    refunds: { windowMs: 60000, max: 10 },       // 10 refund requests per minute
  },
  
  // Logging configuration  
  logging: {
    level: isProduction ? 'info' : 'debug',
    maskSensitiveData: isProduction,
  },
  
  // Monitoring
  monitoring: {
    healthCheckEndpoint: '/api/payments/phonepe/health',
  },
  
  // Security
  security: {
    enableIpWhitelisting: isProduction,
    requireHttps: isProduction,
    requestTimeout: 10000, // 10 seconds
  },

  // Payment expiry
  paymentExpiry: {
    checkIntervalMs: 60000, // Check every minute
    expiryTimeMs: 1200000,  // 20 minutes (matches PhonePe expireAfter: 1200)
  },
};

/**
 * Get the appropriate config based on environment
 */
export function getPhonePeConfig() {
  return phonePeProductionConfig;
}

/**
 * Check if a log should include sensitive data
 */
export function shouldMaskSensitiveData(): boolean {
  return phonePeProductionConfig.logging.maskSensitiveData;
}