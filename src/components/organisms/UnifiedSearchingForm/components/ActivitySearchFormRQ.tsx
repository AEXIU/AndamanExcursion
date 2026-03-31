"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActivityRQ } from "@/store/ActivityStoreRQ";
import { useRouter } from "next/navigation";
import styles from "../UnifiedSearchingForm.module.css";
import { cn } from "@/utils/cn";

import {
  Button,
  DateSelect,
  ActivitySelect,
  PassengerCounter,
  SlotSelect,
  LocationSelect,
} from "@/components/atoms";
import { useFormOptions, useActivityTimesByCategory } from "@/hooks/queries";

const activitySearchSchema = z.object({
  selectedActivity: z.string().min(1, "Please select an activity type"),
  activityLocation: z.string().min(1, "Please select a location"), // Location now required for time slot filtering
  selectedDate: z.date({ required_error: "Please select a date" }),
  selectedSlot: z.string().min(1, "Please select a time"),
  passengers: z.object({
    adults: z
      .number()
      .min(1, "At least 1 adult required")
      .max(10, "Maximum 10 adults"),
    children: z.number().min(0).max(0, "Children not supported for activities"), // Children not supported for activities
  }),
});

type ActivitySearchFormData = z.infer<typeof activitySearchSchema>;

interface ActivitySearchFormRQProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

