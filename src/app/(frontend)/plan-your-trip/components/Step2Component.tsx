import React, { useEffect, useMemo, useState } from "react";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import * as Accordion from "@radix-ui/react-accordion";
import { AlertCircle, ChevronDown } from "lucide-react";
import { TripFormData } from "../TripFormSchema";
import { addDays, format, differenceInDays } from "date-fns";
import styles from "./Step2Component.module.css";
import { LocationSelect } from "@/components/atoms/LocationSelect/LocationSelect";
import { ActivitySelect } from "@/components/atoms/ActivitySelect/ActivitySelect";
import { Activity } from "@/components/atoms/ActivitySelect/ActivitySelect.types";
import { Location } from "@/components/atoms/LocationSelect/LocationSelect.types";
import { Textarea } from "@/components/atoms/Textarea/Textarea";
import { cn } from "@/utils/cn";

interface Step2ComponentProps {
  form: UseFormReturn<TripFormData>;
  accordionErrorIndices?: number[];
}

const DESTINATIONS: Location[] = [
  {
    id: "havelock",
    name: "Havelock Island",
    slug: "havelock",
    value: "havelock",
    label: "Havelock Island",
  },
  {
    id: "neil",
    name: "Neil Island",
    slug: "neil",
    value: "neil",
    label: "Neil Island",
  },
  {
    id: "port-blair",
    name: "Port Blair",
    slug: "port-blair",
    value: "port-blair",
    label: "Port Blair",
  },
  {
    id: "ross",
    name: "Ross Island",
    slug: "ross",
    value: "ross",
    label: "Ross Island",
  },
  // {
  //   id: "baratang",
  //   name: "Baratang Island",
  //   slug: "baratang",
  //   value: "baratang",
  //   label: "Baratang Island",
  // },
  {
    id: "rangat",
    name: "Rangat",
    slug: "rangat",
    value: "rangat",
    label: "Rangat",
  },
  {
    id: "diglipur",
    name: "Diglipur",
    slug: "diglipur",
    value: "diglipur",
    label: "Diglipur",
  },
];

const ACTIVITIES: Activity[] = [
  {
    id: "scuba-diving",
    name: "Scuba Diving",
    slug: "scuba-diving",
    value: "scuba-diving",
    label: "Scuba Diving",
  },
  {
    id: "snorkeling",
    name: "Snorkeling",
    slug: "snorkeling",
    value: "snorkeling",
    label: "Snorkeling",
  },
  {
    id: "beach-relaxation",
    name: "Beach Relaxation",
    slug: "beach-relaxation",
    value: "beach-relaxation",
    label: "Beach Relaxation",
  },
  {
    id: "sightseeing",
    name: "Sightseeing",
    slug: "sightseeing",
    value: "sightseeing",
    label: "Sightseeing",
  },
  {
    id: "water-sports",
    name: "Water Sports",
    slug: "water-sports",
    value: "water-sports",
    label: "Water Sports",
  },
  {
    id: "mangrove-tour",
    name: "Mangrove Tour",
    slug: "mangrove-tour",
    value: "mangrove-tour",
    label: "Mangrove Tour",
  },
  {
    id: "historical-sites",
    name: "Historical Sites",
    slug: "historical-sites",
    value: "historical-sites",
    label: "Historical Sites",
  },
  {
    id: "fishing",
    name: "Fishing",
    slug: "fishing",
    value: "fishing",
    label: "Fishing",
  },
];

// Maximum reasonable number of days to generate
const MAX_DAYS = 30;

