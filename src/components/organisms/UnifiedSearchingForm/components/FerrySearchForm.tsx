// components/organisms/FerrySearchForm.tsx - REFACTORED
"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFerryStore } from "@/store/FerryStore";
import { useRouter } from "next/navigation";
import styles from "../UnifiedSearchingForm.module.css";
import { cn } from "@/utils/cn";

// Components
import {
  Button,
  DateSelect,
  SlotSelect,
  LocationSelect,
  PassengerCounter,
} from "@/components/atoms";
import { FerrySearchErrorBoundary } from "@/components/ferry/ErrorBoundary/FerrySearchErrorBoundary";

// Extracted hooks
import { useReactiveSearch } from "@/hooks/ferry/useReactiveSearch";
import { useTimingPreference } from "@/hooks/ferry/useTimingPreference";
import { useFormValidation } from "@/hooks/ferry/useFormValidation";
import { useLocationFiltering } from "@/hooks/ferry/useLocationFiltering";

// Services and data
import { LocationMappingService } from "@/services/ferryServices/locationMappingService";
import { useFerryFlow } from "@/hooks/queries/useFerryStore";

// Schema - simplified, no longer needs selectedSlot validation
const ferrySearchSchema = z.object({
  fromLocation: z.string().min(1, "Please select departure location"),
  toLocation: z.string().min(1, "Please select destination location"),
  selectedDate: z.date({ required_error: "Please select a date" }),
  selectedSlot: z.string().optional(),
  passengers: z.object({
    adults: z
      .number()
      .min(1, "At least 1 adult required")
      .max(10, "Maximum 10 adults"),
    children: z.number().min(0).max(10, "Maximum 10 children"),
    infants: z.number().min(0).max(5, "Maximum 5 infants"),
  }),
});

type FerrySearchFormData = z.infer<typeof ferrySearchSchema>;

interface FerrySearchFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
  enableReactiveSearch?: boolean;
  showManualSearch?: boolean;
}

// Constants
const FERRY_LOCATIONS = LocationMappingService.getFormLocations();

const FERRY_TIME_SLOTS = [
  {
    value: "",
    label: "Any Time",
    id: "any-time",
    time: "",
    slug: "any-time",
  },
  {
    value: "06:00",
    label: "Morning",
    id: "06:00",
    time: "06:00",
    slug: "06:00",
  },
  {
    value: "12:00",
    label: "Noon",
    id: "12:00",
    time: "12:00",
    slug: "12:00",
  },
  {
    value: "18:00",
    label: "Evening",
    id: "18:00",
    time: "18:00",
    slug: "18:00",
  },
];

