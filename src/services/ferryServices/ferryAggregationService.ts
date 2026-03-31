import {
  FerrySearchParams,
  UnifiedFerryResult,
} from "@/types/FerryBookingSession.types";

import { MakruzzService } from "./makruzzService";
import { SealinkService } from "./sealinkService";
import { GreenOceanService } from "./greenOceanService";

interface OperatorResult {
  operator: string;
  results?: UnifiedFerryResult[];
  error?: string;
}

export class FerryAggregationService {
  private static async searchSealink(
    params: FerrySearchParams
  ): Promise<OperatorResult> {
    try {
      if (!process.env.SEALINK_USERNAME || !process.env.SEALINK_TOKEN) {
        return {
          operator: "sealink",
          error: "Sealink credentials not configured",
        };
      }

      // ✅ Add individual timeout wrapper
      const searchPromise = SealinkService.searchTrips(params);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Sealink search timeout after 12 seconds")),
          12000
        )
      );

      const results = await Promise.race([searchPromise, timeoutPromise]);
      return { operator: "sealink", results };
    } catch (error) {
      console.error("Error searching Sealink:", error);

      // ✅ IMPROVED: Better error categorization
      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage = "Service timeout - please try again";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Service temporarily unavailable";
        } else if (
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          errorMessage = "Authentication error";
        } else if (
          error.message.includes("500") ||
          error.message.includes("502") ||
          error.message.includes("503")
        ) {
          errorMessage = "Service temporarily down";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        operator: "sealink",
        error: errorMessage,
      };
    }
  }

  private static async searchMakruzz(
    params: FerrySearchParams
  ): Promise<OperatorResult> {
    try {
      if (!process.env.MAKRUZZ_USERNAME || !process.env.MAKRUZZ_PASSWORD) {
        return {
          operator: "makruzz",
          error: "Makruzz credentials not configured",
        };
      }

      // ✅ Add individual timeout wrapper
      const searchPromise = MakruzzService.searchTrips(params);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Makruzz search timeout after 12 seconds")),
          12000
        )
      );

      const results = await Promise.race([searchPromise, timeoutPromise]);
      return { operator: "makruzz", results };
    } catch (error) {
      console.error("Error searching Makruzz:", error);

      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage = "Service timeout - please try again";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Service temporarily unavailable";
        } else if (
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          errorMessage = "Authentication error";
        } else if (
          error.message.includes("500") ||
          error.message.includes("502") ||
          error.message.includes("503")
        ) {
          errorMessage = "Service temporarily down";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        operator: "makruzz",
        error: errorMessage,
      };
    }
  }

  private static async searchGreenOcean(
    params: FerrySearchParams
  ): Promise<OperatorResult> {
    try {
      if (
        !process.env.GREEN_OCEAN_PUBLIC_KEY ||
        !process.env.GREEN_OCEAN_PRIVATE_KEY
      ) {
        return {
          operator: "greenocean",
          error: "Green Ocean credentials not configured",
        };
      }

      // ✅ Add individual timeout wrapper with shorter timeout for Green Ocean
      // (since it's been problematic)
      const searchPromise = GreenOceanService.searchTrips(params);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Green Ocean search timeout after 10 seconds")),
          10000
        )
      );

      const results = await Promise.race([searchPromise, timeoutPromise]);
      return { operator: "greenocean", results };
    } catch (error) {
      console.error("Error searching Green Ocean:", error);

      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        if (
          error.message.includes("timeout") ||
          error.message.includes("522")
        ) {
          errorMessage = "Service currently down - we're working to restore it";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Service temporarily unavailable";
        } else if (
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          errorMessage = "Authentication error";
        } else if (
          error.message.includes("500") ||
          error.message.includes("502") ||
          error.message.includes("503")
        ) {
          errorMessage = "Service temporarily down";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        operator: "greenocean",
        error: errorMessage,
      };
    }
  }

  public static async searchAllOperators(params: FerrySearchParams): Promise<{
    results: UnifiedFerryResult[];
    errors: { operator: string; error: string }[];
  }> {
    const startTime = Date.now();
    console.log(`🔍 Ferry Search: Starting search for all operators`);
    console.log(`   Route: ${params.from} → ${params.to}`);
    console.log(`   Date: ${params.date}`);
    console.log(
      `   Passengers: ${params.adults} adults, ${params.children} children, ${params.infants} infants`
    );

    // ✅ FIXED: Use Promise.allSettled instead of Promise.all + Promise.race
    // This ensures that even if one operator fails, others can still succeed
    const searchPromises = [
      this.searchSealink(params),
      this.searchMakruzz(params),
      this.searchGreenOcean(params),
    ];

    // Set individual timeouts per operator (no overall timeout)
    const operatorResults = await Promise.allSettled(searchPromises);

    // Process settled results
    const results: UnifiedFerryResult[] = [];
    const errors: { operator: string; error: string }[] = [];

    operatorResults.forEach((result, index) => {
      const operatorNames = ["sealink", "makruzz", "greenocean"][index];

      if (result.status === "fulfilled") {
        const operatorResult = result.value;
        if (operatorResult.results) {
          results.push(...operatorResult.results);
          console.log(
            `✅ ${operatorResult.operator}: ${operatorResult.results.length} results`
          );
        } else if (operatorResult.error) {
          errors.push({
            operator: operatorResult.operator,
            error: operatorResult.error,
          });
          console.log(`❌ ${operatorResult.operator}: ${operatorResult.error}`);
        }
      } else {
        // Promise was rejected (shouldn't happen with our error handling, but just in case)
        errors.push({
          operator: operatorNames,
          error: `Promise rejected: ${result.reason}`,
        });
        console.log(`💥 ${operatorNames}: Promise rejected - ${result.reason}`);
      }
    });

    // Sort results by departure time
    results.sort((a, b) =>
      a.schedule.departureTime.localeCompare(b.schedule.departureTime)
    );

    const searchTime = Date.now() - startTime;
    console.log(
      `🎯 Final Results: ${results.length} ferries found, ${errors.length} operator errors (${searchTime}ms)`
    );

    if (errors.length > 0) {
      console.log(`⚠️  Operator Errors (non-fatal):`);
      errors.forEach((error) => {
        console.log(`   ${error.operator}: ${error.error}`);
      });
    }

    // ✅ CRITICAL: Always return results, even if some operators failed
    return {
      results,
      errors,
    };
  }

  // API Health Check Methods
  public static async checkOperatorHealth(): Promise<{
    sealink: { status: "online" | "offline" | "error"; message?: string };
    makruzz: { status: "online" | "offline" | "error"; message?: string };
    greenocean: { status: "online" | "offline" | "error"; message?: string };
  }> {
    const healthChecks = await Promise.allSettled([
      this.checkSealinkHealth(),
      this.checkMakruzzHealth(),
      this.checkGreenOceanHealth(),
    ]);

    return {
      sealink:
        healthChecks[0].status === "fulfilled"
          ? healthChecks[0].value
          : { status: "error", message: "Health check failed" },
      makruzz:
        healthChecks[1].status === "fulfilled"
          ? healthChecks[1].value
          : { status: "error", message: "Health check failed" },
      greenocean:
        healthChecks[2].status === "fulfilled"
          ? healthChecks[2].value
          : { status: "error", message: "Health check failed" },
    };
  }

  private static async checkSealinkHealth(): Promise<{
    status: "online" | "offline" | "error";
    message?: string;
  }> {
    try {
      if (!process.env.SEALINK_USERNAME || !process.env.SEALINK_TOKEN) {
        return { status: "offline", message: "Credentials not configured" };
      }

      const response = await fetch(
        `${process.env.SEALINK_API_URL}getTripData`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toLocaleDateString("en-GB"),
            from: "Port Blair",
            to: "Swaraj Dweep",
            userName: process.env.SEALINK_USERNAME,
            token: process.env.SEALINK_TOKEN,
          }),
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      return response.ok
        ? { status: "online" }
        : { status: "error", message: `HTTP ${response.status}` };
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  private static async checkMakruzzHealth(): Promise<{
    status: "online" | "offline" | "error";
    message?: string;
  }> {
    try {
      if (!process.env.MAKRUZZ_USERNAME || !process.env.MAKRUZZ_PASSWORD) {
        return { status: "offline", message: "Credentials not configured" };
      }

      const response = await fetch(`${process.env.MAKRUZZ_API_URL}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            username: process.env.MAKRUZZ_USERNAME,
            password: process.env.MAKRUZZ_PASSWORD,
          },
        }),
        signal: AbortSignal.timeout(5000),
      });

      return response.ok
        ? { status: "online" }
        : { status: "error", message: `HTTP ${response.status}` };
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  private static async checkGreenOceanHealth(): Promise<{
    status: "online" | "offline" | "error";
    message?: string;
  }> {
    try {
      if (
        !process.env.GREEN_OCEAN_PUBLIC_KEY ||
        !process.env.GREEN_OCEAN_PRIVATE_KEY
      ) {
        return { status: "offline", message: "Credentials not configured" };
      }

      // Create a proper test request with valid hash
      const requestData = {
        from_id: 1,
        dest_to: 2,
        number_of_adults: 1,
        number_of_infants: 0,
        travel_date: new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-"),
        public_key: process.env.GREEN_OCEAN_PUBLIC_KEY,
      };

      // Generate proper hash
      const hashSequence =
        "from_id|dest_to|number_of_adults|number_of_infants|travel_date|public_key";
      const sequenceArray = hashSequence.split("|");

      let hashString = "";
      sequenceArray.forEach((key) => {
        const value = requestData[key as keyof typeof requestData];
        if (value !== undefined && value !== null) {
          hashString += value.toString();
        }
        hashString += "|";
      });
      hashString += process.env.GREEN_OCEAN_PRIVATE_KEY;

      const crypto = require("crypto");
      const hash = crypto.createHash("sha512");
      hash.update(hashString, "utf-8");
      const generatedHash = hash.digest("hex").toLowerCase();

      const requestBody = {
        ...requestData,
        hash_string: generatedHash,
      };

      // Fixed: Use v1/route-details endpoint
      const response = await fetch(
        `${process.env.GREEN_OCEAN_API_URL}v1/route-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(5000),
        }
      );

      return response.ok
        ? { status: "online" }
        : { status: "error", message: `HTTP ${response.status}` };
    } catch (error) {
      return {
        status: "offline",
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }
}
