import type { ActivitySearchParams } from "@/store/ActivityStoreRQ";
import { Activity, Media } from "@payload-types";

// Types for transformed data
export interface TransformedActivityCard {
  id: string;
  title: string;
  description: string;
  media: Array<{ src: string | Media; alt: string; isVideo?: boolean }>;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  type: string;
  duration: string;
  href: string;
  activityOptions: TransformedActivityOption[];
  availableTimeSlots: TimeSlot[];
  onSelectActivity?: (activityId: string, optionId: string) => void;
  location?: string;
  totalGuests: number;
  timeSlots: string[];
}

export interface TransformedActivityOption {
  id: string;
  type: string;
  description: string;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  seatsLeft: number;
  amenities: any[];
  media?: (string | Media)[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  isAvailable: boolean;
}

// Helper function to safely extract media URL
function extractMediaUrl(mediaItem: any): string | Media {
  console.log("Extracting media URL from:", mediaItem);

  // If it's already a string URL
  if (typeof mediaItem === "string") {
    return mediaItem;
  }

  // If it's a Media object with url property
  if (mediaItem && typeof mediaItem === "object" && mediaItem.url) {
    return mediaItem;
  }

  // If it has nested media property
  if (mediaItem && mediaItem.media) {
    if (typeof mediaItem.media === "string") {
      return mediaItem.media;
    }
    if (mediaItem.media && mediaItem.media.url) {
      return mediaItem.media;
    }
  }

  // If it has image property (legacy support)
  if (mediaItem && mediaItem.image) {
    if (typeof mediaItem.image === "string") {
      return mediaItem.image;
    }
    if (mediaItem.image && mediaItem.image.url) {
      return mediaItem.image;
    }
  }

  console.warn("Could not extract media URL from:", mediaItem);
  return "/images/placeholder.png";
}

// Helper function to determine if media is video
function isVideoMedia(mediaItem: any): boolean {
  // Check if it's explicitly marked as video
  if (mediaItem && mediaItem.isVideo) return true;

  // Check mediaType property
  if (mediaItem && mediaItem.mediaType === "video") return true;

  // Check mimeType
  if (mediaItem && mediaItem.mimeType?.startsWith("video/")) return true;

  // Check nested media object
  if (mediaItem && mediaItem.media) {
    if (mediaItem.media.mediaType === "video") return true;
    if (mediaItem.media.mimeType?.startsWith("video/")) return true;
  }

  // Check file extension if it's a string URL
  if (typeof mediaItem === "string") {
    return /\.(mp4|webm|ogg|avi|mov|wmv)$/i.test(mediaItem);
  }

  // Check URL property for file extension
  if (mediaItem && mediaItem.url && typeof mediaItem.url === "string") {
    return /\.(mp4|webm|ogg|avi|mov|wmv)$/i.test(mediaItem.url);
  }

  return false;
}

// FIXED: Transform activity media function
export function transformActivityMedia(
  activity: Activity
): Array<{ src: string | Media; alt: string; isVideo?: boolean }> {
  console.log("Transforming activity media for:", activity.title);
  console.log("Activity media structure:", activity.media);

  const media: Array<{ src: string | Media; alt: string; isVideo?: boolean }> =
    [];

  // Handle featured image first
  if (activity.media?.featuredImage) {
    console.log("Processing featured image:", activity.media.featuredImage);

    const featuredSrc = extractMediaUrl(activity.media.featuredImage);
    media.push({
      src: featuredSrc,
      alt: activity.title || "Activity featured image",
      isVideo: isVideoMedia(activity.media.featuredImage),
    });
  }

  // Handle gallery items
  if (activity.media?.gallery && Array.isArray(activity.media.gallery)) {
    console.log("Processing gallery items:", activity.media.gallery);

    activity.media.gallery.forEach((galleryItem: any, index: number) => {
      console.log(`Processing gallery item ${index}:`, galleryItem);

      // Extract the media source
      const mediaSrc = extractMediaUrl(galleryItem);

      // Only add if we got a valid source
      if (mediaSrc && mediaSrc !== "/images/placeholder.png") {
        const altText =
          galleryItem.alt ||
          (galleryItem.media && galleryItem.media.alt) ||
          (galleryItem.image && galleryItem.image.alt) ||
          `Activity gallery image ${index + 1}`;

        media.push({
          src: mediaSrc,
          alt: altText,
          isVideo: isVideoMedia(galleryItem),
        });

        console.log(`Added gallery item ${index}:`, {
          src: mediaSrc,
          alt: altText,
          isVideo: isVideoMedia(galleryItem),
        });
      } else {
        console.warn(`Skipped invalid gallery item ${index}:`, galleryItem);
      }
    });
  }

  // Ensure we always return at least the featured image
  if (media.length === 0) {
    console.warn("No media found, using placeholder");
    media.push({
      src: "/images/placeholder.png",
      alt: activity.title || "Activity placeholder image",
      isVideo: false,
    });
  }

  console.log("Final transformed media:", media);
  return media;
}

// Utility functions for price calculations
export function calculateTotalPrice(
  basePrice: number,
  searchParams: ActivitySearchParams
): number {
  return basePrice * searchParams.adults; // COMMENTED OUT: Only adults counted for activities
}

// Memoized helper to generate stable option IDs
const optionIdCache = new Map<string, string>();
export function getStableOptionId(activityId: string, index: number): string {
  const key = `${activityId}-${index}`;
  if (!optionIdCache.has(key)) {
    optionIdCache.set(key, `${activityId}-option-${index}`);
  }
  return optionIdCache.get(key)!;
}

// Transform activity option media (pure function)
export function transformActivityOptionMedia(
  optionMedia: any[]
): (string | Media)[] {
  if (!optionMedia || !Array.isArray(optionMedia)) {
    return [];
  }

  return optionMedia.map((mediaItem) => extractMediaUrl(mediaItem));
}

// Transform activity options (pure function)
export function transformActivityOptions(
  options: any[],
  activityId: string,
  searchParams: ActivitySearchParams
): TransformedActivityOption[] {
  return options.map((option, index) => {
    const optionCurrentPrice = option.discountedPrice || option.price;
    const optionOriginalPrice = option.discountedPrice
      ? option.price
      : undefined;

    // Transform option media/images
    const optionMedia = transformActivityOptionMedia(
      option.media || option.images || option.gallery || []
    );

    return {
      id: option.id || getStableOptionId(activityId, index),
      type: option.optionTitle || "Standard Option",
      description: option.optionDescription || "",
      price: optionCurrentPrice,
      totalPrice: calculateTotalPrice(optionCurrentPrice, searchParams),
      originalPrice: optionOriginalPrice,
      originalTotalPrice: optionOriginalPrice
        ? calculateTotalPrice(optionOriginalPrice, searchParams)
        : undefined,
      seatsLeft: option.maxCapacity,
      amenities: [],
      media: optionMedia,
    };
  });
}

// Helper to parse duration string like "2 hours" -> 2
export function parseDuration(duration: string): number {
  const match = duration.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 2; // default to 2 hours
}

// Helper to add hours to time string
export function addHours(timeStr: string, hours: number): string {
  const [hour, minute] = timeStr.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + hours * 60;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, "0")}:${newMinute
    .toString()
    .padStart(2, "0")}`;
}

// Get time slots for activity (simplified)
export function getActivityTimeSlots(activity: Activity): TimeSlot[] {
  if (activity.coreInfo?.defaultTimeSlots?.length) {
    return activity.coreInfo.defaultTimeSlots.map((slot) => ({
      id: typeof slot === "string" ? slot : slot.id,
      startTime: typeof slot === "string" ? slot : slot.startTime,
      endTime: typeof slot === "string" ? slot : slot.endTime || slot.startTime,
      displayTime:
        typeof slot === "string"
          ? slot
          : `${slot.startTime} - ${slot.endTime || slot.startTime}`,
      isAvailable: typeof slot === "string" ? true : slot.isActive !== false,
    }));
  }
  return [];
}

// Main transformation function (pure)
export function transformActivityToCard(
  activity: Activity,
  searchParams: ActivitySearchParams,
  handleActivitySelection: (activityId: string, optionId: string) => void
): TransformedActivityCard {
  const basePrice = activity.coreInfo?.basePrice || 0;
  const discountedPrice = activity.coreInfo?.discountedPrice;
  const currentPrice = discountedPrice || basePrice;

  const totalPrice = calculateTotalPrice(currentPrice, searchParams);
  const originalTotalPrice = discountedPrice
    ? calculateTotalPrice(basePrice, searchParams)
    : undefined;

  const transformedOptions = transformActivityOptions(
    activity.activityOptions || [],
    activity.id,
    searchParams
  );

  const media = transformActivityMedia(activity);
  const availableTimeSlots = getActivityTimeSlots(activity);

  return {
    id: activity.id,
    title: activity.title,
    description:
      activity.coreInfo?.description ||
      activity.coreInfo?.shortDescription ||
      "Experience this amazing activity in Andaman!",
    media,
    price: currentPrice,
    totalPrice,
    originalPrice: discountedPrice ? basePrice : undefined,
    originalTotalPrice,
    type:
      typeof activity.coreInfo?.category === "string"
        ? activity.coreInfo?.category
        : typeof activity.coreInfo?.category[0] === "string"
        ? activity.coreInfo?.category[0]
        : activity.coreInfo?.category[0].name,
    duration:
      typeof activity.coreInfo?.duration === "string"
        ? activity.coreInfo?.duration
        : "2 hours",
    href: `/activities/${activity.slug}`,
    activityOptions: transformedOptions,
    availableTimeSlots,
    onSelectActivity: handleActivitySelection,
    location:
      typeof activity.coreInfo?.location === "string"
        ? activity.coreInfo?.location
        : typeof activity.coreInfo?.location[0] === "string"
        ? activity.coreInfo?.location[0]
        : activity.coreInfo?.location[0].name,
    totalGuests: searchParams.adults, // COMMENTED OUT: Only adults counted for activities
    timeSlots: availableTimeSlots.map((slot) => slot.displayTime),
  };
}

// Batch transformation function (optimized for multiple activities)
export function transformActivitiesToCards(
  activities: Activity[],
  searchParams: ActivitySearchParams,
  handleActivitySelection: (activityId: string, optionId: string) => void
): TransformedActivityCard[] {
  return activities.map((activity) =>
    transformActivityToCard(activity, searchParams, handleActivitySelection)
  );
}
