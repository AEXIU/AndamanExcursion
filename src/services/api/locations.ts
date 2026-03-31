import { Location } from "@payload-types";

const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export const locationApi = {
  // Get all locations
  async getAll(): Promise<Location[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/locations?sort=priority&limit=100`
      );
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  },

  // Get locations by type
  async getByType(type: string): Promise<Location[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/locations?where[type][equals]=${type}&sort=priority&limit=100`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${type} locations`);
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error(`Error fetching ${type} locations:`, error);
      return [];
    }
  },

  // Get locations for activities
  async getForActivities(): Promise<Location[]> {
    return this.getByType("activity_location");
  },

  // Get locations for ferries
  async getForFerries(): Promise<Location[]> {
    return this.getByType("ferry_location");
  },
};

// Export the direct function for server components
export const getLocationsForActivities = locationApi.getForActivities;
