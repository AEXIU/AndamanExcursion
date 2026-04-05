"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { AlertDialog } from "@/components/atoms/AlertDialog";
import { useFerryStore } from "@/store/FerryStore";
import { useFerryDetails } from "@/hooks/ferry/useFerryDetails";
import { useSimplifiedSeatSelection } from "@/hooks/ferry/useSimplifiedSeatSelection";
import { useSimplifiedSeatLayout } from "@/hooks/ferry/useSimplifiedSeatLayout";
import { useSeatPreference } from "@/hooks/ferry/useSeatPreference";
import {
  validateSeatSelection,
  canProceedToCheckout,
} from "@/utils/ferryValidation";
import { FerryEnquiryForm, EnquiryFormData } from "@/components/ferry/FerryEnquiryForm";
import { isOfflineEnquiryOperator } from "@/utils/ferryOperatorLogic";
import { shouldLoadSeatLayoutAutomatically } from "@/utils/ferryOperatorLogic";
import { ClassSelection } from "@/components/ferry/ClassSelection";
import { SimplifiedSeatSelectionSection } from "@/components/ferry/SimplifiedSeatSelectionSection";
import { AlertCircle } from "lucide-react";
import styles from "./page.module.css";
import FerrySummary from "@/components/ferry/FerrySummary";

/**
 * Simplified Ferry Booking Page
 *
 * This replaces the complex ferry booking page with:
 * 1. Direct Seat[] array handling instead of complex SeatLayout
 * 2. Simplified data flow without multiple transformations
 * 3. Direct integration with visual ferry layouts
 * 4. Preserved functionality for all operators
 */
