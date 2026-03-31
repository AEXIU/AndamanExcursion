import { getCachedPayload } from "../base/client";

/**
 * Navigation Services
 * --------------------
 * Handle all the navigation data using payload local API
 */

export const navigationService = {
  /**
   * Get the main navigation configuration
   */
  async getMainNavigation() {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findGlobal({
        slug: "navigation",
        depth: 2,
      });
      return result;
    } catch (error) {
      console.error("Error fetching navigation data:", error);
      return null;
    }
  },

  /**
   * Get active activity categories for navigation
   */
  async getActiveActivityCategories() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "activity-categories",
        where: {
          isActive: { equals: true }, // Get all active categories, including subcategories
        },
        sort: "sortOrder",
        limit: 50, // Increased limit to accommodate subcategories
        depth: 1, // Include parent category info for proper grouping
      });
      return docs;
    } catch (error) {
      console.error("Error fetching activity categories:", error);
      return [];
    }
  },

  /**
   * Get active package categories for navigation
   */
  async getActivePackageCategories() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-categories",
        where: {
          "displaySettings.isActive": { equals: true },
        },
        sort: "displaySettings.order",
        limit: 20,
        depth: 0,
      });
      return docs;
    } catch (error) {
      console.error("Error fetching package categories:", error);
      return [];
    }
  },
};

// Export individual category services for reuse
export const activityCategoryService = {
  async getAll() {
    return navigationService.getActiveActivityCategories();
  },

  async getBySlug(slug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "activity-categories",
        where: {
          and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
        },
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error(`Error fetching activity category by slug ${slug}:`, error);
      return null;
    }
  },
};

export const packageCategoryService = {
  async getAll() {
    return navigationService.getActivePackageCategories();
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
      console.error(`Error fetching package category by slug ${slug}:`, error);
      return null;
    }
  },
};
