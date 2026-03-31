"use client";
import React, { useLayoutEffect, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { useFerryStore } from "@/store/FerryStore";
import { useBoatStore } from "@/store/BoatStore";
import { useActivityStoreRQ } from "@/store/ActivityStoreRQ";
import { StepIndicator } from "@/app/(frontend)/plan-your-trip/components/StepIndicator";
import { MemberDetailsStep } from "../MemberDetailsStep";
import { ReviewStep } from "../ReviewStep";
import { ConfirmationStep } from "../ConfirmationStep";
import { LoadingOverlay } from "@/components/molecules/LoadingOverlay";
import { useCheckoutProtection } from "@/hooks/useCheckoutProtection";
import { AlertDialog } from "@/components/atoms/AlertDialog";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import styles from "./CheckoutFlow.module.css";

// Checkout steps configuration
const CHECKOUT_STEPS = [
  {
    id: 1,
    title: "Enter your details",
    description: "Add member information",
  },
  {
    id: 2,
    title: "Review",
    description: "Verify your details",
  },
  {
    id: 3,
    title: "Checkout",
    description: "Booking confirmation",
  },
];

interface CheckoutFlowProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  bookingData,
  requirements,
}) => {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    bookingConfirmation,
    formData,
    cleanupOrphanedSessions,
    resetAfterBooking,
    isLoading,
  } = useCheckoutStore();
  
  const ferryReset = useFerryStore((state) => state.reset);
  const boatReset = useBoatStore((state) => state.reset);
  const activityReset = useActivityStoreRQ((state) => state.reset);

  // Add global checkout protection for all page navigation
  const { showBeforeUnloadModal, handleStayOnPage, handleLeavePage } = 
    useCheckoutProtection({ step: currentStep });

  // State for step navigation modal
  const [showStepNavigationModal, setShowStepNavigationModal] = useState(false);

  // Clean up orphaned sessions on mount
  useEffect(() => {
    cleanupOrphanedSessions();
  }, [cleanupOrphanedSessions]);

  // Auto-scroll to top when step changes
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Debug logging
  useEffect(() => {
    console.log("CheckoutFlow - Props", {
      bookingData,
      requirements,
      currentStep,
      formData,
    });
  }, [bookingData, requirements, currentStep, formData]);

  // Handler for "Start New Booking" from modal
  const handleStartNewBooking = () => {
    // Close modal first
    setShowStepNavigationModal(false);
    
    // Cross-store cleanup: Reset all booking stores
    resetAfterBooking(); // Checkout store
    ferryReset(); // Ferry store
    boatReset(); // Boat store
    activityReset(); // Activity store
    
    console.log("✅ All stores reset for new booking from modal");
    
    // Determine redirect based on booking type
    const firstItemType = bookingData?.items?.[0]?.type;
    const targetPath =
      firstItemType === "ferry"
        ? "/ferry"
        : firstItemType === "boat"
        ? "/boat"
        : "/activities";
    
    router.push(targetPath);
  };

  // Render appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <MemberDetailsStep
            bookingData={bookingData}
            requirements={requirements}
          />
        );
      case 2:
        return (
          <ReviewStep
            bookingData={bookingData}
            requirements={requirements}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            bookingData={bookingData}
            requirements={requirements}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className={styles.checkoutFlow}>
      {/* Step Indicator */}
      <div className={styles.stepIndicatorContainer}>
        <StepIndicator
          steps={CHECKOUT_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            // GUARD: Block navigation away from confirmation step (step 3)
            if (currentStep === 3 && bookingConfirmation) {
              setShowStepNavigationModal(true);
              return;
            }
            
            // GUARD: Block direct navigation TO confirmation step without booking
            if (step === 3 && !bookingConfirmation) {
              return; // Silently block - can't jump to confirmation
            }
            
            // Allow normal backward navigation for steps 1-2
            if (step <= currentStep && currentStep < 3) {
              setCurrentStep(step);
            }
          }}
          isStepCompleted={(step) => step < currentStep}
          isStepAccessible={(step) => {
            // Step 3 is only accessible after booking is confirmed
            if (step === 3) {
              return currentStep === 3 && bookingConfirmation !== null;
            }
            // Steps 1-2 are accessible normally
            return step <= currentStep;
          }}
        />
      </div>

      {/* Main Content */}
      <div className={styles.stepContent}>{renderStepContent()}</div>

      {/* Loading Overlay for checkout transitions */}
      <LoadingOverlay 
        isVisible={isLoading}
        title={
          currentStep === 2 && bookingConfirmation 
            ? "Booking Confirmed!" 
            : currentStep === 2 
            ? "Processing Payment" 
            : "Loading"
        }
        message={
          currentStep === 2 && bookingConfirmation
            ? "Your booking has been confirmed! Redirecting to confirmation page..."
            : currentStep === 2 
            ? "Please wait while we process your payment and confirm your booking..."
            : "Please wait while we prepare your checkout..."
        }
      />

      {/* Global BeforeUnload Modal for page navigation protection */}
      <AlertDialog
        open={showBeforeUnloadModal}
        onOpenChange={(open) => !open && handleStayOnPage()}
        title="Leave checkout process?"
        description="You'll lose all your progress if you leave now. Are you sure you want to continue?"
        cancelLabel="Stay on Page"
        actionLabel="Leave Page"
        onCancel={handleStayOnPage}
        onAction={handleLeavePage}
      />

      {/* Step Navigation Modal - prevents going back from confirmation */}
      <AlertDialog
        open={showStepNavigationModal}
        onOpenChange={(open) => !open && setShowStepNavigationModal(false)}
        title="Booking Complete"
        description="Your booking has been confirmed! Would you like to start a new booking or stay on this page to review your details?"
        cancelLabel="Stay on Page"
        actionLabel="Start New Booking"
        onCancel={() => setShowStepNavigationModal(false)}
        onAction={handleStartNewBooking}
      />

      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className={styles.debugInfo}>
          <details>
            <summary>Debug Info</summary>
            <pre>
              {JSON.stringify(
                {
                  currentStep,
                  bookingType: bookingData.type,
                  totalItems: bookingData.items.length,
                  totalPassengers: bookingData.totalPassengers,
                  hasFormData: !!formData,
                  isLoading,
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
