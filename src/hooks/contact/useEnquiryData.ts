import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ValidatedEnquiryData } from "@/types/enquiry.types";
import {
  decodePackageDataFromURL,
  getContactFormDefaults,
} from "@/utils/enquiry.utils";
import { useContactFormOptions } from "./useContactFormOptions";

/**
 * Custom hook to handle package enquiry data from URL parameters
 * Provides decoded package data and form defaults for the contact form
 */
export function useEnquiryData() {
  const searchParams = useSearchParams();
  const contactFormOptions = useContactFormOptions();

  const [enquiryData, setEnquiryData] = useState<ValidatedEnquiryData>({
    isValid: false,
    source: "none",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Process URL parameters
  useEffect(() => {
    const processEnquiryParams = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const packageParam = searchParams?.get("pkg");
        const referrer = searchParams?.get("ref");

        if (packageParam) {
          const decoded = decodePackageDataFromURL(packageParam);
          setEnquiryData(decoded);

          // Analytics tracking
          if (decoded.isValid && referrer) {
            console.log("📊 Enquiry tracking:", {
              source: referrer,
              package: decoded.packageTitle,
              packageId: decoded.packageId,
              timestamp: new Date().toISOString(),
            });

            // You can add analytics calls here
            // analytics.track('enquiry_started', { ... });
          }
        } else {
          setEnquiryData({ isValid: false, source: "none" });
        }
      } catch (error) {
        console.error("Error processing enquiry data:", error);
        setError("Failed to process enquiry data");
        setEnquiryData({ isValid: false, source: "none" });
      } finally {
        setIsLoading(false);
      }
    };

    processEnquiryParams();
  }, [searchParams]);

  // Generate form defaults with better error handling
  const formDefaults = useMemo(() => {
    if (!contactFormOptions || contactFormOptions.isLoading) {
      return null;
    }

    try {
      const defaults = getContactFormDefaults(enquiryData, contactFormOptions);

      // Enhanced logging for debugging
      if (enquiryData.isValid && defaults.booking.package) {
        console.log("✅ Package enquiry processed:", {
          packageSlug: defaults.booking.package,
          durationValue: defaults.booking.duration,
          packageTitle: enquiryData.packageTitle,
          periodTitle: enquiryData.periodTitle,
          optionsAvailable: {
            packages: contactFormOptions.packages?.length || 0,
            periods: contactFormOptions.periods?.length || 0,
          },
        });
      }

      return defaults;
    } catch (error) {
      console.error("Error generating form defaults:", error);
      setError("Failed to generate form defaults");
      return null;
    }
  }, [
    enquiryData.packageId,
    enquiryData.periodId,
    enquiryData.packageSlug, // Add slug dependency
    contactFormOptions?.packages?.length,
    contactFormOptions?.periods?.length,
  ]);

  // Enhanced package data validation
  const hasValidPackageData = useMemo(() => {
    if (!enquiryData.isValid || enquiryData.source !== "url") {
      return false;
    }

    // Check if package exists in available options
    if (contactFormOptions?.packages?.length > 0) {
      const packageExists = contactFormOptions.getPackageBySlug?.(
        enquiryData.packageSlug || ""
      );

      if (!packageExists) {
        console.warn(
          "⚠️ Package not found in options:",
          enquiryData.packageSlug
        );
        return false;
      }
    }

    return true;
  }, [
    enquiryData.isValid,
    enquiryData.source,
    enquiryData.packageSlug,
    contactFormOptions?.packages?.length,
  ]);

  // Package display information for UI
  const packageInfo = useMemo(() => {
    if (!hasValidPackageData) return null;

    return {
      id: enquiryData.packageId,
      title: enquiryData.packageTitle,
      slug: enquiryData.packageSlug,
      period: enquiryData.periodTitle,
      price: enquiryData.price,
      originalPrice: enquiryData.originalPrice,
      description: enquiryData.shortDescription,
      category: enquiryData.categorySlug,
    };
  }, [hasValidPackageData, enquiryData]);

  // Loading state combines both enquiry processing and options loading
  const isFullyLoaded = !isLoading && !contactFormOptions.isLoading;

  return {
    // Core data
    enquiryData,
    formDefaults,
    packageInfo,
    contactFormOptions,

    // State flags
    isLoading: !isFullyLoaded,
    hasPackageData: hasValidPackageData,
    error,

    // Helper functions
    isFromEnquiry: enquiryData.source === "url",
    isDataReady: isFullyLoaded && formDefaults !== null,
  };
}
