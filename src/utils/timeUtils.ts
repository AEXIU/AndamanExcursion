/**
 * Converts a time string to a standardized format (e.g., "11:00 AM")
 * Handles various input formats like "11:00", "11-00", "11:00AM", etc.
 */
export function standardizeTimeFormat(timeStr: string): string {
  // If already in standard format (e.g., "11:00 AM"), return as is
  if (/^\d{1,2}:\d{2}\s*[AP]M$/i.test(timeStr)) {
    return timeStr.replace(/([AP]M)$/i, " $1").trim();
  }

  // Handle formats like "11-00" or "11-00AM"
  if (timeStr.includes("-")) {
    timeStr = timeStr.replace("-", ":");
  }

  // Extract hours, minutes, and period
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*([AP]M)?/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? match[2] : "00";
  let period = match[3]?.toUpperCase() || "";

  // If no period specified, infer based on 24-hour format
  if (!period) {
    if (hours >= 12) {
      period = "PM";
      if (hours > 12) hours -= 12;
    } else {
      period = "AM";
      if (hours === 0) hours = 12;
    }
  }

  return `${hours}:${minutes} ${period}`;
}

/**
 * Converts a time string to 24-hour format number (e.g., "11:00 AM" -> 1100)
 * Useful for time comparisons
 */
export function convertTo24Hour(timeStr: string): number {
  const standardTime = standardizeTimeFormat(timeStr);
  const match = standardTime.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 100 + minutes;
}

/**
 * Parses a time filter string and returns start and end times in 24-hour format
 * Handles ranges like "11:00 AM-1:00 PM" and single times like "11:00 AM"
 */
export function parseTimeFilter(
  filter: string
): { start: number; end: number } | null {
  // If filter is a range like "11:00 AM-1:00 PM"
  if (filter.includes("-")) {
    const [startStr, endStr] = filter.split("-");
    const start = convertTo24Hour(startStr.trim());
    const end = convertTo24Hour(endStr.trim());
    return { start, end };
  }

  // If filter is a single time like "11:00 AM"
  const time = convertTo24Hour(filter);
  // Create a range of +/- 1 hour
  return { start: time - 100, end: time + 100 };
}

/**
 * Formats a time string for display in the UI
 */
export function formatTimeForDisplay(timeStr: string): string {
  return standardizeTimeFormat(timeStr);
}

/**
 * Converts a slot ID (e.g., "11-00") to a standardized time string (e.g., "11:00 AM")
 */
export function slotIdToTimeString(slotId: string): string {
  // Replace hyphens with colons
  const timeStr = slotId.replace(/-/g, ":");
  return standardizeTimeFormat(timeStr);
}

/**
 * Converts a standardized time string (e.g., "11:00 AM") to a slot ID (e.g., "11-00")
 */
export function timeStringToSlotId(timeStr: string): string {
  const standardTime = standardizeTimeFormat(timeStr);
  const match = standardTime.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "";

  const hours = match[1].padStart(2, "0");
  const minutes = match[2];

  return `${hours}-${minutes}`;
}

/**
 * Converts a time string (e.g., "11:00") to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}
