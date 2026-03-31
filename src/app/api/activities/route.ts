import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getCachedPayload } from "@/services/payload/base/client";
import { timeToMinutes } from "@/utils/timeUtils";

// Simple per-request cache to avoid repeated category slot fetches
const perRequestCache = new Map<string, any>();

// Simple in-memory cache with TTL to reduce DB load for time slots
type CacheEntry = { data: any; expiresAt: number };
const CACHE: Map<string, CacheEntry> = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCache(key: string) {
  const entry = CACHE.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  if (entry) CACHE.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  CACHE.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Set CORS headers
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    switch (action) {
      case "available-times":
        return await handleAvailableTimes(searchParams, headers);
      case "search":
        return await handleSearch(searchParams, headers);
      case "time-slots-filter":
        return await handleTimeSlotsFilter(searchParams, headers);
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: available-times, search, or time-slots-filter" },
          { status: 400, headers }
        );
    }
  } catch (error) {
    console.error("Activities API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleAvailableTimes(searchParams: URLSearchParams, headers: Headers) {
  const categorySlug = searchParams.get("category");
  const locationSlug = searchParams.get("location");

  // Validate required parameters
  if (!categorySlug || !locationSlug) {
    return NextResponse.json(
      {
        error: "Both category and location parameters are required",
        message: "Please provide both category and location slugs",
      },
      { status: 400, headers }
    );
  }

  const payload = await getPayload({ config: configPromise });

  // Query activities matching the category and location
  const activities = await payload.find({
    collection: "activities",
    where: {
      and: [
        {
          "coreInfo.category.slug": {
            equals: categorySlug,
          },
        },
        {
          "coreInfo.location.slug": {
            equals: locationSlug,
          },
        },
        {
          "status.isActive": {
            equals: true,
          },
        },
      ],
    },
    limit: 100,
  });

  // Extract unique time slots from matching activities
  const timeSlotSet = new Set<string>();
  const timeSlotDetails = new Map<string, any>();

  activities.docs.forEach((activity: any) => {
    // Check for time slots in coreInfo.defaultTimeSlots
    const defaultTimeSlots = activity.coreInfo?.defaultTimeSlots;

    if (defaultTimeSlots && Array.isArray(defaultTimeSlots)) {
      defaultTimeSlots.forEach((slot: any) => {
        if (slot.startTime && slot.endTime) {
          const slotKey = slot.startTime.replace(":", "-");
          timeSlotSet.add(slotKey);
          if (!timeSlotDetails.has(slotKey)) {
            timeSlotDetails.set(slotKey, {
              value: slotKey,
              label:
                slot.displayTime || `${slot.startTime} - ${slot.endTime}`,
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          }
        }
      });
    }
  });

  // Convert to array and sort by start time
  const timeSlots = Array.from(timeSlotSet)
    .map((key) => timeSlotDetails.get(key))
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by start time
      const timeA = a.startTime.replace(":", "");
      const timeB = b.startTime.replace(":", "");
      return parseInt(timeA) - parseInt(timeB);
    });

  return NextResponse.json({
    timeSlots,
    meta: {
      categorySlug,
      locationSlug,
      activitiesFound: activities.docs.length,
      uniqueTimeSlots: timeSlots.length,
    },
  }, { headers });
}

async function handleSearch(searchParams: URLSearchParams, headers: Headers) {
  const activityType = searchParams.get("activityType");
  const location = searchParams.get("location");
  const time = searchParams.get("time");

  // Validate required parameters - only activityType is required
  if (!activityType) {
    return NextResponse.json(
      { error: "Missing required parameter: activityType" },
      { status: 400, headers }
    );
  }

  // Get payload instance
  const payload = await getCachedPayload();

  // Find the category by slug to get its ID
  const categoryResults = await payload.find({
    collection: "activity-categories",
    where: {
      slug: {
        equals: activityType,
      },
    },
    limit: 1,
  });

  const categoryId = categoryResults.docs[0]?.id;

  if (!categoryId) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404, headers }
    );
  }

  // Build the where clause conditions
  const conditions: any[] = [
    {
      "coreInfo.category.id": {
        equals: categoryId, // Search only in the specified category
      },
    },
    {
      "status.isActive": { equals: true },
    },
  ];

  // Add location filter only if provided
  if (location) {
    // Find the location by slug to get its ID
    const locationResults = await payload.find({
      collection: "locations",
      where: {
        slug: {
          equals: location,
        },
      },
      limit: 1,
    });

    const locationId = locationResults.docs[0]?.id;

    if (!locationId) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404, headers }
      );
    }

    conditions.push({
      "coreInfo.location.id": {
        in: [locationId],
      },
    });
  }

  const whereClause = {
    and: conditions,
  };

  // Search for activities
  const activities = await payload.find({
    collection: "activities",
    where: whereClause,
    limit: 50, // Reasonable limit
    sort: "-status.priority",
    depth: 2, // Include related data
  });

  let filteredActivities = activities.docs;

  // Filter activities by time availability using simplified architecture
  if (time && time !== "") {
    const timeFilteredActivities = [];

    for (const activity of filteredActivities) {
      let isTimeAvailable = false;

      // Check activity's direct time slot relationships (simplified architecture)
      const activityTimeSlots = activity.coreInfo?.defaultTimeSlots;

      if (activityTimeSlots?.length) {
        // Check if the selected time matches any of the activity's time slots
        isTimeAvailable = activityTimeSlots.some((slot: any) => {
          // Handle both string and object slot types
          if (typeof slot === "string") {
            return slot === time;
          }

          // For objects, check if time falls within the slot range
          if (slot.startTime && slot.endTime) {
            const timeInMinutes = timeToMinutes(time.replace("-", ":"));
            const startMinutes = timeToMinutes(slot.startTime);
            const endMinutes = timeToMinutes(slot.endTime);
            return (
              timeInMinutes >= startMinutes && timeInMinutes <= endMinutes
            );
          }

          // Fallback: match by start time
          return slot.startTime && slot.startTime.replace(":", "-") === time;
        });
      } else {
        // Fall back to category-based time slot checking
        try {
          // Get time slots for the category (cached per request)
          const cacheKey = `category-slots:${categoryId}`;
          let categoryTimeSlots = perRequestCache.get(cacheKey);
          if (!categoryTimeSlots) {
            categoryTimeSlots = await payload.find({
              collection: "activity-time-slots",
              where: {
                and: [
                  { isActive: { equals: true } },
                  { activityTypes: { equals: categoryId } },
                ],
              },
              depth: 0,
            });
            perRequestCache.set(cacheKey, categoryTimeSlots);
          }

          if (categoryTimeSlots.docs.length > 0) {
            // Check if the selected time falls within any of the category's time slots
            const timeInMinutes = timeToMinutes(time.replace("-", ":"));

            isTimeAvailable = categoryTimeSlots.docs.some(
              (slot: { startTime: string; endTime: string }) => {
                const startMinutes = timeToMinutes(slot.startTime);
                const endMinutes = timeToMinutes(slot.endTime);
                return (
                  timeInMinutes >= startMinutes && timeInMinutes <= endMinutes
                );
              }
            );
          } else {
            // No time restrictions for this category, allow all times
            isTimeAvailable = true;
          }
        } catch (error) {
          console.error(
            `Error checking time slots for activity ${activity.title}:`,
            error
          );
          // In case of error, include the activity (fail open)
          isTimeAvailable = true;
        }
      }

      if (isTimeAvailable) {
        timeFilteredActivities.push(activity);
      }
    }

    filteredActivities = timeFilteredActivities;
  }

  return NextResponse.json(filteredActivities, { headers });
}

