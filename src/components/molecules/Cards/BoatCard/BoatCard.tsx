"use client";
import React, { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/atoms";
import { Clock, MapPin, Users, Ship, ArrowLeftRight, User } from "lucide-react";
import { type Boat, type BoatSearchParams } from "@/store/BoatStore";
import styles from "./BoatCard.module.css";
import clsx from "clsx";

interface BoatCardProps {
  boat: Boat;
  searchParams: BoatSearchParams;
  onAddToCart: (boat: Boat, time: string) => void;
  isInCart: (boatId: string, time: string) => boolean;
  className?: string;
  selectedTime?: string; // Add this prop to track selected time
}

const BoatCard: React.FC<BoatCardProps> = ({
  boat,
  searchParams,
  onAddToCart,
  isInCart,
  className,
  selectedTime,
}) => {
  const totalPassengers = searchParams.adults + searchParams.children;
  const totalPrice = useMemo(() => {
    return (
      boat.fare * searchParams.adults + boat.fare * searchParams.children * 0.5
    );
  }, [boat.fare, searchParams.adults, searchParams.children]);

  const handleAddToCart = useCallback(
    (time: string) => {
      onAddToCart(boat, time);
    },
    [boat, onAddToCart]
  );

  // Format route display
  const routeDisplay = useMemo(() => {
    return `${boat.route.from} → ${boat.route.to}`;
  }, [boat.route.from, boat.route.to]);

  return (
    <article className={clsx(styles.card, className)}>
      <div className={styles.contentWrapper}>
        {/* Image Section */}
        <div className={styles.imageWrapper}>
          <div className={styles.boatImage}>
            <Ship size={80} color="var(--color-primary)" />
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.textContent}>
          {/* TOP ROW: Title and Pricing */}
          <div className={styles.topRow}>
            <div className={styles.titleSection}>
              <h3 className={styles.title}>{boat.name}</h3>
              <div className={styles.routeInfo}>
                <span>{boat.route.from}</span>
                <span className={styles.routeArrow}>→</span>
                <span>{boat.route.to}</span>
              </div>

              {/* Boat Metadata */}
              <div className={styles.boatMetadata}>
                <div className={styles.metadataItem}>
                  <Clock size={16} className={styles.metadataIcon} />
                  <span>{boat.minTimeAllowed}</span>
                </div>
                <div className={styles.metadataItem}>
                  <ArrowLeftRight size={16} className={styles.metadataIcon} />
                  <span>Round Trip</span>
                </div>
                <div className={styles.metadataItem}>
                  <MapPin size={16} className={styles.metadataIcon} />
                  <span>{boat.operator || "Local Boat Service"}</span>
                </div>
                <div className={styles.metadataItem}>
                  <User size={16} className={styles.metadataIcon} />
                  <span>{totalPassengers} passengers</span>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className={styles.pricingSection}>
              <div className={styles.mainPriceRow}>
                <span className={styles.currentPrice}>₹{boat.fare}</span>
                <span className={styles.perPerson}>/adult</span>
              </div>
              <div className={styles.totalPriceInfo}>
                <span className={styles.totalPrice}>₹{totalPrice}</span>
                <span className={styles.totalLabel}>/total</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {/* {boat.description && (
            <p className={styles.description}>{boat.description}</p>
          )} */}

          {/* Mobile-first layout for timing and pricing */}
          <div className={styles.timingAndPricingContainer}>
            {/* Available Times */}
            <div className={styles.timingSection}>
              <h4 className={styles.timingTitle}>Available Departure Times</h4>
              <div className={styles.timeSlots}>
                {boat.timing.map((time) => {
                  // Fix the selection logic - compare actual time values
                  const isSelected =
                    selectedTime === time || searchParams.time === time;
                  const inCart = isInCart(boat.id, time);

                  return (
                    <div
                      key={time}
                      className={clsx(styles.timeSlot, {
                        [styles.timeSlotSelected]: isSelected,
                      })}
                    >
                      <span className={styles.timeText}>{time}</span>
                      <Button
                        variant={inCart ? "secondary" : "primary"}
                        size="small"
                        disabled={inCart}
                        onClick={() => handleAddToCart(time)}
                        className={styles.addButton}
                      >
                        {inCart ? "Added" : "Add"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Details */}
            <div className={styles.pricingDetails}>
              <div className={styles.priceItem}>
                <span>Adults ({searchParams.adults})</span>
                <span>₹{boat.fare * searchParams.adults}</span>
              </div>
              {searchParams.children > 0 && (
                <div className={styles.priceItem}>
                  <span>Children ({searchParams.children})</span>
                  <span>₹{boat.fare * searchParams.children * 0.5}</span>
                </div>
              )}
              <div className={styles.priceItem}>
                <span>
                  <strong>Total Amount</strong>
                </span>
                <span>
                  <strong>₹{totalPrice}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default memo(BoatCard);
