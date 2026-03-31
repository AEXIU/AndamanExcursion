import React, { useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { FerryVesselLayout } from "@/components/ferry/FerryVesselLayout/FerryVesselLayout";
import {
  Seat,
  SeatLayoutComponentProps,
  SeatValidationResult,
} from "@/types/SeatSelection.types";
import styles from "./SeatLayout.module.css";

/**
 * Simplified Seat Layout Component
 *
 * This component replaces the complex multi-transformation approach with:
 * 1. Single unified data interface (Seat[])
 * 2. Direct integration with FerryVesselLayout for visual representation
 * 3. Simplified props and state management
 * 4. Preserved functionality (selection, pricing, accessibility)
 */
export function SimplifiedSeatLayoutComponent({
  operator,
  vesselClass,
  seats,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  isLoading = false,
  onRefreshLayout,
  pricingInfo,
}: SeatLayoutComponentProps) {
  // Enhanced seat data with accessibility and premium flags
  const enhancedSeats: Seat[] = React.useMemo(() => {
    return seats.map((seat) => ({
      ...seat,
      status: selectedSeats.includes(seat.id) ? "selected" : seat.status,
    }));
  }, [seats, selectedSeats]);

  // Seat selection logic
  const handleSeatClick = (seatId: string) => {
    const seat = enhancedSeats.find((s) => s.id === seatId);
    if (!seat || seat.status === "booked" || seat.status === "blocked") {
      return;
    }

    if (selectedSeats.includes(seatId)) {
      // Deselect seat
      onSeatSelect(seatId);
    } else if (selectedSeats.length < maxSeats) {
      // Select seat if under limit
      onSeatSelect(seatId);
    }
  };

  // Validation
  const validateSelection = (): SeatValidationResult => {
    if (selectedSeats.length === 0) {
      return {
        isValid: false,
        message: `Please select ${maxSeats} seat${
          maxSeats > 1 ? "s" : ""
        } to continue`,
      };
    }

    if (selectedSeats.length < maxSeats) {
      const remaining = maxSeats - selectedSeats.length;
      return {
        isValid: false,
        message: `Please select ${remaining} more seat${
          remaining > 1 ? "s" : ""
        }`,
      };
    }

    return { isValid: true };
  };

  // Calculate pricing
  const selectedSeatsData = enhancedSeats.filter((seat) =>
    selectedSeats.includes(seat.id)
  );

  const validation = validateSelection();

  if (enhancedSeats.length === 0) {
    return (
      <div className={`${styles.container}`}>
        <div className={styles.noDataMessage}>
          <AlertCircle size={24} />
          <p>No seat data available. Please try refreshing.</p>
          {onRefreshLayout && (
            <button onClick={onRefreshLayout} className={styles.controlButton}>
              <RefreshCw size={16} />
              Refresh
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Selection Summary */}
      <div className={styles.headerWithSummary}>
        <div className={styles.sectionHeader}>
          <div className={styles.controls}>
            {onRefreshLayout && (
              <button
                onClick={onRefreshLayout}
                disabled={isLoading}
                className={`${styles.controlButton} ${
                  isLoading ? styles.loading : ""
                }`}
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? styles.spinning : ""}
                />
                <span>Refresh</span>
              </button>
            )}
          </div>
          {!validation.isValid && (
            <p className={styles.validationMessage}>{validation.message}</p>
          )}
        </div>

        {/* Selection Summary */}
        <div className={styles.selectionSummary}>
          <div className={styles.summaryContent}>
            <div className={styles.selectionCounter}>
              <span className={styles.counterText}>
                {selectedSeats.length}/{maxSeats} selected
              </span>
              <div className={styles.counterBadge}>{selectedSeats.length}</div>
            </div>

            <div className={styles.selectedSeatsContainer}>
              <div className={styles.selectedSeatsList}>
                {selectedSeats.length === 0 && (
                  <div className={styles.noSeatSelectedTag}>
                    No seats selected
                  </div>
                )}
                {selectedSeatsData.map((seat) => (
                  <div key={seat.id} className={styles.selectedSeatTag}>
                    <span className={styles.seatTagNumber}>
                      {seat.displayNumber}
                    </span>
                    {seat.tier && (
                      <span className={styles.seatTagTier}>
                        ({seat.tier === "B" ? "Business" : "Premium"})
                      </span>
                    )}
                    {(seat.price || pricingInfo?.baseFare) && (
                      <span className={styles.seatTagPrice}>
                        ₹{seat.price || pricingInfo?.baseFare}
                      </span>
                    )}
                    <button
                      onClick={() => onSeatSelect(seat.id)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendGrid}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendIcon} ${styles.available}`}></div>
            <span>Available</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendIcon} ${styles.selected}`}></div>
            <span>Selected</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendIcon} ${styles.booked}`}></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Ferry Visual Layout */}
      <div
        className={`${styles.layoutContainer} ${
          isLoading ? styles.loadingState : ""
        }`}
      >
        <FerryVesselLayout
          operator={operator}
          vesselClass={vesselClass}
          seats={enhancedSeats}
          selectedSeats={selectedSeats}
          onSeatSelect={handleSeatClick}
          maxSeats={maxSeats}
          isLoading={isLoading}
          onRefreshLayout={onRefreshLayout}
        />
      </div>
    </div>
  );
}
