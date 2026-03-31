import { CollectionSlug } from "payload";
import { getCachedPayload } from "./client";
import { getDefaultActiveQuery } from "./utils";

/**
 * Common Query Builders and Database Access Functions
 * --------------------------------------------------
 * This file contains reusable query building functions and database access patterns
 */

/**
 * Build base query for a specific collection with proper field mapping
 * This replaces the generic buildBaseQuery to handle different collection schemas
 */
export const buildCollectionQuery = (
  collection: string,
  additionalConditions: any[] = []
): any => {
  const baseQuery = getDefaultActiveQuery(collection);

  if (additionalConditions.length === 0) {
    return baseQuery;
  }

  return {
    and: [...baseQuery.and, ...additionalConditions],
  };
};

/**
 * Generic function for querying collections with error handling and consistent patterns
 */
export async function queryCollection<T>(
  collection: string,
  options: {
    where?: any;
    sort?: string;
    limit?: number;
    page?: number;
    depth?: number;
    select?: any;
  } = {}
): Promise<{
  docs: T[];
  totalDocs: number;
  hasNextPage: boolean;
  page?: number;
}> {
  try {
    const payload = await getCachedPayload();

    // Build the where clause - merge default active query with custom conditions
    let whereClause = options.where;

    if (!whereClause) {
      // If no where clause provided, use default active query
      whereClause = getDefaultActiveQuery(collection);
    } else {
      // If where clause provided, check if it already includes active conditions
      const hasActiveConditions = checkForActiveConditions(
        whereClause,
        collection
      );

      if (!hasActiveConditions) {
        // Merge with default active query
        const defaultQuery = getDefaultActiveQuery(collection);
        whereClause = {
          and: [
            ...defaultQuery.and,
            ...(whereClause.and ? whereClause.and : [whereClause]),
          ],
        };
      }
    }

    const result = await payload.find({
      collection: collection as CollectionSlug,
      where: whereClause,
      sort: options.sort,
      limit: options.limit || 100,
      page: options.page,
      depth: options.depth || 1,
      select: options.select,
    });

    return {
      docs: result.docs as T[],
      totalDocs: result.totalDocs,
      hasNextPage: result.hasNextPage,
      page: result.page,
    };
  } catch (error) {
    console.error(`Error querying ${collection}:`, error);
    return { docs: [], totalDocs: 0, hasNextPage: false, page: 1 };
  }
}

/**
 * Check if a where clause already includes active/published conditions
 */
function checkForActiveConditions(
  whereClause: any,
  collection: string
): boolean {
  if (!whereClause) return false;

  // Convert where clause to string and check for active field patterns
  const whereString = JSON.stringify(whereClause);

  switch (collection) {
    case "packages":
    case "pages":
      return whereString.includes("publishingSettings.status");

    case "activities":
      return whereString.includes("status.isActive");

    case "blogs":
      return whereString.includes('"status"');

    case "locations":
    case "activity-categories":
    case "package-categories":
    case "package-periods":
      return (
        whereString.includes('"isActive"') ||
        whereString.includes("displaySettings.isActive")
      );

    default:
      return whereString.includes("isActive");
  }
}

/**
 * Query a single document by ID with proper error handling
 */
export async function queryById<T>(
  collection: string,
  id: string,
  options: {
    depth?: number;
    select?: any;
  } = {}
): Promise<T | null> {
  try {
    const payload = await getCachedPayload();
    const result = await payload.findByID({
      collection: collection as CollectionSlug,
      id,
      depth: options.depth || 1,
      select: options.select,
    });
    return result as T;
  } catch (error) {
    console.error(`Error querying ${collection} by ID ${id}:`, error);
    return null;
  }
}

/**
 * Query documents by multiple IDs
 */
export async function queryByIds<T>(
  collection: string,
  ids: string[],
  options: {
    depth?: number;
    select?: any;
    includeInactive?: boolean;
  } = {}
): Promise<T[]> {
  try {
    const payload = await getCachedPayload();

    let whereClause: any = { id: { in: ids } };

    // Add active conditions unless explicitly excluded
    if (!options.includeInactive) {
      const activeQuery = getDefaultActiveQuery(collection);
      whereClause = {
        and: [whereClause, ...activeQuery.and],
      };
    }

    const result = await payload.find({
      collection: collection as CollectionSlug,
      where: whereClause,
      depth: options.depth || 1,
      select: options.select,
      limit: ids.length, // Set limit to number of IDs requested
    });

    return result.docs as T[];
  } catch (error) {
    console.error(`Error querying ${collection} by IDs:`, error);
    return [];
  }
}

/**
 * Query documents by slug
 */
