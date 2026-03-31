import { useState, useEffect } from "react";
import { ContactFormOptions } from "@/types/contact-form-options.types";

/**
 * Custom hook to fetch contact form dropdown options
 * Handles loading, error states, and caching
 */
export function useContactFormOptions() {
  const [options, setOptions] = useState<ContactFormOptions>({
    packages: [],
    periods: [],
    categories: [],
    isLoading: true,
  });

  useEffect(() => {
    async function fetchOptions() {
      try {
        // Fetch from API route instead of direct service call for client-side
        const response = await fetch("/api/contact?action=form-options");

        if (!response.ok) {
          throw new Error("Failed to fetch contact form options");
        }

        const data = await response.json();
        setOptions({
          ...data,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching contact form options:", error);
        setOptions((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load form options",
        }));
      }
    }

    fetchOptions();
  }, []);

  // Helper functions for easier option lookups
  const getPackageBySlug = (slug: string) =>
    options.packages.find((pkg) => pkg.slug === slug);

  const getPeriodByValue = (value: string) =>
    options.periods.find((period) => period.value === value);

  const getCategoryBySlug = (slug: string) =>
    options.categories.find((category) => category.slug === slug);

  return {
    ...options,
    getPackageBySlug,
    getPeriodByValue,
    getCategoryBySlug,
  };
}
