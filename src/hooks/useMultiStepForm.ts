"use client";

import { useState, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

interface UseMultiStepFormProps {
  totalSteps: number;
  form: UseFormReturn<any>;
  stepsSchemas: any[];
}

export const useMultiStepForm = ({
  totalSteps,
  form,
  stepsSchemas,
}: UseMultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const scrollPositions = useRef<Record<number, number>>({});

  // Save the current scroll position for the current step
  const saveScrollPosition = useCallback(() => {
    scrollPositions.current[currentStep] = window.scrollY;
  }, [currentStep]);

  // Restore the saved scroll position for a step
  const restoreScrollPosition = useCallback((step: number) => {
    setTimeout(() => {
      const savedPosition = scrollPositions.current[step];
      if (savedPosition !== undefined) {
        window.scrollTo({
          top: savedPosition,
          behavior: "auto", // Use "auto" for immediate scroll without animation
        });
      } else {
        // If no saved position, scroll to top of form
        const formElement = document.querySelector("form");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }
    }, 0);
  }, []);

  const validateCurrentStep = useCallback(async () => {
    if (isValidating) return false;

    const schema = stepsSchemas[currentStep - 1];
    if (!schema) return true;

    try {
      setIsValidating(true);
      // Use a more targeted validation approach
      const formData = form.getValues();

      // Trigger validation for all fields in the current step
      await form.trigger();

      // For step 1, only validate the specific fields needed
      if (currentStep === 1) {
        const { personalDetails, tripDetails, travelGoals } = formData;
        await schema.parseAsync({
          personalDetails,
          tripDetails,
          travelGoals,
          specialOccasion: formData.specialOccasion || [],
        });
      } else {
        await schema.parseAsync(formData);
      }

      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      return true;
    } catch {
      // Validation failed - this is expected behavior when fields are invalid
      // Scroll to top of form to show errors
      const formElement = document.querySelector("form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      return false;
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, form, stepsSchemas, isValidating]);

  const nextStep = useCallback(async () => {
    if (isValidating) return false;

    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      saveScrollPosition();
      setCurrentStep((prev) => {
        const nextStepNum = prev + 1;
        setTimeout(() => restoreScrollPosition(nextStepNum), 0);
        return nextStepNum;
      });
    }
    return isValid;
  }, [
    currentStep,
    totalSteps,
    validateCurrentStep,
    isValidating,
    saveScrollPosition,
    restoreScrollPosition,
  ]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      saveScrollPosition();
      setCurrentStep((prev) => {
        const prevStepNum = prev - 1;
        setTimeout(() => restoreScrollPosition(prevStepNum), 0);
        return prevStepNum;
      });
    }
  }, [currentStep, saveScrollPosition, restoreScrollPosition]);

  const goToStep = useCallback(
    async (step: number) => {
      if (isValidating) return;

      if (step >= 1 && step <= totalSteps) {
        // Always allow going to previous steps without validation
        if (step < currentStep) {
          saveScrollPosition();
          setCurrentStep(step);
          setTimeout(() => restoreScrollPosition(step), 0);
        }
        // For next steps, require validation
        else if (step > currentStep) {
          const isValid = await validateCurrentStep();
          if (isValid) {
            saveScrollPosition();
            setCurrentStep(step);
            setTimeout(() => restoreScrollPosition(step), 0);
          }
        }
      }
    },
    [
      currentStep,
      totalSteps,
      validateCurrentStep,
      isValidating,
      saveScrollPosition,
      restoreScrollPosition,
    ]
  );

  const isStepCompleted = useCallback(
    (step: number) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  const isStepAccessible = useCallback(
    (step: number) => {
      // Allow access to current step, completed steps, and previous steps
      return step <= currentStep || completedSteps.has(step);
    },
    [currentStep, completedSteps]
  );

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isStepCompleted,
    isStepAccessible,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    isValidating,
    saveScrollPosition,
    restoreScrollPosition,
  };
};
