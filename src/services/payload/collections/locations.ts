import { Location } from "@payload-types";
import { getCachedPayload } from "../base/client";
import { queryCollection } from "../base/queries";

/**
 * Location Services
 * ----------------
 * Handle all location-related operations
 */

export const locationService = {
  // Get all active locations
  async getAll(): Promise<Location[]> {
    const result = await queryCollection<Location>("locations", {
      sort: "priority",
    });
    return result.docs;
  },

  // Get locations by type
  async getByType(type: string): Promise<Location[]> {
    const result = await queryCollection<Location>("locations", {
      where: { type: { equals: type } },
      sort: "priority",
    });
    return result.docs;
  },

  // Get ferry ports specifically
  async getFerryPorts(): Promise<Location[]> {
    return this.getByType("ferry_port");
  },

  // Get activity locations
  async getActivityLocations(): Promise<Location[]> {
    return this.getByType("activity_location");
  },

  // Get boat departure points
  async getBoatDepartures(): Promise<Location[]> {
    return this.getByType("boat_departure");
  },

  // Get tourist attractions
  async getTouristAttractions(): Promise<Location[]> {
    return this.getByType("tourist_attraction");
  },

  // Get hotels/accommodations
  async getAccommodations(): Promise<Location[]> {
    return this.getByType("accommodation");
  },

  // Get location by ID
  async getById(id: string): Promise<Location | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "locations",
        id,
        depth: 1,
      });
      return result as Location;
    } catch (error) {
      console.error(`Error fetching location ${id}:`, error);
      return null;
    }
  },

  // Get location by slug
  async getBySlug(slug: string): Promise<Location | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "locations",
        where: { slug: { equals: slug } },
        limit: 1,
      });
      return (result.docs[0] as Location) || null;
    } catch (error) {
      console.error(`Error fetching location by slug ${slug}:`, error);
      return null;
    }
  },

  // Get locations by multiple IDs
  async getByIds(ids: string[]): Promise<Location[]> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "locations",
        where: {
          and: [{ id: { in: ids } }, { isActive: { equals: true } }],
        },
        depth: 1,
      });
      return result.docs as Location[];
    } catch (error) {
      console.error("Error getting locations by IDs:", ids, error);
      return [];
    }
  },

  // Get popular locations
  async getPopular(limit: number = 10): Promise<Location[]> {
    const result = await queryCollection<Location>("locations", {
      where: {
        isPopular: { equals: true },
        isActive: { equals: true },
      },
      sort: "-priority",
      limit,
    });
    return result.docs;
  },

  // Get featured locations
  async getFeatured(limit: number = 6): Promise<Location[]> {
    const result = await queryCollection<Location>("locations", {
      where: {
        isFeatured: { equals: true },
        isActive: { equals: true },
      },
      sort: "-priority",
      limit,
    });
    return result.docs;
  },

  // Search locations by name or description
  async search(
    query: string,
    options: {
      type?: string;
      limit?: number;
    } = {}
  ): Promise<Location[]> {
    try {
      const payload = await getCachedPayload();

      const whereClause: any = {
        and: [
          { isActive: { equals: true } },
          {
            or: [
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          },
        ],
      };

      // Add type filter if specified
      if (options.type) {
        whereClause.and.push({ type: { equals: options.type } });
      }

      const result = await payload.find({
        collection: "locations",
        where: whereClause,
        limit: options.limit || 20,
        sort: "priority",
      });

      return result.docs as Location[];
    } catch (error) {
      console.error("Error searching locations:", error);
      return [];
    }
  },

  // Get locations within a specific area/region
  async getByRegion(region: string): Promise<Location[]> {
    const result = await queryCollection<Location>("locations", {
      where: {
        region: { equals: region },
        isActive: { equals: true },
      },
      sort: "priority",
    });
    return result.docs;
  },
};
