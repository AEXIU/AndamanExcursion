// services/api/activityCategories.ts
import { ActivityCategory } from "@payload-types";

const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export const activityCategoryApi = {
  // Get all active categories
  async getAll(): Promise<ActivityCategory[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/activity-categories?sort=priority&limit=100`
      );
      if (!response.ok) throw new Error("Failed to fetch activity categories");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching activity categories:", error);
      return [];
    }
  },

  // Get active categories only
  async getActive(): Promise<ActivityCategory[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/activity-categories?where[isActive][equals]=true&sort=priority&limit=100`
      );
      if (!response.ok)
        throw new Error("Failed to fetch active activity categories");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching active activity categories:", error);
      return [];
    }
  },

  // Get category by slug
  async getBySlug(slug: string): Promise<ActivityCategory | null> {
    try {
      const response = await fetch(
        `${API_BASE}/api/activity-categories?where[slug][equals]=${slug}&limit=1`
      );
      if (!response.ok) throw new Error("Failed to fetch activity category");
      const data = await response.json();
      return data.docs[0] || null;
    } catch (error) {
      console.error(
        `Error fetching activity category with slug ${slug}:`,
        error
      );
      return null;
    }
  },

  // Get featured categories
  async getFeatured(): Promise<ActivityCategory[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/activity-categories?where[isFeatured][equals]=true&where[isActive][equals]=true&sort=priority&limit=10`
      );
      if (!response.ok) throw new Error("Failed to fetch featured categories");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching featured activity categories:", error);
      return [];
    }
  },
};

// Export the direct function for server components
export const getActiveActivityCategories = activityCategoryApi.getActive;
