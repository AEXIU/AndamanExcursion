// services/api/activities.ts
import { Activity } from "@payload-types";

const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";
const NEXT_API_BASE = "/api"; // Next.js API routes

export const activityApi = {
  // Get all activities
  async getAll(): Promise<Activity[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/activities?sort=-status.priority&limit=100`
      );
      if (!response.ok) throw new Error("Failed to fetch activities");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },

  // Get activities by category
  async getByCategory(categoryId: string): Promise<Activity[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/activities?where[coreInfo.category][in]=${categoryId}&sort=-status.priority&limit=100`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch activities by category`);
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error(`Error fetching activities by category:`, error);
      return [];
    }
  },

  // Get activities by location
  async getByLocation(locationId: string): Promise<Activity[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/activities?where[coreInfo.location][in]=${locationId}&sort=-status.priority&limit=100`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch activities by location`);
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error(`Error fetching activities by location:`, error);
      return [];
    }
  },

  // Search activities with filters
  async search(params: {
    activityType?: string;
    location?: string;
    date?: string;
    time?: string;
    adults?: number;
    children?: number;
    infants?: number;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.activityType) {
        queryParams.append("activityType", params.activityType);
      }

      if (params.location) {
        queryParams.append("location", params.location);
      }

      if (params.date) {
        queryParams.append("date", params.date);
      }

      if (params.time) {
        queryParams.append("time", params.time);
      }

      if (params.adults) {
        queryParams.append("adults", params.adults.toString());
      }

      if (params.children) {
        queryParams.append("children", params.children.toString());
      }

      if (params.infants) {
        queryParams.append("infants", params.infants.toString());
      }

      if (params.page) {
        queryParams.append("page", params.page.toString());
      }

      if (params.limit) {
        queryParams.append("limit", params.limit.toString());
      }

      // Make the API request to our consolidated Next.js API route
      const response = await fetch(
        `${NEXT_API_BASE}/activities?action=search&${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`Failed to search activities: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error searching activities:", error);
      return [];
    }
  },

  // Get activity by slug
  async getBySlug(slug: string): Promise<Activity | null> {
    try {
      const response = await fetch(
        `${API_BASE}/api/activities?where[slug][equals]=${slug}&limit=1`
      );
      if (!response.ok) throw new Error(`Failed to fetch activity by slug`);
      const data = await response.json();
      return data.docs[0] || null;
    } catch (error) {
      console.error(`Error fetching activity by slug:`, error);
      return null;
    }
  },

  // Get available time slots for category and location combination
  async getAvailableTimesByCategory(
    categorySlug: string,
    locationSlug: string
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `${NEXT_API_BASE}/activities?action=available-times&category=${categorySlug}&location=${locationSlug}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch available times: ${response.status}`);
      }
      
      const data = await response.json();
      return data.timeSlots || [];
    } catch (error) {
      console.error("Error fetching available times by category:", error);
      return [];
    }
  },
};