export default function SimplifiedFerryBookingPage() {
  const router = useRouter();
  
  // Alert dialog state
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Client state from Zustand
  const {
    selectedFerry,
    selectedClass,
    searchParams: ferrySearchParams,
    selectClass,
  } = useFerryStore();

  // Custom hooks - useFerryDetails can recover ferry from search results
  const { ferry: ferryDetails, isLoading, error } = useFerryDetails();
  
  // Use ferryDetails (recovered from search results or store) as primary source
  const ferry = ferryDetails || selectedFerry;
  const totalPassengers = (ferrySearchParams?.adults || 0) + (ferrySearchParams?.children || 0);

  // Use simplified seat layout hook
  const {
    seats,
    isLoading: loadingSeatLayout,
    loadSeatLayout,
    refreshLayout,
  } = useSimplifiedSeatLayout(ferry);

  const { selectedSeats, handleSeatSelect, clearSelection } = useSimplifiedSeatSelection(
    ferry,
    totalPassengers,
    seats // Pass simplified seat array directly
  );

  const { preference, canChoosePreference, setPreference } =
    useSeatPreference(ferry);

  // Auto-load seat layout for operators that require it (skip for offline enquiry operators)
  useEffect(() => {
    if (ferry && selectedClass && shouldLoadSeatLayoutAutomatically(ferry) && !isOfflineEnquiryOperator(ferry)) {
      console.log(
        "🔄 Auto-loading simplified seat layout for",
        ferry.operator,
        selectedClass.name
      );
      loadSeatLayout(selectedClass.id);
    }
  }, [ferry, selectedClass, loadSeatLayout]);

  const handleClassSelection = async (classData: any) => {
    console.log("🎯 Class selected:", classData.name);
    selectClass(classData);
    clearSelection();

    // Load seat layout for operators that require manual selection (skip for enquiry operators)
    if (ferry && shouldLoadSeatLayoutAutomatically(ferry) && !isOfflineEnquiryOperator(ferry)) {
      console.log(
        "🔄 Loading simplified seat layout for class:",
        classData.name
      );
      await loadSeatLayout(classData.id);
    }
  };

  const handleProceedToCheckout = () => {
    if (
      !ferry ||
      !canProceedToCheckout(
        ferry,
        selectedClass,
        selectedSeats,
        totalPassengers
      )
    ) {
      const validation = validateSeatSelection(
        selectedSeats,
        totalPassengers,
        ferry!
      );
      if (!validation.isValid && validation.message) {
        setValidationMessage(validation.message);
        setShowValidationAlert(true);
      }
      return;
    }

    console.log("✅ Proceeding to checkout with simplified data:", {
      ferry: ferry.ferryName,
      class: selectedClass?.name,
      seats: selectedSeats,
      passengers: totalPassengers,
    });

    router.push("/checkout?type=ferry");
  };

  // Listen for when user returns to this page (e.g., after booking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedClass && seats.length > 0) {
        console.log(
          "🔄 Page visible again, refreshing simplified seat layout..."
        );
        refreshLayout();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [selectedClass, seats, refreshLayout]);

  const handleBackToResults = () => {
    router.back();
  };

  const handleManualSelected = () => {
    if (selectedClass) {
      console.log(
        "👆 Manual selection chosen, loading simplified seat layout..."
      );
      loadSeatLayout(selectedClass.id);
    }
  };

  // Debug logging
  useEffect(() => {
    if (seats.length > 0) {
      console.log("🪑 Simplified seats updated:", {
        totalSeats: seats.length,
        availableSeats: seats.filter((s) => s.status === "available").length,
        bookedSeats: seats.filter((s) => s.status === "booked").length,
        selectedSeats: selectedSeats.length,
      });
    }
  }, [seats, selectedSeats]);

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <h2>Loading ferry details...</h2>
            <p>Please wait while we prepare your booking options.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !ferry) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <AlertCircle className={styles.errorIcon} size={48} />
            <h1>Ferry Not Found</h1>
            <p>{error || "The ferry you're looking for could not be found."}</p>
            <Button variant="primary" onClick={handleBackToResults}>
              Back to Search Results
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Check if we are in enquiry mode for Green Ocean or Nautica
  const isEnquiryMode = ferry ? isOfflineEnquiryOperator(ferry) : false;
  const enquiryFormId = "ferry-enquiry-form";

  const handleEnquirySubmit = async (data: EnquiryFormData) => {
    if (!ferry) return;
    try {
      setIsSubmittingEnquiry(true);
      const res = await fetch("/api/ferry/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: data,
          ferryId: ferry.id,
          ferryName: ferry.ferryName,
          searchParams: ferrySearchParams,
          selectedClass,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert("Your offline booking enquiry has been submitted. Our team will contact you shortly.");
        router.push("/ferry");
      } else {
        alert("Failed to submit enquiry: " + result.message);
      }
    } catch (error) {
      console.error("Enquiry submission error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.twoColumnLayout}>
          <div className={styles.leftColumn}>
            {isEnquiryMode ? (
              <FerryEnquiryForm
                formId={enquiryFormId}
                ferry={ferry}
                selectedClass={selectedClass}
                onClassSelect={handleClassSelection}
                numberOfPassengers={totalPassengers}
                onSubmitEnquiry={handleEnquirySubmit}
              />
            ) : (
              <>
                <ClassSelection
                  classes={ferry.classes}
                  selectedClass={selectedClass}
                  onClassSelect={handleClassSelection}
                />

                <SimplifiedSeatSelectionSection
                  ferry={ferry}
                  selectedClass={selectedClass}
                  seats={seats} // Direct seat array instead of complex SeatLayout
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                  isLoading={loadingSeatLayout}
                  preference={preference}
                  onPreferenceChange={setPreference}
                  onManualSelected={handleManualSelected}
                  passengers={totalPassengers}
                  onRefreshLayout={refreshLayout}
                />

                {/* Terms & Conditions */}
                {selectedClass && (
                  <div className={styles.termsSection}>
                    <h3 className={styles.termsTitle}>Terms & Conditions</h3>
                    <ul className={styles.termsList}>
                      <li>Cancellation 48 hours or more before ferry departure: Rs 250 per ticket</li>
                      <li>Cancellation between 24 and 48 hours before departure: 50% of the ticket price</li>
                      <li>Cancellation within 24 hours of departure: 100% of the ticket price</li>
                      <li>Date change is subject to availability and may incur additional charges</li>
                      <li>Passengers must carry a valid government-issued photo ID during travel</li>
                    </ul>
                    <label className={styles.termsCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className={styles.termsCheckbox}
                      />
                      <span>I agree with the <strong>Terms & Conditions</strong></span>
                    </label>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.rightColumn}>
            <FerrySummary
              ferry={ferry}
              selectedClass={selectedClass}
              selectedSeats={selectedSeats}
              searchParams={ferrySearchParams}
              onBack={handleBackToResults}
              onCheckout={handleProceedToCheckout}
              termsAccepted={termsAccepted}
              isEnquiry={isEnquiryMode}
              formId={enquiryFormId}
            />
          </div>
        </div>
      </div>

      {/* Validation Alert Dialog */}
      <AlertDialog
        open={showValidationAlert}
        onOpenChange={setShowValidationAlert}
        title="Seat Selection Required"
        description={validationMessage}
        actionLabel="Got it"
        onAction={() => setShowValidationAlert(false)}
        onCancel={() => setShowValidationAlert(false)}
        showOnlyAction={true}
      />
    </main>
  );
}
