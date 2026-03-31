import { useEffect, useMemo, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { debounce } from "lodash";
import {
  ContactFormData,
  contactFormSchema,
} from "@/app/(frontend)/contact/components/ContactForm/ContactForm.types";

const STORAGE_KEY = "contact_form_data";
const EXPIRY_MINUTES = 30;

interface StoredData {
  data: ContactFormData;
  timestamp: number;
  source: "user" | "package";
  version: string;
  dataHash: string; // Add hash for efficient change detection
}

export const useFormPersistence = (form: UseFormReturn<ContactFormData>) => {
  const { watch, reset, formState } = form;
  const formData = watch();
  const lastSavedData = useRef<ContactFormData | null>(null);
  const lastSavedHash = useRef<string | null>(null);

  // Version for schema compatibility
  const STORAGE_VERSION = "1.0";

  // Create a stable hash for data comparison (better than JSON.stringify)
  const createDataHash = useCallback((data: ContactFormData): string => {
    const hashData = {
      booking: {
        package: data.booking.package,
        duration: data.booking.duration,
        checkIn: data.booking.checkIn?.toISOString(),
        checkOut: data.booking.checkOut?.toISOString(),
        adults: data.booking.adults,
        children: data.booking.children,
      },
      personal: {
        fullName: data.personal.fullName.trim(),
        age: data.personal.age,
        phone: data.personal.phone.trim(),
        email: data.personal.email.trim().toLowerCase(),
      },
      additional: {
        tags: [...data.additional.tags].sort(), // Sort for consistent hash
        message: data.additional.message.trim(),
      },
      additionalMessage: data.additionalMessage.trim(),
    };

    // Simple hash function - in production, consider using a proper hash library
    return btoa(JSON.stringify(hashData)).slice(0, 16);
  }, []);

  // Enhanced save to storage with retry logic
  const saveToStorage = useCallback(
    async (
      data: ContactFormData,
      source: "user" | "package" = "user"
    ): Promise<boolean> => {
      try {
        // Validate before saving
        const validatedData = contactFormSchema.parse(data);
        const dataHash = createDataHash(validatedData);

        // Skip if data hasn't changed
        if (source === "user" && dataHash === lastSavedHash.current) {
          console.log("💾 Data unchanged, skipping save");
          return true;
        }

        const storageData: StoredData = {
          data: validatedData,
          timestamp: Date.now(),
          source,
          version: STORAGE_VERSION,
          dataHash,
        };

        const serialized = JSON.stringify(storageData);

        // Check if data is too large for sessionStorage (usually ~5MB limit)
        if (serialized.length > 4.5 * 1024 * 1024) {
          console.warn("⚠️ Form data too large for storage, skipping save");
          return false;
        }

        sessionStorage.setItem(STORAGE_KEY, serialized);

        // Update refs only after successful save
        lastSavedData.current = validatedData;
        lastSavedHash.current = dataHash;

        console.log(
          `💾 Saved ${source} data to storage (${Math.round(
            serialized.length / 1024
          )}KB, hash: ${dataHash})`
        );
        return true;
      } catch (error) {
        if (error instanceof Error) {
          // Handle specific storage errors
          if (error.name === "QuotaExceededError") {
            console.warn("💾 Storage quota exceeded, clearing old data");
            try {
              // Try to clear non-essential storage first
              const keysToRemove = [];
              for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key !== STORAGE_KEY) {
                  keysToRemove.push(key);
                }
              }

              keysToRemove.forEach((key) => sessionStorage.removeItem(key));

              // Now try to save again
              const storageData: StoredData = {
                data,
                timestamp: Date.now(),
                source,
                version: STORAGE_VERSION,
                dataHash: createDataHash(data),
              };

              sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
              lastSavedData.current = data;
              lastSavedHash.current = storageData.dataHash;
              return true;
            } catch (retryError) {
              console.error(
                "Failed to save after clearing storage:",
                retryError
              );
            }
          } else if (error.name === "SecurityError") {
            console.warn("💾 Storage access denied (private mode?)");
          } else {
            console.warn("Failed to save form data:", error.message);
          }
        }
        return false;
      }
    },
    [createDataHash, contactFormSchema]
  );

  // Enhanced load from storage with migration support
  const loadFromStorage = useCallback((): StoredData | null => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: StoredData = JSON.parse(stored);

      // Check version compatibility
      if (parsed.version && parsed.version !== STORAGE_VERSION) {
        console.log(
          `🔄 Migrating storage from v${parsed.version} to v${STORAGE_VERSION}`
        );
        // Add migration logic here if needed
      }

      // Check expiry
      const ageInMinutes = (Date.now() - parsed.timestamp) / (1000 * 60);
      if (ageInMinutes > EXPIRY_MINUTES) {
        console.log(
          `🗑️ Stored data expired (${Math.round(ageInMinutes)}min old)`
        );
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Validate stored data structure
      const validatedData = contactFormSchema.parse(parsed.data);

      // Update refs with loaded data
      lastSavedData.current = validatedData;
      lastSavedHash.current = parsed.dataHash || createDataHash(validatedData);

      console.log(
        `📥 Loaded ${parsed.source} data from storage (${Math.round(
          ageInMinutes
        )}min old, hash: ${parsed.dataHash || "legacy"})`
      );

      return { ...parsed, data: validatedData };
    } catch (error) {
      console.warn("Failed to load form data, clearing storage:", error);
      sessionStorage.removeItem(STORAGE_KEY);
      lastSavedData.current = null;
      lastSavedHash.current = null;
      return null;
    }
  }, [createDataHash, contactFormSchema]);

  // Intelligent auto-save with enhanced conditions
  const debouncedSave = useMemo(() => {
    return debounce(async (data: ContactFormData) => {
      // Only auto-save if form is dirty and has meaningful data
      if (!formState.isDirty) return;

      // Create hash for comparison
      const currentHash = createDataHash(data);

      // Skip if data hasn't actually changed
      if (currentHash === lastSavedHash.current) {
        return;
      }

      // Check if form has enough meaningful data to warrant saving
      const hasMinimalData =
        data.personal.fullName.trim().length > 1 ||
        data.personal.email.trim().length > 0 ||
        data.personal.phone.trim().length > 0 ||
        data.booking.package.length > 0 ||
        data.additional.message.trim().length > 10;

      // Additional check: ensure at least one significant field has content
      const hasSignificantData =
        data.personal.fullName.trim().length > 2 ||
        data.personal.email.includes("@") ||
        data.personal.phone.trim().length > 8 ||
        data.booking.package.length > 0 ||
        data.additional.message.trim().length > 20;

      if (hasMinimalData && hasSignificantData) {
        const success = await saveToStorage(data, "user");
        if (success) {
          console.log(`💾 Auto-saved user data (hash: ${currentHash})`);
        }
      }
    }, 2000); // Slightly longer debounce for better performance
  }, [formState.isDirty, saveToStorage, createDataHash]);

  // Auto-save effect with cleanup
  useEffect(() => {
    // Only start auto-saving after initial load is complete
    const timer = setTimeout(() => {
      debouncedSave(formData);
    }, 1000); // Small delay to prevent saving during initialization

    return () => {
      clearTimeout(timer);
      debouncedSave.cancel();
    };
  }, [formData, debouncedSave]);

  // Enhanced utility functions
  const clearStorage = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      lastSavedData.current = null;
      lastSavedHash.current = null;
      console.log("🗑️ Cleared form storage");
      return true;
    } catch (error) {
      console.warn("Failed to clear storage:", error);
      return false;
    }
  }, []);

  const restoreFromStorage = useCallback((): StoredData | null => {
    const stored = loadFromStorage();
    if (stored) {
      reset(stored.data, {
        keepDirty: stored.source === "user",
        keepDefaultValues: false,
      });
      console.log(`✅ Restored ${stored.source} data to form`);
      return stored;
    }
    return null;
  }, [loadFromStorage, reset]);

  const savePackageData = useCallback(
    async (data: ContactFormData): Promise<boolean> => {
      const success = await saveToStorage(data, "package");
      if (success) {
        console.log("📦 Package data saved successfully");
      }
      return success;
    },
    [saveToStorage]
  );

  const hasConflictingData = useCallback(
    (packageData: ContactFormData): boolean => {
      const stored = loadFromStorage();
      if (!stored || stored.source !== "user") return false;

      // Enhanced conflict detection with hash comparison
      const storedHash = stored.dataHash || createDataHash(stored.data);
      const packageHash = createDataHash(packageData);

      // If hashes are the same, no conflict
      if (storedHash === packageHash) return false;

      // Check specific conflicts for better UX
      const hasPackageConflict =
        stored.data.booking.package !== packageData.booking.package ||
        stored.data.booking.duration !== packageData.booking.duration;

      const hasDateConflict =
        Math.abs(
          stored.data.booking.checkIn.getTime() -
            packageData.booking.checkIn.getTime()
        ) >
          24 * 60 * 60 * 1000 || // More than 1 day difference
        Math.abs(
          stored.data.booking.checkOut.getTime() -
            packageData.booking.checkOut.getTime()
        ) >
          24 * 60 * 60 * 1000;

      const hasGuestConflict =
        stored.data.booking.adults !== packageData.booking.adults ||
        stored.data.booking.children !== packageData.booking.children;

      // Check if saved data has meaningful personal information
      const hasPersonalData =
        stored.data.personal.fullName.trim().length > 2 ||
        stored.data.personal.email.trim().length > 0 ||
        stored.data.personal.phone.trim().length > 0 ||
        stored.data.additional.message.trim().length > 10;

      const hasConflict =
        hasPersonalData &&
        (hasPackageConflict || hasDateConflict || hasGuestConflict);

      if (hasConflict) {
        console.log("⚠️ Data conflict detected:", {
          package: hasPackageConflict,
          dates: hasDateConflict,
          guests: hasGuestConflict,
          hasPersonalData,
          storedHash: storedHash.slice(0, 8),
          packageHash: packageHash.slice(0, 8),
        });
      }

      return hasConflict;
    },
    [loadFromStorage, createDataHash]
  );

  // Get storage info for debugging
  const getStorageInfo = useCallback(() => {
    const stored = loadFromStorage();
    if (!stored) return null;

    const ageInMinutes = (Date.now() - stored.timestamp) / (1000 * 60);
    const expiresInMinutes = EXPIRY_MINUTES - ageInMinutes;
    const serializedSize = JSON.stringify(stored).length;

    return {
      source: stored.source,
      age: Math.round(ageInMinutes),
      size: Math.round(serializedSize / 1024),
      expires: Math.round(expiresInMinutes),
      hash: stored.dataHash?.slice(0, 8) || "legacy",
      isExpired: expiresInMinutes <= 0,
      version: stored.version,
    };
  }, [loadFromStorage]);

  // Get storage usage statistics
  const getStorageStats = useCallback(() => {
    try {
      let totalSize = 0;
      let itemCount = 0;

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const item = sessionStorage.getItem(key);
          totalSize += item?.length || 0;
          itemCount++;
        }
      }

      // Estimate available space (5MB typical limit)
      const estimatedLimit = 5 * 1024 * 1024;
      const usagePercent = (totalSize / estimatedLimit) * 100;

      return {
        totalSize: Math.round(totalSize / 1024), // KB
        itemCount,
        usagePercent: Math.round(usagePercent),
        availableSpace: Math.round((estimatedLimit - totalSize) / 1024), // KB
        isNearLimit: usagePercent > 80,
      };
    } catch (error) {
      console.warn("Could not calculate storage stats:", error);
      return null;
    }
  }, []);

  // Force save current form data
  const forceSave = useCallback(async (): Promise<boolean> => {
    const currentData = form.getValues();
    return await saveToStorage(currentData, "user");
  }, [form, saveToStorage]);

  // Check if current form data differs from saved data
  const hasUnsavedChanges = useCallback((): boolean => {
    const currentData = form.getValues();
    const currentHash = createDataHash(currentData);
    return currentHash !== lastSavedHash.current;
  }, [form, createDataHash]);

  // Get a summary of current form completion
  const getFormCompletionInfo = useCallback(() => {
    const currentData = form.getValues();

    const bookingComplete = !!(
      currentData.booking.package &&
      currentData.booking.duration &&
      currentData.booking.checkIn &&
      currentData.booking.checkOut
    );

    const personalComplete = !!(
      currentData.personal.fullName.trim().length > 2 &&
      currentData.personal.email.trim().length > 0 &&
      currentData.personal.phone.trim().length > 8 &&
      currentData.personal.age >= 18
    );

    const hasAdditionalInfo =
      currentData.additional.tags.length > 0 ||
      currentData.additional.message.trim().length > 0 ||
      currentData.additionalMessage.trim().length > 0;

    const completionPercent = Math.round(
      (bookingComplete ? 50 : 0) +
        (personalComplete ? 40 : 0) +
        (hasAdditionalInfo ? 10 : 0)
    );

    return {
      bookingComplete,
      personalComplete,
      hasAdditionalInfo,
      completionPercent,
      isMinimallyComplete: bookingComplete && personalComplete,
    };
  }, [form]);

  return {
    // Core functions
    saveToStorage,
    loadFromStorage,
    clearStorage,
    restoreFromStorage,
    savePackageData,
    hasConflictingData,

    // Information functions
    getStorageInfo,
    getStorageStats,
    getFormCompletionInfo,

    // Utility functions
    forceSave,
    hasUnsavedChanges,
    hasStoredData: () => loadFromStorage() !== null,

    // Feature detection
    isStorageAvailable: () => {
      try {
        const test = "__storage_test__";
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    },

    // Constants for external use
    STORAGE_VERSION,
    EXPIRY_MINUTES,
  };
};
