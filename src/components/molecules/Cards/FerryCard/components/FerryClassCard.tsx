// TODO: remove this file - Replaced by ClassCard

import React, { memo, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "../FerryCard.module.css";
import type { FerryClass } from "../FerryCard.types";
import { Button } from "@/components/atoms";
import { LucideProps } from "lucide-react";

interface Amenity {
  icon: React.ReactNode;
  label: string;
}

interface AmenityItemProps {
  amenity: Amenity;
  classType: string;
}

interface FerryClassCardProps {
  ferryClass: FerryClass;
  isActive: boolean;
  onChooseSeats: (classType: string) => void;
  onSelect: () => void;
  showChooseButton: boolean;
}

export const FerryClassCard: React.FC<FerryClassCardProps> = memo(
  ({ ferryClass, isActive, onChooseSeats, onSelect, showChooseButton }) => {
    // Generate base IDs directly - no need for useMemo for these simple operations
    const cardId = `ferry-class-${ferryClass.type
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    const priceId = `${cardId}-price`;
    const amenitiesId = `${cardId}-amenities`;
    const alertId = `${cardId}-alert`;

    // Simple calculations - no need for useMemo
    const shouldShowAlert = ferryClass.seatsLeft <= 3;
    const seatText = `${ferryClass.seatsLeft} seat${
      ferryClass.seatsLeft !== 1 ? "s" : ""
    }`;
    const cardClassName = cn(
      styles.classCard,
      isActive ? styles.activeClass : styles.inactiveClass
    );

    // Simplified ARIA label
    const ariaLabel = `${ferryClass.type} ferry ticket option ₹${
      ferryClass.price
    } per adult, total price ₹${ferryClass.totalPrice}. ${
      shouldShowAlert ? `Only ${seatText} remaining.` : ""
    }`;

    // Build ARIA description directly
    const ariaIds = [priceId, amenitiesId];
    if (shouldShowAlert) ariaIds.push(alertId);
    const ariaDescribedBy = ariaIds.join(" ");

    // Optimize event handlers
    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect();
      },
      [onSelect]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      },
      [onSelect]
    );

    const handleChooseSeats = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChooseSeats(ferryClass.type);
      },
      [onChooseSeats, ferryClass.type]
    );

    return (
      <article
        id={cardId}
        className={cardClassName}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="option"
        aria-selected={isActive}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        <header className={styles.classHeader}>
          <div className={styles.classInfo}>
            <h3 className={styles.className} id={`${cardId}-title`}>
              {ferryClass.type} Class
            </h3>
            {shouldShowAlert && (
              <div
                className={styles.seatsAlert}
                role="alert"
                id={alertId}
                aria-live="polite"
                aria-atomic="true"
              >
                <AlertCircle
                  className={styles.alertIcon}
                  size={16}
                  aria-hidden="true"
                />
                <span className={styles.alertText}>
                  <strong>Hurry!</strong> Only {seatText} left
                </span>
              </div>
            )}
          </div>
          <div className={styles.classPriceInfo} id={priceId}>
            <div className={styles.pricePerAdult}>
              <span aria-label={`₹${ferryClass.price} per adult`}>
                ₹{ferryClass.price}/adult
              </span>
            </div>
            <div className={styles.totalPrice}>
              <span aria-label={`Total price ₹${ferryClass.totalPrice}`}>
                ₹{ferryClass.totalPrice} total
              </span>
            </div>
          </div>
        </header>

        <section className={styles.amenitiesContainer}>
          <div
            className={styles.amenitiesGroup}
            role="list"
            id={amenitiesId}
            aria-label={`Amenities included in ${ferryClass.type} class`}
          >
            {ferryClass.amenities.map((amenity, i) => (
              <AmenityItem
                key={`${amenity.label}-${i}`}
                amenity={amenity}
                classType={ferryClass.type}
              />
            ))}
          </div>
          {showChooseButton && (
            <Button
              showArrow
              type="button"
              variant="primary"
              aria-describedby={`${cardId}-title ${priceId}`}
              onClick={handleChooseSeats}
            >
              Choose Seats
            </Button>
          )}
        </section>
      </article>
    );
  }
);

const AmenityItem = memo<AmenityItemProps>(({ amenity, classType }) => {
  // Clone the icon element with proper typing and className handling
  const iconElement = React.isValidElement(amenity.icon)
    ? React.cloneElement(amenity.icon as React.ReactElement<LucideProps>, {
        key: `icon-${amenity.label}`,
        className: cn(
          styles.amenityIconSvg,
          (amenity.icon as React.ReactElement<LucideProps>)?.props?.className ||
            ""
        ),
      })
    : amenity.icon;

  return (
    <div
      className={styles.amenityItem}
      role="listitem"
      aria-label={`${amenity.label} included in ${classType} class`}
    >
      <div className={styles.amenityIcon} aria-hidden="true">
        {iconElement}
      </div>
      <span className={styles.amenityLabel}>{amenity.label}</span>
    </div>
  );
});
AmenityItem.displayName = "AmenityItem";
FerryClassCard.displayName = "FerryClassCard";
