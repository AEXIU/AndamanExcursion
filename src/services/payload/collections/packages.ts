import { getCachedPayload } from "../base/client";
import { getPublishedQuery } from "../base/utils";

/**
 * Package Services
 * ---------------
 * Handle all package-related operations
 */

export interface PackageOptions {
  categorySlug?: string;
  categoryId?: string;
  period?: string;
  featured?: boolean;
  limit?: number;
  depth?: number;
  slug?: string;
  id?: string;
}

export const packageService = {
  async getAll(options: PackageOptions = {}) {
    const {
      categorySlug,
      categoryId,
      period,
      featured,
      limit = 100,
      depth = 2,
      slug,
      id,
    } = options;

    try {
      const payload = await getCachedPayload();
      const conditions: any[] = [];

      // Handle specific package by ID
      if (id) {
        conditions.push({ id: { equals: id } });
      }

      // Handle specific package by slug
      if (slug) {
        conditions.push({ slug: { equals: slug } });
      }

      // Handle category filtering by slug
      if (categorySlug) {
        // First get the category by slug
        const categoryQuery = await payload.find({
          collection: "package-categories",
          where: {
            and: [
              { slug: { equals: categorySlug } },
              { "displaySettings.isActive": { equals: true } },
            ],
          },
          limit: 1,
        });

        if (categoryQuery.docs[0]) {
          conditions.push({
            "coreInfo.category": { equals: categoryQuery.docs[0].id },
          });
        } else {
          return []; // Category not found, return empty
        }
      }

      // Handle category filtering by ID
      if (categoryId) {
        conditions.push({
          "coreInfo.category": { equals: categoryId },
        });
      }

      // Handle period filtering
      if (period && period !== "all") {
        const periodQuery = await payload.find({
          collection: "package-periods",
          where: {
            or: [{ value: { equals: period } }, { id: { equals: period } }],
          },
          limit: 1,
        });

        if (periodQuery.docs[0]) {
          conditions.push({
            "coreInfo.period": { equals: periodQuery.docs[0].id },
          });
        }
      }

      // Handle featured filtering
      if (featured !== undefined) {
        conditions.push({ "featuredSettings.featured": { equals: featured } });
      }

      const { docs } = await payload.find({
        collection: "packages",
        where: getPublishedQuery("packages", conditions),
        sort: featured ? "featuredSettings.featuredOrder" : "title",
        limit,
        depth,
      });

      return docs;
    } catch (error) {
      console.error("Error getting packages:", error);
      return [];
    }
  },

  async getFeatured(limit: number = 3) {
    return this.getAll({ featured: true, limit });
  },

  async getBySlug(slug: string, categorySlug?: string) {
    const options: PackageOptions = { slug, limit: 1, depth: 3 };
    if (categorySlug) {
      options.categorySlug = categorySlug;
    }
    const packages = await this.getAll(options);
    return packages[0] || null;
  },

  async getById(id: string) {
    const packages = await this.getAll({ id, limit: 1, depth: 3 });
    return packages[0] || null;
  },

  async getByCategory(categoryId: string, limit: number = 10) {
    return this.getAll({ categoryId, limit });
  },

  async getByCategorySlug(categorySlug: string, limit: number = 10) {
    return this.getAll({ categorySlug, limit });
  },

  async search(
    query: string,
    options: Omit<PackageOptions, "slug" | "id"> = {}
  ) {
    try {
      const payload = await getCachedPayload();
      const { limit = 20, depth = 2, ...filterOptions } = options;

      // Build base conditions for other filters
      const baseConditions: any[] = [];

      if (filterOptions.categoryId) {
        baseConditions.push({
          "coreInfo.category": { equals: filterOptions.categoryId },
        });
      }

      if (filterOptions.featured !== undefined) {
        baseConditions.push({
          "featuredSettings.featured": { equals: filterOptions.featured },
        });
      }

      // Add search conditions
      const searchConditions = [
        { title: { contains: query } },
        { "descriptions.description": { contains: query } },
        { "descriptions.shortDescription": { contains: query } },
      ];

      const conditions =
        baseConditions.length > 0
          ? [...baseConditions, { or: searchConditions }]
          : [{ or: searchConditions }];

      const { docs, totalDocs } = await payload.find({
        collection: "packages",
        where: getPublishedQuery("packages", conditions),
        limit,
        depth,
        sort: "-createdAt",
      });

      return {
        packages: docs,
        totalCount: totalDocs,
      };
    } catch (error) {
      console.error("Error searching packages:", error);
      return {
        packages: [],
        totalCount: 0,
      };
    }
  },
};

/**
 * Package Category Services
 * ------------------------
 */

export const packageCategoryService = {
  async getAll() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-categories",
        where: { "displaySettings.isActive": { equals: true } },
        sort: "displaySettings.order",
      });
      return docs;
    } catch (error) {
      console.error("Error getting package categories:", error);
      return [];
    }
  },

  async getBySlug(slug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-categories",
        where: {
          and: [
            { slug: { equals: slug } },
            { "displaySettings.isActive": { equals: true } },
          ],
        },
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error("Error getting package category by slug:", error);
      return null;
    }
  },

  async getById(id: string) {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "package-categories",
        id,
        depth: 2,
      });
      return result;
    } catch (error) {
      console.error("Error getting package category by ID:", id, error);
      return null;
    }
  },
};

/**
 * Package Period Services
 * ----------------------
 */

export const packagePeriodService = {
  async getAll() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-periods",
        where: { isActive: { equals: true } },
        sort: "order",
      });
      return docs;
    } catch (error) {
      console.error("Error getting package periods:", error);
      return [];
    }
  },

  async getById(id: string) {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "package-periods",
        id,
      });
      return result;
    } catch (error) {
      console.error("Error getting package period by ID:", id, error);
      return null;
    }
  },

  async getByValue(value: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-periods",
        where: {
          and: [{ value: { equals: value } }, { isActive: { equals: true } }],
        },
        limit: 1,
      });
      return docs[0] || null;
    } catch (error) {
      console.error("Error getting package period by value:", value, error);
      return null;
    }
  },
};
