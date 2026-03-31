/**
 * PayloadCMS Utility Functions
 * ----------------------------
 * Common utility functions used across all PayloadCMS services
 */

/**
 * Helper function to extract a valid image URL from various PayloadCMS media structures
 */
export const extractImageUrl = (mediaField: any): string => {
  // Case 1: Direct URL string
  if (typeof mediaField === "string") {
    return mediaField;
  }

  // Case 2: Full media object with URL
  if (mediaField?.url) {
    return mediaField.url;
  }

  // Case 3: Media ID that needs to be converted to URL
  if (mediaField && typeof mediaField === "object" && !mediaField.url) {
    // If we have filename, serve from static directory
    if (mediaField.filename) {
      return `/media/${mediaField.filename}`;
    }

    // If it's an ID (MongoDB ObjectId), construct a media URL as fallback
    if (typeof mediaField === "string" || mediaField.id) {
      const mediaId =
        typeof mediaField === "string" ? mediaField : mediaField.id;
      return `/api/media/file/${mediaId}`;
    }
  }

  // Fallback
  return "/images/placeholder.png";
};

/**
 * Extract location name from various location field structures
 */
export const extractLocationName = (
  locationField: any,
  fallback: string = "Location"
): string => {
  if (!locationField) return fallback;

  // If location is populated (object with name)
  if (typeof locationField === "object" && locationField.name) {
    return locationField.name;
  }

  // If location is just a string
  if (typeof locationField === "string") {
    return locationField;
  }

  return fallback;
};

/**
 * Extract category name from various category field structures
 */
export const extractCategoryName = (
  categoryField: any,
  fallback: string = "Category"
): string => {
  if (!categoryField) return fallback;

  // If category is populated (object with name)
  if (typeof categoryField === "object" && categoryField.name) {
    return categoryField.name;
  }

  // If category has title instead of name
  if (typeof categoryField === "object" && categoryField.title) {
    return categoryField.title;
  }

  // If category is just a string
  if (typeof categoryField === "string") {
    return categoryField;
  }

  return fallback;
};

/**
 * Extract period/duration information from various period field structures
 */
export const extractPeriodInfo = (
  periodField: any,
  fallback: string = ""
): string => {
  if (!periodField) return fallback;

  // If period is populated (object)
  if (typeof periodField === "object") {
    return (
      periodField.shortTitle ||
      periodField.title ||
      periodField.value ||
      fallback
    );
  }

  // If period is just a string
  if (typeof periodField === "string") {
    return periodField;
  }

  return fallback;
};

/**
 * Process images array from PayloadCMS media structure
 */
export const processImageArray = (
  images: any[],
  altFallback: string = "Image"
): Array<{
  url: string;
  alt: string;
  caption?: string;
}> => {
  if (!Array.isArray(images) || images.length === 0) {
    return [
      {
        url: "/images/placeholder.png",
        alt: altFallback,
      },
    ];
  }

  return images.map((img: any) => ({
    url: extractImageUrl(img.image),
    alt: img.alt || altFallback,
    caption: img.caption,
  }));
};

/**
 * Build safe query conditions based on collection schema
 */
export const buildSafeQuery = (
  collection: string,
  baseConditions: any[] = [],
  additionalConditions: any[] = []
): any => {
  const conditions = [...baseConditions, ...additionalConditions];

  // If no conditions, return a simple active query
  if (conditions.length === 0) {
    return getDefaultActiveQuery(collection);
  }

  return {
    and: conditions,
  };
};

/**
 * Get default "active" query for different collection types
 * This handles the different field structures across collections
 */
export const getDefaultActiveQuery = (collection: string): any => {
  switch (collection) {
    case "packages":
      return {
        and: [{ "publishingSettings.status": { equals: "published" } }],
      };

    case "activities":
      return {
        and: [{ "status.isActive": { equals: true } }],
      };

    case "pages":
      return {
        and: [{ "publishingSettings.status": { equals: "published" } }],
      };

    case "blogs":
      return {
        and: [{ "status": { equals: "published" } }],
      };

    case "locations":
    case "activity-categories":
    case "package-categories":
    case "package-periods":
      return {
        and: [{ isActive: { equals: true } }],
      };

    // Add more collections as needed
    default:
      console.warn(
        `Unknown collection: ${collection}. Using default isActive query.`
      );
      return {
        and: [{ isActive: { equals: true } }],
      };
  }
};

/**
 * Get published query for collections that have publishing status
 */
export const getPublishedQuery = (
  collection: string,
  additionalConditions: any[] = []
): any => {
  const publishedCondition = getDefaultActiveQuery(collection);

  if (additionalConditions.length === 0) {
    return publishedCondition;
  }

  return {
    and: [...publishedCondition.and, ...additionalConditions],
  };
};

/**
 * Format date for display
 */
export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return dateObj.toLocaleDateString("en-US", { ...defaultOptions, ...options });
};

/**
 * Check if a date string is valid
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Get day of week from date string
 */
export const getDayOfWeek = (dateString: string): string => {
  if (!isValidDate(dateString)) {
    throw new Error("Invalid date string");
  }

  return new Date(dateString).toLocaleDateString("en-US", { weekday: "long" });
};

/**
 * Safely access nested object properties
 */
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return defaultValue;
    }
    current = current[key];
  }

  return current !== undefined ? current : defaultValue;
};

/**
 * Create a slug from a string
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Truncate text to a specific length
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = "..."
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
};
