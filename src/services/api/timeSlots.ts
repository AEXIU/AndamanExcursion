// services/api/timeSlots.ts

/*
 time slots have activity which is incorrect (as activity time slots are different than the ones defined here for ferries)
 boat time slots are different as well
 packages have day periods and not time slots
 so, effectively, this time slot service layer is only fetching time slots necessary and required for ferry booking
*/

import { TimeSlot } from "@payload-types";

const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export const timeSlotApi = {
  // Get all time slots
  async getAll(): Promise<TimeSlot[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/time-slots?sort=startTime&limit=100`
      );
      if (!response.ok) throw new Error("Failed to fetch time slots");
      const data = await response.json();
      // The API should return them sorted, but ensure proper sorting
      return data.docs.sort((a: TimeSlot, b: TimeSlot) => {
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (error) {
      console.error("Error fetching time slots:", error);
      return [];
    }
  },

  // Get time slots by type
  async getByType(type: string): Promise<TimeSlot[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/time-slots?where[type][equals]=${type}&sort=startTime&limit=100`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${type} time slots`);
      const data = await response.json();

      // FIXED: Apply the same sorting logic
      return data.docs.sort((a: TimeSlot, b: TimeSlot) => {
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (error) {
      console.error(`Error fetching ${type} time slots:`, error);
      return [];
    }
  },

  // Get activity time slots
  async getForActivities(): Promise<TimeSlot[]> {
    return this.getByType("activity");
  },

  // Get ferry time slots
  async getForFerries(): Promise<TimeSlot[]> {
    return this.getByType("ferry");
  },
};

// Helper function to convert time strings to minutes for sorting
function convertTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;

  // Handle formats like "09:00 AM", "3:30 PM", etc.
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  // Convert to 24-hour format
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}