export function FerrySearchForm({
  className,
  variant = "default",
  enableReactiveSearch = false,
  showManualSearch = true,
}: FerrySearchFormProps) {
  const router = useRouter();
  const { searchParams, setSearchParams, setPreferredTime } = useFerryStore();

  // Form setup
  const defaultValues = useMemo(
    () => ({
      fromLocation: searchParams.from || "",
      toLocation: searchParams.to || "",
      selectedDate: searchParams.date
        ? new Date(searchParams.date)
        : new Date(),
      selectedSlot: "",
      passengers: {
        adults: searchParams.adults || 2,
        children: searchParams.children || 0,
        infants: searchParams.infants || 0,
      },
    }),
    [searchParams]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<FerrySearchFormData>({
    resolver: zodResolver(ferrySearchSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedFields = watch();

  // Ferry flow data
  const { isSearching, operatorHealth, hasSearchParamsChanged } = useFerryFlow({
    enableReactiveSearch,
    debounceMs: 1500,
  });

  // Extracted custom hooks - much cleaner!
  useReactiveSearch({
    watchedFields,
    shouldEnableReactiveSearch: enableReactiveSearch,
    searchParams,
    setSearchParams,
  });

  useTimingPreference({
    selectedSlot: watchedFields.selectedSlot,
    setPreferredTime,
  });

  const isFormValid = useFormValidation(watchedFields);

  const { availableDestinations, availableDepartures } = useLocationFiltering(
    FERRY_LOCATIONS,
    watchedFields.fromLocation,
    watchedFields.toLocation
  );

  // System availability check
  const isSystemAvailable = useMemo(() => {
    if (!operatorHealth) return true;
    const allOffline = Object.values(operatorHealth).every(
      (status: any) => status.status === "offline" || status.status === "error"
    );
    return !allOffline;
  }, [operatorHealth]);

  // Form submission
  const onSubmit = useCallback(
    async (data: FerrySearchFormData) => {
      if (data.fromLocation === data.toLocation) {
        setError("toLocation", {
          type: "manual",
          message: "Destination must be different from departure location",
        });
        return;
      }

      // Format date
      const localDate = new Date(data.selectedDate);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const searchParams = {
        from: data.fromLocation,
        to: data.toLocation,
        date: formattedDate,
        adults: data.passengers.adults,
        children: data.passengers.children,
        infants: data.passengers.infants,
      };

      setSearchParams(searchParams);

      // Navigate only if not on results page
      if (!window.location.pathname.includes("/ferry/results")) {
        const urlParams = new URLSearchParams({
          from: searchParams.from,
          to: searchParams.to,
          date: searchParams.date,
          adults: searchParams.adults.toString(),
          children: searchParams.children.toString(),
          infants: searchParams.infants.toString(),
        });

        router.push(`/ferry/results?${urlParams.toString()}`);
      }
    },
    [setSearchParams, setError, router]
  );

  // Button text logic
  const buttonText = useMemo(() => {
    if (enableReactiveSearch && !showManualSearch) {
      return null;
    }

    switch (variant) {
      case "compact":
        return "Search";
      case "embedded":
        return enableReactiveSearch ? "Update Search" : "Find Ferries";
      default:
        return "Search Ferries";
    }
  }, [variant, enableReactiveSearch, showManualSearch]);

  const handlePassengerChange = useCallback(
    (field: { value: any; onChange: (value: any) => void }) =>
      (type: string, value: number) => {
        field.onChange({
          ...field.value,
          [type]: value,
        });
      },
    []
  );

  const isLoading = isSubmitting || isSearching;
  const isSearchDisabled = !isSystemAvailable || !isFormValid || isLoading;

  return (
    <FerrySearchErrorBoundary>
      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Ferry Search Form"
        className={cn(styles.formGrid, className)}
      >
        <div
          className={
            // If showManualSearch is false, use formContentWithoutButton
            !showManualSearch
              ? styles.formContentWithoutButton
              : styles.formContent
          }
        >
          {/* Departure Location */}
          <div className={styles.formField}>
            <Controller
              control={control}
              name="fromLocation"
              render={({ field }) => (
                <LocationSelect
                  label="From"
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={availableDepartures}
                  placeholder="Departure Port"
                  hasError={!!errors.fromLocation}
                  errorMessage={errors.fromLocation?.message}
                />
              )}
            />
          </div>

          {/* Destination Location */}
          <div className={styles.formField}>
            <Controller
              control={control}
              name="toLocation"
              render={({ field }) => (
                <LocationSelect
                  label="To"
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={availableDestinations}
                  placeholder="Destination Port"
                  hasError={!!errors.toLocation}
                  errorMessage={errors.toLocation?.message}
                />
              )}
            />
          </div>

          {/* Date */}
          <div className={styles.formField}>
            <Controller
              control={control}
              name="selectedDate"
              render={({ field }) => (
                <DateSelect
                  selected={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.selectedDate}
                  allowPastDates={true}
                />
              )}
            />
            {errors.selectedDate && (
              <div className={styles.errorMessage}>
                {errors.selectedDate.message}
              </div>
            )}
          </div>

          {/* Timing Preference */}
          <div className={styles.formField}>
            <Controller
              control={control}
              name="selectedSlot"
              render={({ field }) => (
                <SlotSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={FERRY_TIME_SLOTS}
                  placeholder="Any Time"
                  label="Preferred Timing"
                  optional={true}
                  // helperText="Results will be filtered by your preference"
                />
              )}
            />
          </div>

          {/* Passengers */}
          <div className={styles.formField}>
            <Controller
              control={control}
              name="passengers"
              render={({ field }) => (
                <PassengerCounter
                  value={field.value}
                  onChange={handlePassengerChange(field)}
                  hasError={!!errors.passengers}
                  hideChildren={true}
                />
              )}
            />
            {errors.passengers && (
              <div className={styles.errorMessage}>
                {errors.passengers.message}
              </div>
            )}
          </div>

          {/* Search Button */}
          {buttonText && (
            <div className={styles.buttonContainer}>
              <Button
                variant="primary"
                className={styles.searchButton}
                showArrow
                type="submit"
                disabled={isSearchDisabled}
              >
                {isLoading ? "Searching..." : buttonText}
              </Button>
            </div>
          )}
        </div>
      </form>
    </FerrySearchErrorBoundary>
  );
}