export function ActivitySearchFormRQ({
  className,
  variant = "default",
}: ActivitySearchFormRQProps) {
  const router = useRouter();
  const {
    searchParams,
    updateSearchParams,
    editingItemId,
    editingSearchParams,
    cancelEditing,
    saveEditedItem,
    cart,
  } = useActivityRQ();

  // Use React Query for form options
  const {
    categories,
    locations,
    timeSlots,
    isLoading: isLoadingOptions,
    error: loadError,
  } = useFormOptions();

  // Transform data for select components
  const activityOptions = useMemo(() => {
    return (categories.data || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      value: cat.slug,
      label: cat.name,
    }));
  }, [categories.data]);

  // filter out neil-island from locations
  const locationsWithoutNeilIsland = locations.data?.filter(
    (loc) => loc.name !== "Neil Island"
  );

  const locationOptions = useMemo(() => {
    return (locationsWithoutNeilIsland || []).map((loc) => ({
      id: loc.id,
      name: loc.name,
      slug: loc.slug,
      value: loc.slug,
      label: loc.name,
    }));
  }, [locationsWithoutNeilIsland]);

  // Check if we're in edit mode
  const isEditMode = !!editingItemId;

  // Use editing search params when in edit mode, otherwise use regular search params
  const currentSearchParams =
    isEditMode && editingSearchParams ? editingSearchParams : searchParams;

  // Get the currently selected activity category
  const selectedActivityCategory = useMemo(() => {
    if (!currentSearchParams.activityType) return null;
    return activityOptions.find(
      (opt) => opt.value === currentSearchParams.activityType
    );
  }, [currentSearchParams.activityType, activityOptions]);

  // Get the currently selected location
  const selectedLocation = useMemo(() => {
    if (!currentSearchParams.location) return null;
    return locationOptions.find(
      (opt) => opt.value === currentSearchParams.location
    );
  }, [currentSearchParams.location, locationOptions]);

  // Use new React Query hook to get time slots based on category + location
  const {
    data: categoryLocationTimeSlots = [],
    isLoading: isLoadingTimeSlots,
  } = useActivityTimesByCategory(
    selectedActivityCategory?.slug || null,
    selectedLocation?.slug || null
  );

  // Filter time slots based on category + location data
  const timeSlotOptions = useMemo(() => {
    // Don't show any time slots until both category and location are selected
    if (!selectedActivityCategory || !selectedLocation) {
      return [];
    }

    // Use the new category + location based time slots
    if (categoryLocationTimeSlots.length > 0) {
      // Transform the API response to the UI format expected by SlotSelect
      const activityBasedSlots = categoryLocationTimeSlots.map((slot: any) => ({
        id: slot.value,
        name: slot.label,
        slug: slot.value,
        value: slot.value,
        label: slot.label,
        time: slot.label,
      }));

      return activityBasedSlots;
    }

    return [];
  }, [selectedActivityCategory, selectedLocation, categoryLocationTimeSlots]);

  // Memoize default values to prevent recreating on each render
  const defaultValues = useMemo(
    () => ({
      selectedActivity: currentSearchParams.activityType || "",
      activityLocation: currentSearchParams.location || "",
      selectedDate: currentSearchParams.date
        ? new Date(currentSearchParams.date)
        : new Date(),
      selectedSlot: currentSearchParams.time || "",
      passengers: {
        adults: currentSearchParams.adults || 1, // Fixed: Match store default of 1 adult
        children: currentSearchParams.children || 0,
      },
    }),
    [currentSearchParams]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm<ActivitySearchFormData>({
    resolver: zodResolver(activitySearchSchema),
    defaultValues,
    mode: "onSubmit",
  });

  // Watch form values to update search params in real time
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Update search params when form values change
      const updates: any = {};

      if (name === "selectedSlot" && value.selectedSlot !== undefined) {
        updates.time = value.selectedSlot;
      }
      if (name === "selectedActivity" && value.selectedActivity !== undefined) {
        updates.activityType = value.selectedActivity;
        // Clear time slot when activity changes
        if (value.selectedSlot) {
          updates.time = "";
        }
      }
      if (name === "activityLocation" && value.activityLocation !== undefined) {
        updates.location = value.activityLocation;
        // Clear time slot when location changes
        if (value.selectedSlot) {
          updates.time = "";
        }
      }
      if (name === "selectedDate" && value.selectedDate !== undefined) {
        updates.date = value.selectedDate.toISOString().split("T")[0];
      }
      if (name === "passengers" && value.passengers !== undefined) {
        updates.adults = value.passengers.adults;
        updates.children = value.passengers.children;
      }

      if (Object.keys(updates).length > 0) {
        updateSearchParams(updates);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, updateSearchParams]);

  // Clear time slot when category or location changes
  React.useEffect(() => {
    const currentValues = watch();
    if (
      currentValues.selectedSlot &&
      (!selectedActivityCategory || !selectedLocation)
    ) {
      updateSearchParams({ time: "" });
    }
  }, [selectedActivityCategory, selectedLocation, watch, updateSearchParams]);

  // Reset form values when edit mode is triggered
  React.useEffect(() => {
    if (isEditMode && editingItemId) {
      reset(defaultValues);
    }
  }, [isEditMode, editingItemId, reset, defaultValues]);

  // Memoize the submit handler to prevent recreation on each render
  const onSubmit = useCallback(
    async (data: ActivitySearchFormData) => {
      // Additional validation check
      if (!data.selectedActivity) {
        setError("selectedActivity", {
          type: "manual",
          message: "Please select an activity type",
        });
        return;
      }

      // Additional validation for adults
      if (data.passengers.adults === 0) {
        setError("passengers.adults", {
          type: "manual",
          message: "At least 1 adult is required",
        });
        return;
      }

      // Convert form data to search params format
      const searchParamsUpdate = {
        activityType: data.selectedActivity,
        location: data.activityLocation, // Location is now required
        date: data.selectedDate.toISOString().split("T")[0],
        time: data.selectedSlot,
        adults: data.passengers.adults,
        children: data.passengers.children,
      };

      // Update search params
      updateSearchParams(searchParamsUpdate);

      // If in edit mode, just scroll to results instead of navigating away
      if (isEditMode) {
        // Scroll to search results to show the updated options
        const resultsElement = document.getElementById("search-results");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Only navigate for new searches (not in edit mode)
        const urlParams = new URLSearchParams({
          activityType: searchParamsUpdate.activityType,
          location: searchParamsUpdate.location,
          date: searchParamsUpdate.date,
          time: searchParamsUpdate.time,
          adults: searchParamsUpdate.adults.toString(),
          children: searchParamsUpdate.children.toString(),
        });

        router.push(`/activities/search?${urlParams.toString()}`);
      }
    },
    [updateSearchParams, setError, router, isEditMode]
  );

  // Memoize button text based on variant and edit mode
  const buttonText = useMemo(() => {
    if (isEditMode) {
      return "Update Search";
    }
    switch (variant) {
      case "compact":
        return "Search";
      case "embedded":
        return "Find Activities";
      default:
        return "Search";
    }
  }, [variant, isEditMode]);

  // Add cancel edit handler
  const handleCancelEdit = useCallback(() => {
    cancelEditing();
  }, [cancelEditing]);

  // Add save changes handler for edit mode
  const handleSaveChanges = useCallback(() => {
    if (isEditMode && editingItemId) {
      // Get the current cart item to preserve the same activity and option
      const currentItem = cart.find((item) => item.id === editingItemId);
      if (currentItem) {
        saveEditedItem(
          editingItemId,
          currentItem.activity,
          currentItem.activityOptionId
        );
      }
    }
  }, [isEditMode, editingItemId, cart, saveEditedItem]);

  // Memoized passenger handler to prevent recreation on each render
  const handlePassengerChange = useCallback(
    (field: any) => (type: string, value: number) => {
      field.onChange({
        ...field.value,
        [type]: value,
      });
    },
    []
  );

  // Loading state while fetching form options
  if (isLoadingOptions) {
    return <div className={styles.formGrid}>Loading booking options...</div>;
  }

  // Error state if data fetching failed
  if (loadError) {
    return (
      <div className={`${styles.formGrid} ${styles.errorContainer}`}>
        <div className={styles.errorMessage}>
          {loadError.message || "Failed to load form options"}
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            categories.refetch();
            locations.refetch();
            timeSlots.refetch();
          }}
          className={styles.retryButton}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Activity Search Form"
      role="form"
      className={cn(
        styles.formGrid,
        variant === "compact" && styles.formCompact,
        variant === "embedded" && styles.formEmbedded,
        className
      )}
    >
      {/* Add user feedback for time slot filtering */}
      {selectedActivityCategory && (
        <div className={styles.filterFeedback}>
          {!selectedLocation ? (
            <div className={styles.infoFeedback}>
              <span className={styles.infoHint}>
                📍 Select a location to see available time slots for{" "}
                {selectedActivityCategory.label}
              </span>
            </div>
          ) : isLoadingTimeSlots ? (
            <div className={styles.loadingFeedback}>
              <div className={styles.spinner} />
              Loading time slots for {selectedActivityCategory.label} at{" "}
              {selectedLocation.label}...
            </div>
          ) : timeSlotOptions.length > 0 ? (
            <div className={styles.infoFeedback}>
              Showing {timeSlotOptions.length} available time slot
              {timeSlotOptions.length !== 1 ? "s" : ""} for{" "}
              {selectedActivityCategory.label} at {selectedLocation.label}
            </div>
          ) : (
            <div className={styles.infoFeedback}>
              <span className={styles.infoHint}>
                ⚠️ No time slots available for {selectedActivityCategory.label}{" "}
                at {selectedLocation.label}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={styles.formContent}>
        {/* Activity Type */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="selectedActivity"
            render={({ field }) => (
              <ActivitySelect
                value={field.value}
                onChange={field.onChange}
                options={activityOptions}
                placeholder="Select Type"
                hasError={!!errors.selectedActivity}
                errorMessage={errors.selectedActivity?.message}
              />
            )}
          />
          {/* {errors.selectedActivity && (
            <div className={styles.errorMessage}>
              {errors.selectedActivity.message}
            </div>
          )} */}
        </div>

        {/* Location */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="activityLocation"
            render={({ field }) => (
              <LocationSelect
                label="Location"
                value={field.value || ""}
                onChange={field.onChange}
                options={locationOptions}
                placeholder="Select Area"
                hasError={!!errors.activityLocation}
                errorMessage={errors.activityLocation?.message}
              />
            )}
          />
          {/* {errors.activityLocation && (
            <div className={styles.errorMessage}>
              {errors.activityLocation.message}
            </div>
          )} */}
        </div>

        {/* Date */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="selectedDate"
            render={({ field }) => (
              <DateSelect
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                hasError={!!errors.selectedDate}
                minDaysFromNow={1}
              />
            )}
          />
          {errors.selectedDate && (
            <div className={styles.errorMessage}>
              {errors.selectedDate.message}
            </div>
          )}
        </div>

        {/* Time Slot */}
        <div
          className={cn(
            styles.formField
            // , styles.timeSlotField
          )}
        >
          <Controller
            control={control}
            name="selectedSlot"
            render={({ field }) => (
              <SlotSelect
                value={field.value}
                onChange={field.onChange}
                options={timeSlotOptions}
                placeholder={
                  !selectedActivityCategory
                    ? "Select activity first"
                    : !selectedLocation
                    ? "Select location first"
                    : isLoadingTimeSlots
                    ? "Loading times..."
                    : timeSlotOptions.length === 0
                    ? "No times available"
                    : "Select Time"
                }
                hasError={!!errors.selectedSlot}
                isLoading={isLoadingTimeSlots}
                errorMessage={errors.selectedSlot?.message}
                disabled={
                  !selectedActivityCategory ||
                  !selectedLocation ||
                  isLoadingTimeSlots
                }
              />
            )}
          />
          {/* {errors.selectedSlot && (
            <div className={styles.errorMessage}>
              {errors.selectedSlot.message}
            </div>
          )} */}
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
                hideInfants={true} // COMMENTED OUT: Hide infants for activities
                hideChildren={true} // COMMENTED OUT: Hide children for activities
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
        <div className={styles.buttonContainer}>
          <Button
            variant="primary"
            className={styles.searchButton}
            showArrow
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Searching..." : buttonText}
          </Button>

          {/* Save Changes button for edit mode */}
          {isEditMode && (
            <Button
              variant="secondary"
              className={styles.saveButton}
              onClick={handleSaveChanges}
              type="button"
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
