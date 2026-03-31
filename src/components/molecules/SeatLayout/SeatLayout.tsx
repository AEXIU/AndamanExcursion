import React, { useState, useEffect, Fragment } from "react";
import {
  Armchair,
  CheckCircle,
  Users,
  Ship,
  Clock,
  AlertCircle,
  RefreshCw,
  Zap,
  Star,
  LockKeyhole,
} from "lucide-react";
import styles from "./SeatLayout.module.css";

// Sealink API Types
interface SeaLinkTimeSlot {
  hour: number;
  minute: number;
}

interface SeaLinkFareStructure {
  pBaseFare: number;
  bBaseFare: number;
  pBaseFarePBHLNL: number;
  bBaseFarePBHLNL: number;
  pIslanderFarePBHLNL: number;
  bIslanderFarePBHLNL: number;
  infantFare: number;
}

interface SeaLinkSeatDetails {
  tier: string; // "B" | "P"
  number: string;
  isBooked: number; // 0 | 1 (boolean as integer)
  isBlocked: number; // 0 | 1 (boolean as integer)
}

interface SeaLinkTripData {
  id: string;
  tripId: number;
  from: string;
  to: string;
  dTime: SeaLinkTimeSlot;
  aTime: SeaLinkTimeSlot;
  vesselID: number;
  fares: SeaLinkFareStructure;
  bClass: { [seatNumber: string]: SeaLinkSeatDetails };
  pClass: { [seatNumber: string]: SeaLinkSeatDetails };
}

interface SeaLinkTripResponse {
  err: null;
  data: SeaLinkTripData[];
}

// Green Ocean API Types
interface GreenOceanSeatItem {
  seat_no: string;
  seat_numbering: string;
  status: string; // "booked" | "available"
}

interface GreenOceanSeatLayoutResponse {
  status: string;
  message: string;
  data: {
    layout: GreenOceanSeatItem[];
    booked_seat: string[];
    class_type: number;
  };
  errorlist: any[];
}

// Unified Internal Types
interface UnifiedSeat {
  id: string;
  seatNumber: string;
  displayNumber: string;
  status:
    | "available"
    | "booked"
    | "blocked"
    | "selected"
    | "temporarily_blocked";
  tier?: string; // For SeaLink: "B" | "P"
  price?: number;
  isAccessible?: boolean;
  isPremium?: boolean;
}

interface EnhancedSeatLayoutProps {
  // API Data - one of these should be provided
  seaLinkData?: SeaLinkTripData;
  greenOceanData?: GreenOceanSeatLayoutResponse["data"];

  // Seat selection
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats: number;

  // Optional configurations
  className?: string;
  ferryInfo?: {
    name: string;
    route: string;
    departureTime: string;
    estimatedDuration: string;
  };
  onRefreshLayout?: () => void;
  isLoading?: boolean;
  blockExpiry?: Date;

  // Pricing configuration
  fareConfig?: {
    pBaseFare?: number;
    bBaseFare?: number;
    showPricing?: boolean;
  };

  // Accessibility and premium seat configurations
  accessibleSeats?: string[]; // List of seat numbers that are accessible
  premiumSeats?: string[]; // List of seat numbers that are premium
}

