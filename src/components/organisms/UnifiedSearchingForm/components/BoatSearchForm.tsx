"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBoat } from "@/store/BoatStore";
import { useRouter } from "next/navigation";
import {
  useBoatFormOptions,
  useBoatRoutesByFromLocation,
} from "@/hooks/queries/useBoats";
import styles from "../UnifiedSearchingForm.module.css";
import { cn } from "@/utils/cn";

import {
  Button,
  DateSelect,
  PassengerCounter,
  SlotSelect,
  LocationSelect,
} from "@/components/atoms";

// Schema for boat search form
const boatSearchSchema = z.object({
  fromLocation: z.string().min(1, "Please select departure location"),
  toLocation: z.string().min(1, "Please select destination location"),
  selectedDate: z.date({ required_error: "Please select a date" }),
  selectedSlot: z.string().min(1, "Please select a time"),
  passengers: z.object({
    adults: z
      .number()
      .min(1, "At least 1 adult required")
      .max(10, "Maximum 10 adults"),
    children: z.number().min(0).max(10, "Maximum 10 children"),
  }),
});

type BoatSearchFormData = z.infer<typeof boatSearchSchema>;

interface BoatSearchFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

export function BoatSearchForm({
  className,
  variant = "default",
}: BoatSearchFormProps) {
  const router = useRouter();
  const {
    searchParams,
    updateSearchParams,
    editingItemId,
    editingSearchParams,
    cancelEditing,
    saveEditedItem,
    cart,
  } = useBoat();

  // Fetch boat form options
  const {
    boatRoutes,
    fromLocations,
    isLoading: isLoadingOptions,
    error: loadError,
  } = useBoatFormOptions();

  // Check if we're in edit mode
  const isEditMode = !!editingItemId;

  // Use editing search params when in edit mode, otherwise use regular search params
  const currentSearchParams =
    isEditMode && editingSearchParams ? editingSearchParams : searchParams;

  // Transform data for select components
  const fromLocationOptions = useMemo(() => {
    return fromLocations.map((location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      value: location.slug,
      label: location.name,
    }));
  }, [fromLocations]);

  const toLocationOptions = useMemo(() => {
    // Get available routes based on selected from location
    if (!currentSearchParams.fromLocation || !boatRoutes.data) {
      return [];
    }

    const availableRoutes = boatRoutes.data.filter((route) => {
      if (route.fromLocation && typeof route.fromLocation === "object") {
        return route.fromLocation.slug === currentSearchParams.fromLocation;
      }
      return false;
    });

    return availableRoutes.map((route) => ({
      id: route.id,
      name: route.toLocation,
      slug: route.slug,
      value: route.id,
      label: route.toLocation,
    }));
  }, [currentSearchParams.fromLocation, boatRoutes.data]);

  // Available time slots based on selected route
  const timeSlotOptions = useMemo(() => {
    if (!currentSearchParams.toLocation || !boatRoutes.data) {
      return [];
    }

    const selectedRoute = boatRoutes.data.find(
      (route) => route.id === currentSearchParams.toLocation
    );
    if (!selectedRoute || !selectedRoute.availableTimings) {
      return [];
    }

    return selectedRoute.availableTimings.map((timing) => ({
      id:
        timing.departureTime?.replace(":", "-") ||
        timing.id ||
        `slot-${Math.random().toString(36).substr(2, 9)}`,
      name: timing.displayTime || timing.departureTime || "Unknown Time",
      slug:
        timing.departureTime?.replace(":", "-") ||
        timing.id ||
        `slot-${Math.random().toString(36).substr(2, 9)}`,
      value:
        timing.departureTime?.replace(":", "-") ||
        timing.id ||
        `slot-${Math.random().toString(36).substr(2, 9)}`,
      label: timing.displayTime || timing.departureTime || "Unknown Time",
      time: timing.displayTime || timing.departureTime || "Unknown Time",
    }));
  }, [currentSearchParams.toLocation, boatRoutes.data]);

  // Memoize default values to prevent recreating on each render
  const defaultValues = useMemo(
    () => ({
      fromLocation: currentSearchParams.fromLocation || "",
      toLocation: currentSearchParams.toLocation || "",
      selectedDate: currentSearchParams.date
        ? new Date(currentSearchParams.date)
        : new Date(),
      selectedSlot: currentSearchParams.time || "",
      passengers: {
        adults: currentSearchParams.adults || 1, // Fixed: Match activity default of 1 adult
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
  } = useForm<BoatSearchFormData>({
    resolver: zodResolver(boatSearchSchema),
    defaultValues,
    mode: "onSubmit",
  });

  // Watch form values to update search params in real time
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Update search params when form values change
      const updates: any = {};

      if (name === "fromLocation" && value.fromLocation !== undefined) {
        updates.fromLocation = value.fromLocation;
        // Clear toLocation when fromLocation changes
        updates.toLocation = "";
      }
      if (name === "toLocation" && value.toLocation !== undefined) {
        updates.toLocation = value.toLocation;
      }
      if (name === "selectedDate" && value.selectedDate !== undefined) {
        updates.date = value.selectedDate.toISOString().split("T")[0];
      }
      if (name === "selectedSlot" && value.selectedSlot !== undefined) {
        updates.time = value.selectedSlot;
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

  // Reset form values when edit mode is triggered
  React.useEffect(() => {
    if (isEditMode && editingItemId) {
      reset(defaultValues);
    }
  }, [isEditMode, editingItemId, reset, defaultValues]);

  // Memoize the submit handler
  const onSubmit = useCallback(
    async (data: BoatSearchFormData) => {
      // Additional validation
      if (!data.fromLocation) {
        setError("fromLocation", {
          type: "manual",
          message: "Please select departure location",
        });
        return;
      }

      if (!data.toLocation) {
        setError("toLocation", {
          type: "manual",
          message: "Please select destination",
        });
        return;
      }

      if (data.passengers.adults === 0) {
        setError("passengers.adults", {
          type: "manual",
          message: "At least 1 adult is required",
        });
        return;
      }

      // Convert form data to search params format
      const searchParamsUpdate = {
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
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
          fromLocation: searchParamsUpdate.fromLocation,
          toLocation: searchParamsUpdate.toLocation,
          date: searchParamsUpdate.date,
          time: searchParamsUpdate.time,
          adults: searchParamsUpdate.adults.toString(),
          children: searchParamsUpdate.children.toString(),
        });

        router.push(`/boat/search?${urlParams.toString()}`);
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
        return "Find Boats";
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
      // Get the current cart item to preserve the same boat
      const currentItem = cart.find((item) => item.id === editingItemId);
      if (currentItem) {
        saveEditedItem(
          editingItemId,
          currentItem.boat,
          currentItem.selectedTime
        );
      }
    }
  }, [isEditMode, editingItemId, cart, saveEditedItem]);

  // Memoized passenger handler
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
    return <div className={styles.formGrid}>Loading boat options...</div>;
  }

  // Error state if data fetching failed
  if (loadError) {
    return (
      <div className={`${styles.formGrid} ${styles.errorContainer}`}>
        <div className={styles.errorMessage}>
          {loadError.message || "Failed to load boat options"}
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            boatRoutes.refetch();
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
      aria-label="Boat Search Form"
      role="form"
      className={cn(
        styles.formGrid,
        variant === "compact" && styles.formCompact,
        variant === "embedded" && styles.formEmbedded,
        className
      )}
    >
      <div className={styles.formContent}>
        {/* From Location */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="fromLocation"
            render={({ field }) => (
              <LocationSelect
                label="From"
                value={field.value}
                onChange={field.onChange}
                options={fromLocationOptions}
                placeholder="Departure Port"
                hasError={!!errors.fromLocation}
                errorMessage={errors.fromLocation?.message}
              />
            )}
          />
          {/* {errors.fromLocation && (
            <div className={styles.errorMessage}>
              {errors.fromLocation.message}
            </div>
          )} */}
        </div>

        {/* To Location */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="toLocation"
            render={({ field }) => (
              <LocationSelect
                label="To"
                value={field.value || ""}
                onChange={field.onChange}
                options={toLocationOptions}
                placeholder="Destination Port"
                hasError={!!errors.toLocation}
                errorMessage={errors.toLocation?.message}
                // disabled={!currentSearchParams.fromLocation}
              />
            )}
          />
          {/* {errors.toLocation && (
            <div className={styles.errorMessage}>
              {errors.toLocation.message}
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
        <div className={cn(styles.formField)}>
          <Controller
            control={control}
            name="selectedSlot"
            render={({ field }) => (
              <SlotSelect
                value={field.value}
                onChange={field.onChange}
                options={timeSlotOptions}
                placeholder="Select Time"
                hasError={!!errors.selectedSlot}
                errorMessage={errors.selectedSlot?.message}
                disabled={!currentSearchParams.toLocation}
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
                hideInfants={true} // COMMENTED OUT: Hide infants for activities (boat bookings)
                hideChildren={true} // COMMENTED OUT: Hide children for activities (boat bookings)
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
