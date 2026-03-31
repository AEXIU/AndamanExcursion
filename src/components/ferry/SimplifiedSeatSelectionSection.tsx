import React from "react";
import {
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
import { Seat } from "@/types/SeatSelection.types";
import { SimplifiedSeatLayoutComponent } from "@/components/molecules/SeatLayout/SimplifiedSeatLayout";
import { AlertCircle } from "lucide-react";
import {
  shouldShowSeatPreference,
  supportsOnlyAutoAssignment,
} from "@/utils/ferryOperatorLogic";
import styles from "./SeatSelectionSection.module.css";
import SeatPreferenceSelector from "./SeatPreferenceSelector";
import { SectionTitle } from "../atoms";

interface SimplifiedSeatSelectionSectionProps {
  ferry: UnifiedFerryResult;
  selectedClass: FerryClass | null;
  seats: Seat[]; // Simplified: direct seat array instead of complex SeatLayout
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  isLoading: boolean;
  preference: "manual" | "auto";
  onPreferenceChange: (pref: "manual" | "auto") => void;
  onManualSelected: () => void;
  passengers: number;
  onRefreshLayout: () => void;
}

/**
 * Simplified Seat Selection Section
 * 
 * This replaces the complex SeatSelectionSection with:
 * 1. Direct seat array instead of complex SeatLayout object
 * 2. Simplified data flow without multiple transformations
 * 3. Direct integration with FerryVesselLayout via SimplifiedSeatLayoutComponent
 * 4. Preserved functionality for all operators
 */
export const SimplifiedSeatSelectionSection: React.FC<SimplifiedSeatSelectionSectionProps> = ({
  ferry,
  selectedClass,
  seats,
  selectedSeats,
  onSeatSelect,
  isLoading,
  preference,
  onPreferenceChange,
  onManualSelected,
  passengers,
  onRefreshLayout,
}) => {
  if (!selectedClass) return null;

  const showSeatPreference = shouldShowSeatPreference(ferry);
  const showAutoOnlyMessage = supportsOnlyAutoAssignment(ferry);
  const showSeatSelection = ferry.features.supportsSeatSelection;

  // Auto-assignment only operators (Makruzz)
  if (showAutoOnlyMessage && selectedClass) {
    return (
      <section className={styles.section}>
        <SectionTitle
          text="Seat Assignment"
          specialWord="Assignment"
          headingLevel="h2"
          titleTextClasses={styles.sectionTitle}
        />

        <div className={styles.infoMessage}>
          <AlertCircle size={20} />
          <div>
            <h4>Seats will be auto-assigned</h4>
            <p>
              {ferry.operator === "makruzz"
                ? "Makruzz ferries use automatic seat assignment. We'll assign you the best available seats for your selected class."
                : "We'll assign you the best available seats for your selected class."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Manual seat selection operators
  if (!showSeatSelection) return null;

  const showManualSelection = preference === "manual" || ferry.operator === "sealink";
  const showAutoMessage =
    preference === "auto" &&
    ferry.features.supportsAutoAssignment &&
    ferry.operator !== "sealink";

  // Determine vessel class for layout selection
  const getVesselClass = () => {
    if (!selectedClass) return "economy";

    const className = selectedClass.name.toLowerCase();
    if (className.includes("luxury")) return "luxury";
    if (className.includes("royal")) return "royal";
    if (className.includes("premium")) return "premium";
    if (className.includes("deluxe")) return "deluxe";
    return "economy";
  };

  // For Makruzz, differentiate between vessel types (Makruzz, Gold, Pearl)
  const getOperatorKey = () => {
    if (ferry.operator === "makruzz") {
      const name = ferry.ferryName.toLowerCase();
      if (name.includes("pearl")) return "makruzz_pearl";
      if (name.includes("gold")) return "makruzz_gold";
      return "makruzz";
    }
    return ferry.operator;
  };

  return (
    <section id="seat-selection-section" className={styles.section}>
      <SectionTitle
        text="Select your seats"
        specialWord="seats"
        headingLevel="h2"
        titleTextClasses={styles.sectionTitle}
      />

      {showSeatPreference && (
        <SeatPreferenceSelector
          ferry={ferry}
          preference={preference}
          onPreferenceChange={onPreferenceChange}
          onManualSelected={onManualSelected}
        />
      )}

      <div className={styles.contentContainer}>
        {isLoading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading seat layout...</p>
          </div>
        )}

        {seats.length > 0 && !isLoading && showManualSelection && (
          <SimplifiedSeatLayoutComponent
            operator={getOperatorKey()}
            vesselClass={getVesselClass()}
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatSelect={onSeatSelect}
            maxSeats={passengers}
            isLoading={isLoading}
            onRefreshLayout={onRefreshLayout}
            ferryInfo={{
              name: ferry.ferryName,
              route: `${ferry.route.from.name} → ${ferry.route.to.name}`,
              departureTime: ferry.schedule.departureTime,
              estimatedDuration: ferry.schedule.duration || "N/A",
            }}
            pricingInfo={{
              baseFare: selectedClass?.pricing?.basePrice || selectedClass?.price || 0,
              total: selectedClass?.pricing?.total || selectedClass?.price || 0,
            }}
            accessibleSeats={
              seats
                .filter((seat) => seat.isAccessible)
                .map((seat) => seat.number) || []
            }
            premiumSeats={
              seats
                .filter((seat) => seat.isPremium)
                .map((seat) => seat.number) || []
            }
          />
        )}

        {showAutoMessage && (
          <div className={styles.infoMessage}>
            <AlertCircle size={20} />
            <div>
              <h4>Seats will be auto-assigned</h4>
              <p>
                Don't worry! We'll assign you the best available seats for your
                selected class.
              </p>
            </div>
          </div>
        )}

        {seats.length === 0 && !isLoading && (
          <div className={styles.infoMessage}>
            <AlertCircle size={20} />
            <div>
              <h4>Seat layout not available</h4>
              <p>
                Unable to display seat layout for this ferry. Seats will be
                auto-assigned.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SimplifiedSeatSelectionSection;
