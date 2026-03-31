// src/services/api/boatRoutes
import { BoatRoute } from "@payload-types";

const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export const boatRouteApi = {
  // Get all active boat routes
  async getActive(): Promise<BoatRoute[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/boat-routes?where[isActive][equals]=true&sort=sortOrder&limit=100`
      );
      if (!response.ok) throw new Error("Failed to fetch boat routes");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching boat routes:", error);
      return [];
    }
  },

  // Get boat routes by from location
  async getByFromLocation(fromLocationSlug: string): Promise<BoatRoute[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/boat-routes?where[fromLocation.slug][equals]=${fromLocationSlug}&where[isActive][equals]=true&sort=sortOrder&limit=100&depth=2`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch routes from ${fromLocationSlug}`);
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error(`Error fetching routes from ${fromLocationSlug}:`, error);
      return [];
    }
  },

  // Get single boat route by ID
  async getById(id: string): Promise<BoatRoute | null> {
    try {
      const response = await fetch(`${API_BASE}/api/boat-routes/${id}?depth=2`);
      if (!response.ok) throw new Error("Failed to fetch boat route");
      return await response.json();
    } catch (error) {
      console.error("Error fetching boat route:", error);
      return null;
    }
  },

  // Get all boat routes with full details
  async getAllWithDetails(): Promise<BoatRoute[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/boat-routes?where[isActive][equals]=true&sort=sortOrder&limit=100&depth=2`
      );
      if (!response.ok) throw new Error("Failed to fetch boat routes");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching boat routes with details:", error);
      return [];
    }
  },
};

// Export the direct function for server components
export const getActiveBoatRoutes = boatRouteApi.getActive;