async function handleTimeSlotsFilter(searchParams: URLSearchParams, headers: Headers) {
  const payload = await getCachedPayload();
  const categorySlug = searchParams.get("categorySlug");
  const timeSlotIds = searchParams.get("timeSlotIds");

  let result;

  if (timeSlotIds) {
    // Get specific time slots by IDs
    const ids = timeSlotIds.split(",").filter(Boolean);
    const cacheKey = `ids:${ids.sort().join(",")}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        count: cached.length,
      }, { headers });
    }
    result = await payload.find({
      collection: "activity-time-slots",
      where: {
        and: [{ isActive: { equals: true } }, { id: { in: ids } }],
      },
      sort: "sortOrder",
      depth: 2,
    });
    setCache(cacheKey, result.docs);
  } else if (categorySlug) {
    // Get time slots for specific category
    const cacheKey = `category:${categorySlug}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        count: cached.length,
      }, { headers });
    }
    // Since we removed activityTypes relationship, we'll return all active time slots
    // The frontend will filter them based on activity's defaultTimeSlots
    result = await payload.find({
      collection: "activity-time-slots",
      where: {
        isActive: { equals: true },
      },
      sort: "sortOrder",
      depth: 2,
    });
    setCache(cacheKey, result.docs);
  } else {
    // Get all active time slots
    const cacheKey = `all`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        count: cached.length,
      }, { headers });
    }
    result = await payload.find({
      collection: "activity-time-slots",
      where: {
        isActive: { equals: true },
      },
      sort: "sortOrder",
      depth: 2,
    });
    setCache(cacheKey, result.docs);
  }

  return NextResponse.json({
    success: true,
    data: result.docs,
    count: result.docs.length,
  }, { headers });
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
