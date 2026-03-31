// hooks/useFormPersistence.ts
import { useEffect, useMemo, useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { debounce } from "lodash";
import { TripFormData } from "../../app/(frontend)/plan-your-trip/TripFormSchema";

const FORM_KEY = "andaman_trip_planning_form";
const SAVE_DEBOUNCE_DELAY = 1000; // Increase debounce to 1 second
const SAVE_INDICATOR_DISPLAY_TIME = 1500; // Display saved status for 1.5 seconds

const saveFormData = (data: TripFormData) => {
  try {
    sessionStorage.setItem(
      FORM_KEY,
      JSON.stringify({
        ...data,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000, // 60 minutes
      })
    );
    return true;
  } catch (error) {
    console.warn("Failed to save form data:", error);
    return false;
  }
};

const loadFormData = (): Partial<TripFormData> | null => {
  try {
    const stored = sessionStorage.getItem(FORM_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Check if expired
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(FORM_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to load form data:", error);
    return null;
  }
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const useFormPersistence = (form: UseFormReturn<TripFormData>) => {
  const { watch, setValue, getValues } = form;
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const lastSaveTime = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      Object.entries(savedData).forEach(([key, value]) => {
        if (key !== "timestamp" && key !== "expiresAt") {
          try {
            // Handle arrays (like itinerary) - set directly
            if (Array.isArray(value)) {
              setValue(key as keyof TripFormData, value as any);
            }
            // Handle nested objects (but not arrays)
            else if (typeof value === "object" && value !== null) {
              Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                setValue(`${key}.${nestedKey}` as any, nestedValue);
              });
            } else {
              setValue(key as keyof TripFormData, value as any);
            }
          } catch (error) {
            console.warn(`Failed to set field ${key}:`, error);
          }
        }
      });
    }
  }, [setValue]);

  // Clear any existing timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Save on changes (debounced)
  const formData = watch();
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        // Only show saving indicator if it's been at least 2 seconds since last save
        const now = Date.now();
        const timeSinceLastSave = now - lastSaveTime.current;

        if (timeSinceLastSave > 2000) {
          setSaveStatus("saving");
        }

        const success = saveFormData(formData);
        lastSaveTime.current = now;

        // Clear any existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Only show saved status if we showed the saving status
        if (timeSinceLastSave > 2000) {
          saveTimeoutRef.current = setTimeout(() => {
            setSaveStatus(success ? "saved" : "error");

            // Reset to idle after display time
            saveTimeoutRef.current = setTimeout(() => {
              setSaveStatus("idle");
              saveTimeoutRef.current = null;
            }, SAVE_INDICATOR_DISPLAY_TIME);
          }, 500);
        }
      }, SAVE_DEBOUNCE_DELAY),
    [formData]
  );

  useEffect(() => {
    debouncedSave();
    // Make sure to cancel debounced call on unmount
    return () => debouncedSave.cancel();
  }, [formData, debouncedSave]);

  // Clear on successful submission
  const clearSavedData = () => {
    sessionStorage.removeItem(FORM_KEY);
    setSaveStatus("idle");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  return { clearSavedData, saveStatus };
};
