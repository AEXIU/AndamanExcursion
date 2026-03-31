// src/services/ferryServices/ferryApiService.ts
export class FerryApiService {
  // ✅ FIXED: Increased timeouts for better Sealink compatibility
  private static readonly SEARCH_TIMEOUT = 10000; // 10 seconds for search
  private static readonly BOOKING_TIMEOUT = 45000; // 45 seconds for booking operations
  private static readonly MAX_RETRIES = 2; // Keep retries for reliability

  static async callWithRetry<T>(
    apiCall: () => Promise<T>,
    operatorName: string,
    isBookingOperation: boolean = false
  ): Promise<T> {
    const timeout = isBookingOperation
      ? this.BOOKING_TIMEOUT
      : this.SEARCH_TIMEOUT;
    const maxRetries = isBookingOperation ? 1 : this.MAX_RETRIES; // Only retry once for bookings

    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `${operatorName} API attempt ${attempt}/${maxRetries} (timeout: ${timeout}ms)`
        );

        return await Promise.race([apiCall(), this.timeoutPromise(timeout)]);
      } catch (error) {
        lastError = error as Error;
        console.warn(`${operatorName} API attempt ${attempt} failed:`, {
          error: error instanceof Error ? error.message : "Unknown error",
          isTimeout:
            error instanceof Error && error.message.includes("timeout"),
          willRetry:
            attempt < maxRetries && !this.isNonRetryableError(lastError),
        });

        // ✅ FIXED: Don't retry on timeouts for booking operations to prevent double bookings
        if (
          this.isNonRetryableError(lastError) ||
          (isBookingOperation &&
            error instanceof Error &&
            error.message.includes("timeout"))
        ) {
          console.error(`${operatorName}: Not retrying due to error type`);
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(Math.pow(2, attempt) * 1000, 5000); // Cap at 5 seconds
          console.log(`${operatorName}: Waiting ${delay}ms before retry...`);
          await this.delay(delay);
        }
      }
    }

    throw lastError!;
  }

  // Enhanced method specifically for booking operations
  static async callBookingApi<T>(
    apiCall: () => Promise<T>,
    operatorName: string
  ): Promise<T> {
    return this.callWithRetry(apiCall, operatorName, true);
  }

  private static isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("invalid credentials") ||
      message.includes("invalid request") ||
      message.includes("bad request") ||
      message.includes("not found") ||
      message.includes("token validation failed") || // ✅ FIXED: Don't retry auth failures
      message.includes("seat already booked") // ✅ FIXED: Don't retry booking conflicts
    );
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    );
  }

  // ✅ FIXED: Helper method to create fetch requests with built-in timeout
  static async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = 45000 // ✅ FIXED: Default to 45 seconds
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }
}
