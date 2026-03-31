import React, { useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { TripFormData } from "../TripFormSchema";
import styles from "./Step1Component.module.css";
import { DateSelect, Input } from "@/components/atoms";
import { PassengerCounter } from "@/components/atoms/PassengerCounter/PassengerCounter";
import type { PassengerCount } from "@/components/atoms/PassengerCounter/PassengerCounter";

interface Step1ComponentProps {
  form: UseFormReturn<TripFormData>;
}

const TRAVEL_GOALS = [
  { id: "relaxation", label: "Relaxation & nature" },
  { id: "adventure", label: "Adventure & sports" },
  { id: "balanced", label: "Balanced" },
  { id: "unexplored", label: "Unexplored islands" },
  { id: "family", label: "Family-friendly activities" },
];

const SPECIAL_OCCASIONS = [
  { id: "honeymoon", label: "Honeymoon" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "solo", label: "Solo Trip" },
  { id: "other", label: "Other" },
];

export const Step1Component: React.FC<Step1ComponentProps> = ({ form }) => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = form;

  // Watch arrival date to validate departure date
  const arrivalDateStr = watch("tripDetails.arrivalDate");
  const adults = watch("tripDetails.adults");
  const children = watch("tripDetails.children");

  // Validate dates whenever arrival date changes
  useEffect(() => {
    if (arrivalDateStr) {
      // Trigger validation on departure date when arrival date changes
      trigger("tripDetails.departureDate");
    }
  }, [arrivalDateStr, trigger]);

  // Handle passenger count changes
  const handlePassengerChange = (type: keyof PassengerCount, value: number) => {
    if (type === "adults") {
      // Ensure at least 1 adult
      const newValue = Math.max(1, value);
      setValue("tripDetails.adults", newValue);
    } else if (type === "children") {
      // Ensure non-negative children count
      const newValue = Math.max(0, value);
      setValue("tripDetails.children", newValue);
    }
  };

  return (
    <div className={styles.step1Container}>
      {/* Personal Details Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Your Details</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <Input
              name="personalDetails.name"
              control={control}
              label="Name"
              placeholder="Enter your name"
              required
              hasError={!!errors.personalDetails?.name}
              errorMessage={errors.personalDetails?.name?.message}
            />
          </div>

          <div className={styles.formField}>
            <Input
              name="personalDetails.phone"
              control={control}
              label="Contact Details"
              placeholder="+91 00000 00000"
              type="tel"
              required
              hasError={!!errors.personalDetails?.phone}
              errorMessage={errors.personalDetails?.phone?.message}
            />
          </div>

          <div className={styles.formField}>
            <Input
              name="personalDetails.email"
              control={control}
              label="Mail ID"
              placeholder="Enter your email"
              type="email"
              required
              hasError={!!errors.personalDetails?.email}
              errorMessage={errors.personalDetails?.email?.message}
            />
          </div>
        </div>
      </div>

      {/* Trip Details Section */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>
            When Are You Planning to Visit?
          </h3>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.formField}>
            <Controller
              name="tripDetails.arrivalDate"
              control={control}
              render={({ field }) => (
                <DateSelect
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => {
                    // Format date as ISO string and store
                    setValue("tripDetails.arrivalDate", date.toISOString());

                    // If departure date is before arrival date, update it
                    const departureDate = watch("tripDetails.departureDate");
                    if (departureDate) {
                      const departureDateObj = new Date(departureDate);
                      if (departureDateObj < date) {
                        // Set departure date to arrival date + 1 day
                        const newDepartureDate = new Date(date);
                        newDepartureDate.setDate(date.getDate() + 1);
                        setValue(
                          "tripDetails.departureDate",
                          newDepartureDate.toISOString()
                        );
                      }
                    }

                    // Trigger validation
                    trigger("tripDetails.arrivalDate");
                  }}
                  label="Arrival Dates"
                  required
                  hasError={!!errors.tripDetails?.arrivalDate}
                  errorMessage={errors.tripDetails?.arrivalDate?.message}
                />
              )}
            />
          </div>

          <div className={styles.formField}>
            <Controller
              name="tripDetails.departureDate"
              control={control}
              render={({ field }) => {
                // Calculate minimum date (arrival date or today)
                let minDate = new Date();
                if (arrivalDateStr) {
                  const arrivalDate = new Date(arrivalDateStr);
                  if (arrivalDate > minDate) {
                    minDate = arrivalDate;
                  }
                }

                return (
                  <DateSelect
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => {
                      // Format date as ISO string and store
                      setValue("tripDetails.departureDate", date.toISOString());
                      trigger("tripDetails.departureDate");
                    }}
                    label="Departure Dates"
                    required
                    hasError={!!errors.tripDetails?.departureDate}
                    errorMessage={errors.tripDetails?.departureDate?.message}
                  />
                );
              }}
            />
          </div>

          <div className={styles.formField}>
            <PassengerCounter
              value={{
                adults: adults || 1,
                children: children || 0,
              }}
              onChange={handlePassengerChange}
              hasError={
                !!errors.tripDetails?.adults || !!errors.tripDetails?.children
              }
              className={styles.passengerCounter}
              hideInfants
            />
          </div>
        </div>
      </div>

      {/* Travel Goals Section */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>Your Travel Goals</h3>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.checkboxGrid}>
            {TRAVEL_GOALS.map((goal) => (
              <Controller
                key={goal.id}
                name="travelGoals"
                control={control}
                render={({ field }) => (
                  <div className={styles.checkboxItem}>
                    <Checkbox.Root
                      id={goal.id}
                      checked={field.value?.includes(goal.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...field.value, goal.id]);
                        } else {
                          field.onChange(
                            field.value?.filter((id) => id !== goal.id)
                          );
                        }
                      }}
                      className={styles.checkbox}
                    >
                      <Checkbox.Indicator className={styles.checkboxIndicator}>
                        <Check size={16} />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label htmlFor={goal.id} className={styles.checkboxLabel}>
                      {goal.label}
                    </label>
                  </div>
                )}
              />
            ))}
          </div>
          {errors.travelGoals && (
            <span className={styles.error}>{errors.travelGoals.message}</span>
          )}
        </div>
      </div>

      {/* Special Occasion Section */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionHeaderTitle}>
            Special Occasion (Optional)
          </h3>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.checkboxGrid}>
            {SPECIAL_OCCASIONS.map((occasion) => (
              <Controller
                key={occasion.id}
                name="specialOccasion"
                control={control}
                render={({ field }) => (
                  <div className={styles.checkboxItem}>
                    <Checkbox.Root
                      id={occasion.id}
                      checked={field.value?.includes(occasion.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), occasion.id]);
                        } else {
                          field.onChange(
                            field.value?.filter((id) => id !== occasion.id)
                          );
                        }
                      }}
                      className={styles.checkbox}
                    >
                      <Checkbox.Indicator className={styles.checkboxIndicator}>
                        <Check size={16} />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label
                      htmlFor={occasion.id}
                      className={styles.checkboxLabel}
                    >
                      {occasion.label}
                    </label>
                  </div>
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