export const Step2Component: React.FC<Step2ComponentProps> = ({
  form,
  accordionErrorIndices = [],
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = form;

  // Track which accordion items are open
  const [openItems, setOpenItems] = useState<string[]>([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itinerary",
  });

  const arrivalDate = watch("tripDetails.arrivalDate");
  const departureDate = watch("tripDetails.departureDate");

  // Calculate days difference with memoization to avoid recalculation
  const daysDifference = useMemo(() => {
    if (!arrivalDate || !departureDate) return 0;
    try {
      const start = new Date(arrivalDate);
      const end = new Date(departureDate);
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
      // Use date-fns for more accurate calculation
      return differenceInDays(end, start) + 1;
    } catch (error) {
      console.error("Error calculating days difference:", error);
      return 0;
    }
  }, [arrivalDate, departureDate]);

  // Warning message for large date ranges
  const showWarning = daysDifference > MAX_DAYS;

  // Auto-generate itinerary days based on dates - optimized
  useEffect(() => {
    if (!arrivalDate || !departureDate) return;
    try {
      const start = new Date(arrivalDate);
      const end = new Date(departureDate);
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      // Calculate days, but cap at MAX_DAYS to prevent performance issues
      const days = Math.min(
        Math.max(1, differenceInDays(end, start) + 1),
        MAX_DAYS
      );

      // Only update if the number of days has changed
      if (days > 0 && days !== fields.length) {
        // Use a more efficient approach for large arrays
        const newFields = Array.from({ length: days }, (_, i) => {
          const dayDate = addDays(start, i);
          return {
            day: i + 1,
            date: format(dayDate, "yyyy-MM-dd"),
            destination: "",
            activity: "",
            notes: "",
          };
        });

        // Remove all existing fields at once
        remove();
        // Batch append all fields at once
        append(newFields);

        // Open the first accordion item by default
        if (days > 0) {
          setOpenItems(["day-0"]);
        }
      }
    } catch (error) {
      console.error("Error generating itinerary:", error);
    }
  }, [
    daysDifference,
    arrivalDate,
    departureDate,
    fields.length,
    append,
    remove,
  ]);

  // Auto-open accordion items with errors
  useEffect(() => {
    if (accordionErrorIndices.length > 0) {
      const newOpenItems = accordionErrorIndices.map((index) => `day-${index}`);
      setOpenItems((prev) => {
        const combined = [...prev, ...newOpenItems];
        return [...new Set(combined)]; // Remove duplicates
      });
    }
  }, [accordionErrorIndices]);

  // Format date for display in the day header
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `(${format(date, "do MMMM yyyy")})`;
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.step2Container}>
      {showWarning && (
        <div className={styles.warningMessage}>
          <AlertCircle size={16} />
          <span>
            You've selected a large date range ({daysDifference} days). For
            better performance, only the first {MAX_DAYS} days have been
            generated.
          </span>
        </div>
      )}

      {fields.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            Please complete your travel dates in Step 1 to plan your daily
            itinerary.
          </p>
        </div>
      ) : (
        <div className={styles.itineraryContainer}>
          <Accordion.Root
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className={styles.accordionRoot}
          >
            {fields.map((field, index) => {
              const hasError = accordionErrorIndices.includes(index);
              return (
                <Accordion.Item
                  key={field.id}
                  value={`day-${index}`}
                  className={cn(
                    styles.accordionItem,
                    hasError && styles.accordionItemError
                  )}
                >
                  <Accordion.Header className={styles.accordionHeader}>
                    <Accordion.Trigger
                      className={cn(
                        styles.accordionTrigger,
                        hasError && styles.accordionTriggerError
                      )}
                    >
                      <div className={styles.dayTitle}>
                        <span className={styles.day}>Day {field.day} </span>
                        <span className={styles.date}>
                          {formatDateForDisplay(field.date)}
                        </span>
                      </div>
                      <div className={styles.triggerRight}>
                        {hasError && (
                          <AlertCircle size={16} className={styles.errorIcon} />
                        )}
                        <ChevronDown className={styles.chevron} />
                      </div>
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content className={styles.accordionContent}>
                    <div className={styles.formRow}>
                      <div className={styles.formField}>
                        <Controller
                          name={`itinerary.${index}.destination`}
                          control={control}
                          render={({ field }) => (
                            <LocationSelect
                              value={field.value}
                              onChange={field.onChange}
                              label="Add Destination"
                              options={DESTINATIONS}
                              hasError={
                                hasError &&
                                !!errors.itinerary?.[index]?.destination
                              }
                              errorMessage={
                                hasError
                                  ? errors.itinerary?.[index]?.destination
                                      ?.message
                                  : undefined
                              }
                              className={styles.selectComponent}
                            />
                          )}
                        />
                      </div>

                      <div className={styles.formField}>
                        <Controller
                          name={`itinerary.${index}.activity`}
                          control={control}
                          render={({ field }) => (
                            <ActivitySelect
                              value={field.value}
                              onChange={field.onChange}
                              options={ACTIVITIES}
                              hasError={
                                hasError &&
                                !!errors.itinerary?.[index]?.activity
                              }
                              errorMessage={
                                hasError
                                  ? errors.itinerary?.[index]?.activity?.message
                                  : undefined
                              }
                              className={styles.selectComponent}
                              placeholder="Select your activity"
                            />
                          )}
                        />
                      </div>

                      <div className={styles.formField}>
                        <Controller
                          name={`itinerary.${index}.notes`}
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              name={`itinerary.${index}.notes`}
                              control={control}
                              rows={1}
                              label="Add Note (Optional)"
                              placeholder="Add custom notes for the day"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>
        </div>
      )}
    </div>
  );
};
