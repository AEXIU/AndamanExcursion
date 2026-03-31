
import { Activity, ActivityCategory } from "@payload-types";
import { getCachedPayload } from "../base/client";
import { queryCollection } from "../base/queries";

/**
 * Activity Services
 * ----------------
 * Handle all activity-related operations
 */

export const activityService = {
  // Get all active activities
  async getAll(): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      depth: 2, // Include relations
    });
    return result.docs;
  },

  // Get featured activities
  async getFeatured(limit: number = 6): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "status.isFeatured": { equals: true },
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      limit,
      depth: 2,
    });
    return result.docs;
  },

  // Search activities with filters
  async search(filters: {
    category?: string;
    location?: string;
    date?: string;
    time?: string;
    passengers?: number;
    limit?: number;
    page?: number;
    query?: string;
  }): Promise<{
    activities: Activity[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const payload = await getCachedPayload();

      // Build where clause
      const whereClause: any = {
        "status.isActive": { equals: true },
      };

      // Add text search
      if (filters.query) {
        whereClause.or = [
          { title: { contains: filters.query } },
          { "content.description": { contains: filters.query } },
          { "content.shortDescription": { contains: filters.query } },
        ];
      }

      // Add category filter
      if (filters.category && filters.category !== "all") {
        whereClause["coreInfo.category"] = { in: [filters.category] };
      }

      // Add location filter
      if (filters.location && filters.location !== "all") {
        whereClause["coreInfo.location"] = { in: [filters.location] };
      }

      // Add capacity filter based on passengers
      if (filters.passengers) {
        whereClause["coreInfo.maxCapacity"] = {
          greater_than_equal: filters.passengers,
        };
      }

      const result = await payload.find({
        collection: "activities",
        where: whereClause,
        limit: filters.limit || 12,
        page: filters.page || 1,
        sort: "-status.priority",
        depth: 2,
      });

      return {
        activities: result.docs as Activity[],
        totalCount: result.totalDocs,
        hasMore: result.hasNextPage,
      };
    } catch (error) {
      console.error("Error searching activities:", error);
      return { activities: [], totalCount: 0, hasMore: false };
    }
  },

  // Get activity by slug
  async getBySlug(slug: string): Promise<Activity | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "activities",
        where: {
          slug: { equals: slug },
          "status.isActive": { equals: true },
        },
        limit: 1,
        depth: 2,
      });
      return (result.docs[0] as Activity) || null;
    } catch (error) {
      console.error(`Error fetching activity by slug ${slug}:`, error);
      return null;
    }
  },

  // Get activity by ID
  async getById(id: string): Promise<Activity | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "activities",
        id,
        depth: 2,
      });
      return result as Activity;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      return null;
    }
  },

  // Get activities by category
  async getByCategory(
    categoryId: string,
    limit: number = 10
  ): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "coreInfo.category": { in: [categoryId] },
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      limit,
      depth: 2,
    });
    return result.docs;
  },

  // Get activities by category slug
  async getByCategorySlug(
    categorySlug: string,
    limit: number = 10
  ): Promise<Activity[]> {
    try {
      const payload = await getCachedPayload();

      // First get the category by slug
      const categoryResult = await payload.find({
        collection: "activity-categories",
        where: { slug: { equals: categorySlug } },
        limit: 1,
      });

      if (!categoryResult.docs[0]) {
        return [];
      }

      return this.getByCategory(categoryResult.docs[0].id, limit);
    } catch (error) {
      console.error(
        `Error getting activities by category slug ${categorySlug}:`,
        error
      );
      return [];
    }
  },

  // Get activities by location
  async getByLocation(
    locationId: string,
    limit: number = 10
  ): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "coreInfo.location": { in: [locationId] },
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      limit,
      depth: 2,
    });
    return result.docs;
  },

  // Get activities by location slug
  async getByLocationSlug(
    locationSlug: string,
    limit: number = 10
  ): Promise<Activity[]> {
    try {
      const payload = await getCachedPayload();

      // First get the location by slug
      const locationResult = await payload.find({
        collection: "locations",
        where: { slug: { equals: locationSlug } },
        limit: 1,
      });

      if (!locationResult.docs[0]) {
        return [];
      }

      return this.getByLocation(locationResult.docs[0].id, limit);
    } catch (error) {
      console.error(
        `Error getting activities by location slug ${locationSlug}:`,
        error
      );
      return [];
    }
  },

  // Get popular activities
  async getPopular(limit: number = 8): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "status.isPopular": { equals: true },
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      limit,
      depth: 2,
    });
    return result.docs;
  },

  // Get activities by multiple IDs
  async getByIds(ids: string[]): Promise<Activity[]> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "activities",
        where: {
          and: [{ id: { in: ids } }, { "status.isActive": { equals: true } }],
        },
        depth: 2,
      });
      return result.docs as Activity[];
    } catch (error) {
      console.error("Error getting activities by IDs:", ids, error);
      return [];
    }
  },
};

/**
 * Activity Category Services
 * -------------------------
 */

export const activityCategoryService = {
  async getAll(): Promise<ActivityCategory[]> {
    const result = await queryCollection<ActivityCategory>(
      "activity-categories",
      {
        sort: "priority",
      }
    );
    return result.docs;
  },

  async getActive(): Promise<ActivityCategory[]> {
    const result = await queryCollection<ActivityCategory>(
      "activity-categories",
      {
        where: { isActive: { equals: true } },
        sort: "priority",
      }
    );
    return result.docs;
  },

  async getById(id: string): Promise<ActivityCategory | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "activity-categories",
        id,
      });
      return result as ActivityCategory;
    } catch (error) {
      console.error(`Error fetching activity category ${id}:`, error);
      return null;
    }
  },

  async getBySlug(slug: string): Promise<ActivityCategory | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "activity-categories",
        where: { slug: { equals: slug } },
        limit: 1,
      });
      return (result.docs[0] as ActivityCategory) || null;
    } catch (error) {
      console.error(`Error fetching activity category by slug ${slug}:`, error);
      return null;
    }
  },

  async getByIds(ids: string[]): Promise<ActivityCategory[]> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "activity-categories",
        where: { id: { in: ids } },
      });
      return result.docs as ActivityCategory[];
    } catch (error) {
      console.error("Error getting activity categories by IDs:", ids, error);
      return [];
    }
  },

  async getFeatured(limit: number = 6): Promise<ActivityCategory[]> {
    const result = await queryCollection<ActivityCategory>(
      "activity-categories",
      {
        where: {
          isFeatured: { equals: true },
          isActive: { equals: true },
        },
        sort: "priority",
        limit,
      }
    );
    return result.docs;
  },
};
