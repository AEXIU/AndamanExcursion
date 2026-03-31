import React from "react";
import {
  UnifiedFerryResult,
  FerryClass,
  SeatLayout,
} from "@/types/FerryBookingSession.types";
import { SeatLayoutComponent } from "@/components/molecules/SeatLayout/SeatLayout";
import { AlertCircle } from "lucide-react";
import {
  shouldShowSeatPreference,
  supportsOnlyAutoAssignment,
} from "@/utils/ferryOperatorLogic";
import styles from "./SeatSelectionSection.module.css";
import SeatPreferenceSelector from "./SeatPreferenceSelector";
import { SectionTitle } from "../atoms";

interface SeatSelectionSectionProps {
  ferry: UnifiedFerryResult;
  selectedClass: FerryClass | null;
  seatLayout: SeatLayout | null;
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  isLoading: boolean;
  preference: "manual" | "auto";
  onPreferenceChange: (pref: "manual" | "auto") => void;
  onManualSelected: () => void;
  passengers: number;
  onRefreshLayout: () => void;
}

export const SeatSelectionSection: React.FC<SeatSelectionSectionProps> = ({
  ferry,
  selectedClass,
  seatLayout,
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

  // Simplified data conversion
  const getSeatLayoutData = () => {
    if (!seatLayout) return null;

    if (ferry.operator === "sealink" && seatLayout.operatorData?.sealink) {
      return {
        seaLinkData: seatLayout.operatorData.sealink,
        fareConfig: {
          pBaseFare: selectedClass?.pricing?.basePrice || 0,
          bBaseFare: selectedClass?.pricing?.basePrice || 0,
          showPricing: true,
        },
      };
    }

    if (
      ferry.operator === "greenocean" &&
      seatLayout.operatorData?.greenocean
    ) {
      return { greenOceanData: seatLayout.operatorData.greenocean };
    }

    // Fallback conversion
    return {
      greenOceanData: {
        layout: seatLayout.seats.map((seat) => ({
          seat_no: seat.id,
          seat_numbering: seat.number,
          status: seat.status === "booked" ? "booked" : "available",
        })),
        booked_seat: seatLayout.seats
          .filter((seat) => seat.status === "booked")
          .map((seat) => seat.id),
        class_type: 1,
      },
    };
  };

  const seatLayoutData = getSeatLayoutData();
  const showManualSelection =
    preference === "manual" || ferry.operator === "sealink";
  const showAutoMessage =
    preference === "auto" &&
    ferry.features.supportsAutoAssignment &&
    ferry.operator !== "sealink";

  // Auto-assignment only operators
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

  return (
    <section className={styles.section}>
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

        {seatLayoutData && !isLoading && showManualSelection && (
          <SeatLayoutComponent
            {...seatLayoutData}
            selectedSeats={selectedSeats}
            onSeatSelect={onSeatSelect}
            maxSeats={passengers}
            onRefreshLayout={onRefreshLayout}
            isLoading={isLoading}
            ferryInfo={{
              name: ferry.ferryName,
              route: `${ferry.route.from.name} → ${ferry.route.to.name}`,
              departureTime: ferry.schedule.departureTime,
              estimatedDuration: ferry.schedule.duration || "N/A",
            }}
            accessibleSeats={
              seatLayout?.seats
                .filter((seat) => seat.isAccessible)
                .map((seat) => seat.number) || []
            }
            premiumSeats={
              seatLayout?.seats
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

        {!seatLayoutData && !isLoading && seatLayout && (
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

export default SeatSelectionSection;
