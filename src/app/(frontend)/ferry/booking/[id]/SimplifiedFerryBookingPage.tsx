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

  // Client state from Zustand
  const {
    selectedFerry: ferry,
    selectedClass,
    searchParams: ferrySearchParams,
    selectClass,
  } = useFerryStore();

  // Custom hooks
  const { ferry: ferryDetails, isLoading, error } = useFerryDetails();
  const totalPassengers = ferrySearchParams.adults + ferrySearchParams.children;

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

  // Auto-load seat layout for operators that require it
  useEffect(() => {
    if (ferry && selectedClass && shouldLoadSeatLayoutAutomatically(ferry)) {
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

    // Load seat layout for operators that require manual selection
    if (ferry && shouldLoadSeatLayoutAutomatically(ferry)) {
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

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.twoColumnLayout}>
          <div className={styles.leftColumn}>
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
