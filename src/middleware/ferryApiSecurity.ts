import { NextRequest } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

class RateLimiter {
  private requests = new Map<string, number[]>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this identifier
    let requestTimes = this.requests.get(identifier) || [];

    // Remove requests outside the current window
    requestTimes = requestTimes.filter((time) => time > windowStart);

    // Check if we're within the limit
    if (requestTimes.length >= this.config.maxRequests) {
      return false;
    }

    // Add current request
    requestTimes.push(now);
    this.requests.set(identifier, requestTimes);

    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.config.windowMs * 2; // Keep some buffer

    this.requests.forEach((times, key) => {
      const validTimes = times.filter((time) => time > cutoff);
      if (validTimes.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimes);
      }
    });
  }
}

// Create rate limiters for different endpoints
const rateLimiters = {
  "ferry-search": new RateLimiter({ windowMs: 60000, maxRequests: 100 }), // 100 requests per minute
  "ferry-health": new RateLimiter({ windowMs: 30000, maxRequests: 10 }), // 10 health checks per 30 seconds
};

// Cleanup old entries every 5 minutes
setInterval(() => {
  Object.values(rateLimiters).forEach((limiter) => limiter.cleanup());
}, 5 * 60 * 1000);

export function validateApiAccess(endpoint: keyof typeof rateLimiters) {
  return function (request: NextRequest) {
    // Get client identifier (IP address from headers)
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const identifier = `${endpoint}:${clientIP}`;
    const limiter = rateLimiters[endpoint];

    if (!limiter.isAllowed(identifier)) {
      throw new Error("Rate limit exceeded");
    }
  };
}

// Export for testing or manual cleanup
export { rateLimiters };