export function SeatLayoutComponent({
  seaLinkData,
  greenOceanData,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  className,
  ferryInfo,
  onRefreshLayout,
  isLoading = false,
  blockExpiry,
  fareConfig,
  accessibleSeats = [],
  premiumSeats = [],
}: EnhancedSeatLayoutProps) {
  const [countdown, setCountdown] = useState<number>(0);
  const [showPricing, setShowPricing] = useState(
    fareConfig?.showPricing || false
  );

  // Convert API data to unified format
  const unifiedSeats: UnifiedSeat[] = React.useMemo(() => {
    if (seaLinkData) {
      return convertSeaLinkToUnified(
        seaLinkData,
        accessibleSeats,
        premiumSeats,
        fareConfig
      );
    } else if (greenOceanData) {
      return convertGreenOceanToUnified(
        greenOceanData,
        accessibleSeats,
        premiumSeats
      );
    }
    return [];
  }, [seaLinkData, greenOceanData, accessibleSeats, premiumSeats, fareConfig]);

  // Convert SeaLink data to unified format
  function convertSeaLinkToUnified(
    data: SeaLinkTripData,
    accessibleSeats: string[],
    premiumSeats: string[],
    fareConfig?: {
      pBaseFare?: number;
      bBaseFare?: number;
      showPricing?: boolean;
    }
  ): UnifiedSeat[] {
    const seats: UnifiedSeat[] = [];

    // Process Business Class seats
    Object.entries(data.bClass).forEach(([seatNumber, seatDetails]) => {
      const status =
        seatDetails.isBooked === 1
          ? "booked"
          : seatDetails.isBlocked === 1
          ? "blocked"
          : "available";

      seats.push({
        id: `b_${seatNumber}`,
        seatNumber: seatNumber,
        displayNumber: seatDetails.number,
        status,
        tier: "B",
        price: fareConfig?.bBaseFare,
        isAccessible: accessibleSeats.includes(seatNumber),
        isPremium: premiumSeats.includes(seatNumber),
      });
    });

    // Process Premium Class seats
    Object.entries(data.pClass).forEach(([seatNumber, seatDetails]) => {
      const status =
        seatDetails.isBooked === 1
          ? "booked"
          : seatDetails.isBlocked === 1
          ? "blocked"
          : "available";

      seats.push({
        id: `p_${seatNumber}`,
        seatNumber: seatNumber,
        displayNumber: seatDetails.number,
        status,
        tier: "P",
        price: fareConfig?.pBaseFare,
        isAccessible: accessibleSeats.includes(seatNumber),
        isPremium: premiumSeats.includes(seatNumber),
      });
    });

    return seats;
  }

  // Convert Green Ocean data to unified format
  function convertGreenOceanToUnified(
    data: GreenOceanSeatLayoutResponse["data"],
    accessibleSeats: string[],
    premiumSeats: string[]
  ): UnifiedSeat[] {
    return data.layout.map((seat) => ({
      id: seat.seat_no,
      seatNumber: seat.seat_no,
      displayNumber: seat.seat_numbering,
      status: seat.status === "booked" ? "booked" : "available",
      isAccessible: accessibleSeats.includes(seat.seat_no),
      isPremium: premiumSeats.includes(seat.seat_no),
    }));
  }

  // Countdown timer for seat blocking expiry
  useEffect(() => {
    if (!blockExpiry) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((blockExpiry.getTime() - Date.now()) / 1000)
      );
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockExpiry]);

  const getSeatIcon = (seat: UnifiedSeat) => {
    if (seat.status === "booked") return LockKeyhole;
    if (selectedSeats.includes(seat.id)) return CheckCircle;
    if (seat.isPremium) return Star;
    if (seat.isAccessible) return Users;
    return Armchair;
  };

  const getSeatClassName = (seat: UnifiedSeat) => {
    const baseClass = styles.seat;
    const statusClass = styles[seat.status] || "";
    const selectedClass = selectedSeats.includes(seat.id)
      ? styles.selected
      : "";
    const premiumClass = seat.isPremium ? styles.premium : "";
    const accessibleClass = seat.isAccessible ? styles.accessible : "";
    const tierClass = seat.tier ? styles[`tier${seat.tier}`] : "";

    return [
      baseClass,
      statusClass,
      selectedClass,
      premiumClass,
      accessibleClass,
      tierClass,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const handleSeatClick = (seat: UnifiedSeat) => {
    if (seat.status === "booked" || seat.status === "blocked") return;

    if (selectedSeats.includes(seat.id)) {
      onSeatSelect(seat.id);
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seat.id);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedSeatsData = unifiedSeats.filter((seat) =>
    selectedSeats.includes(seat.id)
  );
  const totalPrice = selectedSeatsData.reduce(
    (sum, seat) => sum + (seat.price || 0),
    0
  );

  // Group seats by tier for better organization
  const seatsByTier = unifiedSeats.reduce((acc, seat) => {
    const tier = seat.tier || "default";
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(seat);
    return acc;
  }, {} as Record<string, UnifiedSeat[]>);

  if (unifiedSeats.length === 0) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.noDataMessage}>
          <AlertCircle size={24} />
          <p>No seat data available. Please provide seat layout data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Header with Selection Summary */}
      <div className={styles.headerWithSummary}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Seat Selection</h3>
          <div className={styles.controls}>
            {fareConfig && (
              <button
                onClick={() => setShowPricing(!showPricing)}
                className={styles.controlButton}
              >
                <Zap size={16} />
                <span>Pricing</span>
              </button>
            )}

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
                  color={
                    isLoading
                      ? "var(--color-primary)"
                      : "var(--color-text-secondary)"
                  }
                  className={isLoading ? styles.spinning : ""}
                />
                <span className={styles.refreshSpan}>
                  Refresh
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Selection Summary - moved to header */}
        <div className={styles.selectionSummary}>
          <div className={styles.summaryContent}>
            <div className={styles.selectionCounter}>
              <span className={styles.counterText}>
                {selectedSeats.length}/{maxSeats} selected
              </span>
              <div className={styles.counterBadge}>{selectedSeats.length}</div>
            </div>

            {selectedSeats.length > 0 && (
              <div className={styles.selectedSeatsContainer}>
                <div className={styles.selectedSeatsList}>
                  {selectedSeatsData.map((seat) => (
                    <div key={seat.id} className={styles.selectedSeatTag}>
                      <span className={styles.seatTagNumber}>
                        {seat.displayNumber}
                      </span>
                      {seat.tier && (
                        <span className={styles.seatTagTier}>
                          (
                          {seat.tier === "B"
                            ? "Business"
                            : seat.tier === "P"
                            ? "Premium"
                            : seat.tier}
                          )
                        </span>
                      )}
                      {seat.price && (
                        <span className={styles.seatTagPrice}>
                          ₹{seat.price}
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

                {totalPrice > 0 && (
                  <div className={styles.totalPrice}>
                    <span className={styles.totalLabel}>Total:</span>
                    <span className={styles.totalAmount}>₹{totalPrice}</span>
                  </div>
                )}
              </div>
            )}

            {selectedSeats.length === 0 && (
              <p className={styles.noSelectionText}>
                Select up to {maxSeats} seat{maxSeats > 1 ? "s" : ""} to
                continue
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seat Block Timer */}
      {countdown > 0 && (
        <div className={styles.countdownTimer}>
          <AlertCircle size={16} />
          <span>Seats blocked for: {formatCountdown(countdown)}</span>
        </div>
      )}

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
          {accessibleSeats.length > 0 && (
            <div className={styles.legendItem}>
              <div
                className={`${styles.legendIcon} ${styles.accessible}`}
              ></div>
              <span>Accessible</span>
            </div>
          )}
          {premiumSeats.length > 0 && (
            <div className={styles.legendItem}>
              <div className={`${styles.legendIcon} ${styles.premium}`}></div>
              <span>Premium</span>
            </div>
          )}
          {seaLinkData && (
            <>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIcon} ${styles.tierB}`}></div>
                <span>Business Class</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIcon} ${styles.tierP}`}></div>
                <span>Premium Class</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Seat Layout */}
      <div
        className={`${styles.layoutContainer} ${
          isLoading ? styles.loadingState : ""
        }`}
      >
        <div className={styles.gridView}>
          {/* Seats organized by tier */}
          {Object.entries(seatsByTier).map(([tier, seats]) => (
            <div key={tier} className={styles.tierSection}>
              {seaLinkData && tier !== "default" && (
                <div className={styles.tierHeader}>
                  <h4 className={styles.tierTitle}>
                    {tier === "B"
                      ? "Business Class"
                      : tier === "P"
                      ? "Premium Class"
                      : tier}
                  </h4>
                </div>
              )}

              <div className={styles.seatGrid}>
                {seats.map((seat) => {
                  const IconComponent = getSeatIcon(seat);
                  return (
                    <button
                      key={seat.id}
                      className={getSeatClassName(seat)}
                      onClick={() => handleSeatClick(seat)}
                      disabled={
                        seat.status === "booked" || seat.status === "blocked"
                      }
                      title={`Seat ${seat.displayNumber} - ${seat.status}${
                        seat.price ? ` - ₹${seat.price}` : ""
                      }${seat.tier ? ` - ${seat.tier} Class` : ""}`}
                    >
                      <div className={styles.seatIcon}>
                        <IconComponent size={14} />
                      </div>
                      <span className={styles.seatNumber}>
                        {seat.displayNumber}
                      </span>
                      {showPricing && seat.price && (
                        <span className={styles.priceTag}>₹{seat.price}</span>
                      )}

                      {/* Special indicators */}
                      {seat.isPremium && (
                        <Star size={8} className={styles.premiumIndicator} />
                      )}
                      {seat.isAccessible && (
                        <Users
                          size={8}
                          className={styles.accessibleIndicator}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
