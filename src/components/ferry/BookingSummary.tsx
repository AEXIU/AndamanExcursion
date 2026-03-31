import React from "react";
import { Button } from "@/components/atoms";
import {
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
import { AlertCircle, CheckCircle } from "lucide-react";
import styles from "./BookingSummary.module.css";

interface FerrySearchParams {
  adults: number;
  children: number;
  infants: number;
}

interface BookingSummaryProps {
  ferry: UnifiedFerryResult;
  selectedClass: FerryClass | null;
  selectedSeats: string[];
  searchParams: FerrySearchParams;
  onCheckout: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  ferry,
  selectedClass,
  selectedSeats,
  searchParams,
  onCheckout,
}) => {
  const totalPassengers = searchParams.adults + searchParams.children;
  // Use structured pricing to calculate correct totals
  const baseFare = selectedClass?.pricing?.basePrice || selectedClass?.price || 0;
  const portFee = selectedClass?.pricing?.fees || 0;
  const taxes = selectedClass?.pricing?.taxes || 0;
  const pricePerPassenger = selectedClass?.pricing?.total || selectedClass?.price || 0;
  const totalCost = pricePerPassenger * totalPassengers;

  const formatPassengers = () => {
    const parts = [];
    if (searchParams.adults > 0)
      parts.push(
        `${searchParams.adults} Adult${searchParams.adults > 1 ? "s" : ""}`
      );
    if (searchParams.children > 0)
      parts.push(
        `${searchParams.children} Child${
          searchParams.children > 1 ? "ren" : ""
        }`
      );
    if (searchParams.infants > 0)
      parts.push(
        `${searchParams.infants} Infant${searchParams.infants > 1 ? "s" : ""}`
      );
    return parts.join(", ");
  };

  const getSeatDisplay = () => {
    if (selectedSeats.length > 0) return `Seat ${selectedSeats.join(", ")}`;
    return ferry.operator === "sealink"
      ? "Manual selection required"
      : "Auto-assigned";
  };

  const Row = ({ label, value }: { label: string; value: string | number }) => (
    <div className={styles.row}>
      <span>{label}</span>
      <span>{typeof value === "number" ? `₹${value}` : value}</span>
    </div>
  );

  return (
    <div className={styles.summarySticky}>
      <section className={styles.summary}>
        <h3 className={styles.title}>Booking Summary</h3>

        <div className={styles.content}>
          <Row
            label={ferry.ferryName}
            value={`${ferry.route.from.name} → ${ferry.route.to.name}`}
          />
          <Row
            label={ferry.schedule.date}
            value={`${ferry.schedule.departureTime} - ${ferry.schedule.arrivalTime}`}
          />

          {selectedClass && (
            <>
              <Row label={selectedClass.name} value={formatPassengers()} />
              <Row label="Seats" value={getSeatDisplay()} />

              <div className={styles.divider} />

              <Row
                label={`Base Fare (${totalPassengers} pax)`}
                value={baseFare * totalPassengers}
              />
              {portFee > 0 && (
                <Row
                  label="Port Fee"
                  value={portFee * totalPassengers}
                />
              )}
              {taxes > 0 && (
                <Row
                  label="Taxes"
                  value={taxes * totalPassengers}
                />
              )}

              <div className={styles.total}>
                <span>Total</span>
                <span>₹{totalCost}</span>
              </div>
            </>
          )}
        </div>

        {selectedClass ? (
          <Button
            variant="primary"
            size="large"
            onClick={onCheckout}
            className={styles.checkoutBtn}
          >
            Proceed to Checkout
          </Button>
        ) : (
          <div className={styles.prompt}>
            <AlertCircle size={16} />
            <span>Select a class to continue</span>
          </div>
        )}
      </section>

      <div className={styles.trust}>
        {["Instant Confirmation", "Secure Payment", "24/7 Support"].map(
          (text) => (
            <div key={text} className={styles.trustItem}>
              <CheckCircle size={12} />
              <span>{text}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
