import { useState, useEffect } from "react";
import { UseFormReturn, FieldError } from "react-hook-form";
import { TripFormData } from "../../app/(frontend)/plan-your-trip/TripFormSchema";

// Define the error item interface
interface ErrorItem {
  message: string;
  fieldId?: string;
}

export const useFormErrors = (form: UseFormReturn<TripFormData>, currentStep: number = 1) => {
  const { formState, trigger, setFocus } = form;
  const { errors, isSubmitting } = formState;

  const [errorSummary, setErrorSummary] = useState<ErrorItem[]>([]);

  // Track validation per step - { stepNumber: hasTriggered }
  const [triggeredSteps, setTriggeredSteps] = useState<Record<number, boolean>>({});

  // Track which accordion items have errors (for Step 2)
  const [accordionErrorIndices, setAccordionErrorIndices] = useState<number[]>(
    []
  );

  // Check if current step has triggered validation
  const hasTriggeredValidation = triggeredSteps[currentStep] || false;

  // Update error summary whenever errors change
  useEffect(() => {
    if (!hasTriggeredValidation) return;

    const summary: ErrorItem[] = [];
    const errorIndices: number[] = [];

    // Process all errors and create human-readable messages
    if (errors.personalDetails?.name) {
      summary.push({
        message: "Please enter your name",
        fieldId: "personalDetails.name",
      });
    }

    if (errors.personalDetails?.email) {
      summary.push({
        message: "Please enter a valid email address",
        fieldId: "personalDetails.email",
      });
    }

    if (errors.personalDetails?.phone) {
      summary.push({
        message: "Please enter a valid phone number",
        fieldId: "personalDetails.phone",
      });
    }

    if (errors.tripDetails?.arrivalDate) {
      summary.push({
        message: "Please select an arrival date",
        fieldId: "tripDetails.arrivalDate",
      });
    }

    if (errors.tripDetails?.departureDate) {
      summary.push({
        message: "Please select a valid departure date",
        fieldId: "tripDetails.departureDate",
      });
    }

    if (errors.travelGoals && errors.travelGoals.message) {
      summary.push({
        message: "Please select at least one travel goal",
        fieldId: "travelGoals",
      });
    }

    // Check for itinerary errors
    if (errors.itinerary) {
      // Type assertion for itinerary errors
      const itineraryArray = Array.isArray(errors.itinerary)
        ? errors.itinerary
        : [];

      itineraryArray.forEach((dayError: any, index: number) => {
        if (dayError) {
          errorIndices.push(index);

          if (dayError.destination) {
            summary.push({
              message: `Day ${index + 1}: Please select a destination`,
              fieldId: `itinerary.${index}.destination`,
            });
          }

          if (dayError.activity) {
            summary.push({
              message: `Day ${index + 1}: Please select an activity`,
              fieldId: `itinerary.${index}.activity`,
            });
          }
        }
      });
    }

    // Hotel preferences errors
    if (errors.hotelPreferences?.hotelType) {
      summary.push({
        message: "Please select a hotel type",
        fieldId: "hotelPreferences.hotelType",
      });
    }

    if (errors.hotelPreferences?.roomPreference) {
      summary.push({
        message: "Please select a room preference",
        fieldId: "hotelPreferences.roomPreference",
      });
    }

    // Ferry preferences errors
    if (errors.ferryPreferences?.ferryClass) {
      summary.push({
        message: "Please select a ferry class",
        fieldId: "ferryPreferences.ferryClass",
      });
    }

    if (errors.ferryPreferences?.travelTimeSlot) {
      summary.push({
        message: "Please select a travel time slot",
        fieldId: "ferryPreferences.travelTimeSlot",
      });
    }

    // Add-ons errors
    if (errors.addOns?.mealPreference) {
      summary.push({
        message: "Please select a meal preference",
        fieldId: "addOns.mealPreference",
      });
    }

    if (errors.addOns?.transportation) {
      summary.push({
        message: "Please select a transportation option",
        fieldId: "addOns.transportation",
      });
    }

    setErrorSummary(summary);
    setAccordionErrorIndices(errorIndices);
  }, [errors, hasTriggeredValidation]);

  // Focus on the first error field
  const focusFirstError = () => {
    // Order of fields to check based on form structure
    const errorFields = [
      // Step 1
      "personalDetails.name",
      "personalDetails.email",
      "personalDetails.phone",
      "tripDetails.arrivalDate",
      "tripDetails.departureDate",
      "travelGoals",
      "specialOccasion",

      // Step 2 - Itinerary is handled separately

      // Step 3
      "hotelPreferences.hotelType",
      "hotelPreferences.roomPreference",
      "hotelPreferences.specificHotel",
      "ferryPreferences.ferryClass",
      "ferryPreferences.travelTimeSlot",
      "ferryPreferences.preferredFerry",
      "addOns.mealPreference",
      "addOns.transportation",
    ];

    // Check itinerary fields
    if (errors.itinerary && Array.isArray(errors.itinerary)) {
      for (let i = 0; i < errors.itinerary.length; i++) {
        if (errors.itinerary[i]?.destination) {
          setFocus(`itinerary.${i}.destination` as any);
          return;
        }
        if (errors.itinerary[i]?.activity) {
          setFocus(`itinerary.${i}.activity` as any);
          return;
        }
      }
    }

    // Check other fields in order
    for (const field of errorFields) {
      const fieldParts = field.split(".");
      let hasError = false;

      if (fieldParts.length === 1) {
        hasError = !!errors[field as keyof TripFormData];
      } else if (fieldParts.length === 2) {
        const [parent, child] = fieldParts;
        hasError = !!(errors[parent as keyof TripFormData] as any)?.[child];
      }

      if (hasError) {
        setFocus(field as any);
        return;
      }
    }
  };

  // Validate all fields in the current step
  const validateStep = async () => {
    setTriggeredSteps(prev => ({ ...prev, [currentStep]: true }));
    const isValid = await trigger();

    if (!isValid) {
      // Focus on the first error field after a short delay
      // to ensure the DOM has updated
      setTimeout(() => {
        focusFirstError();
      }, 100);
    }

    return isValid;
  };

  return {
    errorSummary,
    accordionErrorIndices,
    validateStep,
    focusFirstError,
    hasErrors: Object.keys(errors).length > 0,
    isSubmitting,
    hasTriggeredValidation,
  };
};
