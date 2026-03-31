/**
 * Improved utility functions for triggering Next.js revalidation from Payload CMS
 */

interface RevalidationPayload {
  collection: string;
  slug?: string;
  operation: "create" | "update" | "delete";
  doc?: any;
  paths?: string[];
  tags?: string[];
}

/**
 * Triggers revalidation via internal API call with improved error handling
 */
export async function triggerRevalidation(
  payload: RevalidationPayload
): Promise<void> {
  try {
    const revalidationSecret = process.env.REVALIDATION_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!revalidationSecret) {
      console.warn("⚠️ REVALIDATION_SECRET not set, skipping revalidation");
      return;
    }

    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${revalidationSecret}`,
      },
      body: JSON.stringify(payload),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Revalidation failed: ${response.status} ${response.statusText} - ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const result = await response.json();
    console.log("✅ Revalidation triggered successfully:", {
      collection: payload.collection,
      operation: payload.operation,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("❌ Failed to trigger revalidation:", {
      collection: payload.collection,
      operation: payload.operation,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Don't throw the error to prevent breaking the main operation
    // Revalidation failure shouldn't break content updates
  }
}

/**
 * Creates a Payload hook function for automatic revalidation with improved logic
 */
export function createRevalidationHook(collection: string) {
  return async ({ doc, operation, req }: any) => {
    // Allow enabling revalidation in development via environment variable
    const skipDev =
      process.env.NODE_ENV === "development" &&
      !process.env.ENABLE_DEV_REVALIDATION;
    if (skipDev) {
      console.log(
        `🔄 Skipping revalidation in development for ${collection}:${operation} (set ENABLE_DEV_REVALIDATION=true to enable)`
      );
      return;
    }

    // Check for draft status using the correct field based on your schema
    const isDraft =
      doc.publishingSettings?.status === "draft" ||
      doc._status === "draft" || // Fallback for collections that might use _status
      doc.status === "draft"; // Fallback for other status fields

    if (isDraft) {
      console.log(
        `📝 Skipping revalidation for draft document in ${collection}`
      );
      return;
    }

    // Skip revalidation for inactive items
    if (doc.isActive === false || doc.status?.isActive === false) {
      console.log(
        `🚫 Skipping revalidation for inactive document in ${collection}`
      );
      return;
    }

    console.log(`🔄 Triggering revalidation for ${collection}:${operation}`, {
      docId: doc.id,
      slug: doc.slug,
      title: doc.title,
    });

    await triggerRevalidation({
      collection,
      slug: doc.slug,
      operation,
      doc,
    });
  };
}

/**
 * Specific revalidation functions for different content types
 */
export const revalidationHooks = {
  media: createRevalidationHook("media"),
  pages: createRevalidationHook("pages"),
  packages: createRevalidationHook("packages"),
  activities: createRevalidationHook("activities"),
  packageCategories: createRevalidationHook("package-categories"),
  activityCategories: createRevalidationHook("activity-categories"),
  boatRoutes: createRevalidationHook("boat-routes"),
  navigation: createRevalidationHook("navigation"),
};

/**
 * Manual revalidation function for specific paths/tags
 */
export async function revalidateSpecific(
  paths: string[] = [],
  tags: string[] = []
): Promise<void> {
  if (paths.length === 0 && tags.length === 0) {
    console.warn("⚠️ revalidateSpecific called with no paths or tags");
    return;
  }

  await triggerRevalidation({
    collection: "manual",
    operation: "update",
    paths,
    tags,
  });
}

/**
 * Revalidate entire site (use sparingly)
 */
export async function revalidateAll(): Promise<void> {
  console.log("🌐 Triggering full site revalidation");
  await triggerRevalidation({
    collection: "site",
    operation: "update",
    paths: ["/"],
    tags: ["all"],
  });
}

/**
 * Health check function to test revalidation setup
 */
export async function testRevalidationSetup(): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const secret = process.env.REVALIDATION_SECRET;

    if (!secret) {
      console.error("❌ REVALIDATION_SECRET not configured");
      return false;
    }

    const response = await fetch(
      `${baseUrl}/api/revalidate?path=/&secret=${secret}`,
      {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      console.log("✅ Revalidation setup is working correctly");
      return true;
    } else {
      console.error(
        "❌ Revalidation setup test failed:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Revalidation setup test error:", error);
    return false;
  }
}
