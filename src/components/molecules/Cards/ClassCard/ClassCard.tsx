"use client";

import React, { memo, useCallback } from "react";
import Image from "next/image";
import { AlertCircle, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "./ClassCard.module.css";
import { Button } from "@/components/atoms";
import poolIcon from "@public/icons/misc/poolLadder.svg";

export interface ClassOption {
  id: string;
  type: string;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  seatsLeft?: number;
  amenities?: {
    icon: string;
    label: string;
  }[];
  description?: string;
}

interface ClassCardProps {
  classOption: ClassOption;
  isActive: boolean;
  onSelect: () => void;
  onAction?: (classType: string) => void;
  showActionButton?: boolean;
  actionButtonText?: string;
  contentType: "ferry" | "activity";
  isAdded?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = memo(
  ({
    classOption,
    isActive,
    onSelect,
    onAction,
    showActionButton = false,
    actionButtonText = "Select",
    contentType,
    isAdded = false,
  }) => {
    // Generate base IDs
    const cardId = `${contentType}-class-${classOption.type
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    const priceId = `${cardId}-price`;
    const amenitiesId = `${cardId}-amenities`;
    const alertId = `${cardId}-alert`;

    // Simple calculations
    const shouldShowAlert =
      classOption.seatsLeft !== undefined && classOption.seatsLeft <= 10;
    const seatText =
      classOption.seatsLeft !== undefined
        ? `${classOption.seatsLeft} seat${
            classOption.seatsLeft !== 1 ? "s" : ""
          }`
        : "";

    // Calculate discount percentages
    const discountPercentage =
      classOption.originalPrice && classOption.originalPrice > classOption.price
        ? Math.round(
            ((classOption.originalPrice - classOption.price) /
              classOption.originalPrice) *
              100
          )
        : null;

    const totalDiscountPercentage =
      classOption.originalTotalPrice &&
      classOption.originalTotalPrice > classOption.totalPrice
        ? Math.round(
            ((classOption.originalTotalPrice - classOption.totalPrice) /
              classOption.originalTotalPrice) *
              100
          )
        : null;

    const cardClassName = cn(
      styles.classCard,
      isActive ? styles.activeClass : styles.inactiveClass
    );

    // Build ARIA description
    const ariaIds = [priceId];
    if (classOption.amenities) ariaIds.push(amenitiesId);
    if (shouldShowAlert) ariaIds.push(alertId);
    const ariaDescribedBy = ariaIds.join(" ");

    // Event handlers
    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect();
      },
      [onSelect]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onSelect();
        }
      },
      [onSelect]
    );

    const handleAction = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAction?.(classOption.id);
      },
      [onAction, classOption.id]
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
        aria-describedby={ariaDescribedBy}
      >
        <header className={styles.classHeader}>
          <div className={styles.classInfo}>
            <div className={styles.typeIconContainer}>
              <span className={styles.typeIcon}>
                <Image
                  src={poolIcon}
                  alt={classOption.type}
                  aria-hidden="true"
                  width={18}
                  height={18}
                />
              </span>
              <h3 className={styles.className} id={`${cardId}-title`}>
                {classOption.type}
              </h3>
            </div>

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
                  size={14}
                  aria-hidden="true"
                />
                <span className={styles.alertText}>
                  <strong>Hurry!</strong> Only {seatText} left
                </span>
              </div>
            )}
          </div>

          <div className={styles.classPriceInfo} id={priceId}>
            {/* Per Adult Price */}
            <div className={styles.pricePerAdult}>
              {classOption.originalPrice &&
              classOption.originalPrice > classOption.price ? (
                <>
                  <span className={styles.originalPrice}>
                    ₹{classOption.originalPrice}
                  </span>
                  <span className={styles.discountedPrice}>
                    ₹{classOption.price}
                  </span>
                  <span>/adult</span>
                </>
              ) : (
                <span>₹{classOption.price}/adult</span>
              )}
            </div>

            {/* Total Price */}
            <div className={styles.totalPrice}>
              {classOption.originalTotalPrice &&
              classOption.originalTotalPrice > classOption.totalPrice ? (
                <>
                  <span className={styles.originalTotalPrice}>
                    ₹{classOption.originalTotalPrice}
                  </span>
                  <span className={styles.discountedTotalPrice}>
                    ₹{classOption.totalPrice}/
                  </span>
                  <span>total</span>
                </>
              ) : (
                <span>₹{classOption.totalPrice}/ total</span>
              )}
            </div>
          </div>
        </header>

        <section className={styles.contentContainer}>
          <div>
            {classOption.description && (
              <p className={styles.description}>{classOption.description}</p>
            )}
          </div>

          {showActionButton && onAction && (
            <Button
              variant="primary"
              size="small"
              onClick={handleAction}
              type="button"
              aria-describedby={`${cardId}-title ${priceId}`}
              icon={<Plus size={16} aria-hidden="true" />}
            >
              {isAdded ? "Added" : actionButtonText}
            </Button>
          )}
        </section>
      </article>
    );
  }
);

ClassCard.displayName = "ClassCard";
