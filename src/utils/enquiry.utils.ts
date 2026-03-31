import {
  PackageEnquiryData,
  ValidatedEnquiryData,
} from "@/types/enquiry.types";

/**
 * Encodes package data for URL transmission
 * Uses base64 encoding to keep URLs manageable
 */
export function encodePackageDataForURL(data: PackageEnquiryData): string {
  try {
    const jsonString = JSON.stringify(data);
    // Use base64 encoding for URL safety
    return btoa(encodeURIComponent(jsonString));
  } catch (error) {
    console.error("Failed to encode package data:", error);
    return "";
  }
}

/**
 * Decodes package data from URL parameter
 * Returns validated data with fallbacks
 */
export function decodePackageDataFromURL(
  encodedData: string
): ValidatedEnquiryData {
  try {
    if (!encodedData) {
      return { isValid: false, source: "none" };
    }

    const jsonString = decodeURIComponent(atob(encodedData));
    const data = JSON.parse(jsonString) as PackageEnquiryData;

    // Validate required fields
    const isValid = Boolean(
      data.packageId &&
        data.packageTitle &&
        data.packageSlug &&
        data.categoryId &&
        data.periodId
    );

    return {
      ...data,
      isValid,
      source: "url",
    };
  } catch (error) {
    console.error("Failed to decode package data from URL:", error);
    return { isValid: false, source: "none" };
  }
}

/**
 * Creates enquiry URL with package data
 */
export function createEnquiryURL(
  packageData: PackageEnquiryData,
  baseURL = "/contact"
): string {
  const encodedData = encodePackageDataForURL(packageData);

  if (!encodedData) {
    return baseURL;
  }

  // Use URLSearchParams for client-side safe URL generation
  const searchParams = new URLSearchParams();
  searchParams.set("pkg", encodedData);
  searchParams.set("ref", "package-detail");

  return `${baseURL}?${searchParams.toString()}`;
}

/**
 * Transforms Payload package data to enquiry data format
 */
export function transformPackageToEnquiryData(
  packageData: any
): PackageEnquiryData {
  // Handle both populated and unpopulated relationships
  const category = packageData.coreInfo?.category;
  const period = packageData.coreInfo?.period;

  return {
    packageId: packageData.id,
    packageTitle: packageData.title,
    packageSlug: packageData.slug,

    categoryId: typeof category === "object" ? category.id : category,
    categorySlug: typeof category === "object" ? category.slug : "",

    periodId: typeof period === "object" ? period.id : period,
    periodTitle: typeof period === "object" ? period.title : "",

    price: packageData.pricing?.price || 0,
    originalPrice: packageData.pricing?.originalPrice,

    shortDescription: packageData.descriptions?.shortDescription,

    // Default booking settings based on package type
    defaultAdults: 1,
    defaultChildren: 0,
    defaultDuration: getDurationFromPeriod(period),
  };
}

/**
 * Helper function to extract duration days from period data
 */
function getDurationFromPeriod(period: any): number {
  if (typeof period === "object" && period?.title) {
    const match = period.title.match(/(\d+)[\s-]*(?:days?|nights?)/i);
    return match ? parseInt(match[1]) : 3;
  }
  return 3; // default fallback
}

/**
 * Gets default contact form values with package data
 */
export function getContactFormDefaults(
  enquiryData: ValidatedEnquiryData,
  contactFormOptions?: any
) {
  const now = new Date();
  const defaultCheckOut = new Date(
    now.getTime() + (enquiryData.defaultDuration || 3) * 24 * 60 * 60 * 1000
  );

  // Find matching package and period from available options
  const matchingPackage = contactFormOptions?.getPackageBySlug?.(
    enquiryData.packageSlug || ""
  );
  const matchingPeriod = contactFormOptions?.periods?.find(
    (p: any) =>
      p.title === enquiryData.periodTitle || p.value === enquiryData.periodTitle
  );

  return {
    booking: {
      package: matchingPackage?.slug || enquiryData.packageSlug || "",
      duration: matchingPeriod?.value || enquiryData.periodTitle || "",
      checkIn: now,
      checkOut: defaultCheckOut,
      adults: enquiryData.defaultAdults || 2,
      children: enquiryData.defaultChildren || 0,
    },
    personal: {
      fullName: "",
      age: 25,
      phone: "",
      email: "",
    },
    additional: {
      tags: [],
      message: enquiryData.packageTitle
        ? `I'm interested in the ${enquiryData.packageTitle} package.${
            enquiryData.shortDescription
              ? ` ${enquiryData.shortDescription}`
              : ""
          }`
        : "",
    },
    additionalMessage: "",
  };
}