export async function queryBySlug<T>(
  collection: string,
  slug: string,
  options: {
    depth?: number;
    select?: any;
    includeInactive?: boolean;
  } = {}
): Promise<T | null> {
  try {
    const payload = await getCachedPayload();

    const conditions = [{ slug: { equals: slug } }];

    // Add active conditions unless explicitly excluded
    if (!options.includeInactive) {
      const activeQuery = getDefaultActiveQuery(collection);
      conditions.push(...activeQuery.and);
    }

    const result = await payload.find({
      collection: collection as CollectionSlug,
      where: { and: conditions },
      limit: 1,
      depth: options.depth || 2,
      select: options.select,
    });

    return (result.docs[0] as T) || null;
  } catch (error) {
    console.error(`Error querying ${collection} by slug ${slug}:`, error);
    return null;
  }
}

/**
 * Search across multiple fields in a collection
 */
export async function searchCollection<T>(
  collection: string,
  query: string,
  searchFields: string[],
  options: {
    limit?: number;
    page?: number;
    depth?: number;
    additionalFilters?: any[];
    sort?: string;
  } = {}
): Promise<{ docs: T[]; totalDocs: number; hasNextPage: boolean }> {
  try {
    const payload = await getCachedPayload();

    // Build search conditions
    const searchConditions = searchFields.map((field) => ({
      [field]: { contains: query },
    }));

    // Build where clause
    const conditions = [{ or: searchConditions }];

    // Add additional filters
    if (options.additionalFilters && options.additionalFilters.length > 0) {
      conditions.push(...options.additionalFilters);
    }

    // Add active conditions
    const activeQuery = getDefaultActiveQuery(collection);
    conditions.push(...activeQuery.and);

    const result = await payload.find({
      collection: collection as CollectionSlug,
      where: { and: conditions },
      limit: options.limit || 20,
      page: options.page || 1,
      depth: options.depth || 1,
      sort: options.sort || "-createdAt",
    });

    return {
      docs: result.docs as T[],
      totalDocs: result.totalDocs,
      hasNextPage: result.hasNextPage,
    };
  } catch (error) {
    console.error(`Error searching ${collection}:`, error);
    return { docs: [], totalDocs: 0, hasNextPage: false };
  }
}

/**
 * Count documents in a collection with optional filters
 */
export async function countDocuments(
  collection: string,
  filters: any = {}
): Promise<number> {
  try {
    const payload = await getCachedPayload();

    let whereClause = filters;

    // Add active conditions if not already present
    if (!checkForActiveConditions(whereClause, collection)) {
      const activeQuery = getDefaultActiveQuery(collection);
      whereClause = {
        and: [
          ...activeQuery.and,
          ...(whereClause.and
            ? whereClause.and
            : whereClause
            ? [whereClause]
            : []),
        ],
      };
    }

    const result = await payload.count({
      collection: collection as CollectionSlug,
      where: whereClause,
    });

    return result.totalDocs;
  } catch (error) {
    console.error(`Error counting documents in ${collection}:`, error);
    return 0;
  }
}

/**
 * Get related documents based on shared field values
 */
export async function getRelatedDocuments<T>(
  collection: string,
  currentDocId: string,
  relationFields: { field: string; value: any }[],
  options: {
    limit?: number;
    depth?: number;
    sort?: string;
  } = {}
): Promise<T[]> {
  try {
    const payload = await getCachedPayload();

    // Build relation conditions
    const relationConditions = relationFields.map(({ field, value }) => ({
      [field]: Array.isArray(value)
        ? { in: value }
        : typeof value === "object" && value.id
        ? { equals: value.id }
        : { equals: value },
    }));

    // Build where clause
    const conditions = [
      { id: { not_equals: currentDocId } }, // Exclude current document
      { or: relationConditions }, // Match any of the relation fields
    ];

    // Add active conditions
    const activeQuery = getDefaultActiveQuery(collection);
    conditions.push(...activeQuery.and);

    const result = await payload.find({
      collection: collection as CollectionSlug,
      where: { and: conditions as any },
      limit: options.limit || 5,
      depth: options.depth || 1,
      sort: options.sort || "-createdAt",
    });

    return result.docs as T[];
  } catch (error) {
    console.error(`Error getting related documents from ${collection}:`, error);
    return [];
  }
}

// Legacy compatibility - keep the old function name but with a deprecation warning
export const buildBaseQuery = (additionalConditions: any[] = []) => {
  console.warn(
    "buildBaseQuery is deprecated. Use buildCollectionQuery instead."
  );
  return {
    and: [
      { "publishingSettings.status": { equals: "published" } },
      ...additionalConditions,
    ],
  };
};
