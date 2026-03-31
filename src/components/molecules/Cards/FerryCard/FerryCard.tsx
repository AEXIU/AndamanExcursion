"use client";
import React, { memo, useCallback } from "react";
import { cn } from "@/utils/cn";
import styles from "./FerryCard.module.css";
import type { FerryCardProps } from "./FerryCard.types";
import { FerryHeader, SeatsInfo, JourneyInfo, PriceInfo } from "./components";
import { Button } from "@/components/atoms";

export const FerryCard = memo<FerryCardProps>(
  ({
    ferryName,
    rating,
    departureTime,
    departureLocation,
    arrivalTime,
    arrivalLocation,
    price,
    totalPrice,
    seatsLeft,
    onBookNow, // Changed from onChooseSeats
    className,
    ferryIndex,
    detailsUrl,
    operator,
  }) => {
    const handleBookNow = useCallback(() => {
      onBookNow?.();
    }, [onBookNow]);

    return (
      <article
        className={cn(styles.ferryCard, className)}
        role="article"
        aria-label={`Ferry option ${ferryName}`}
      >
        <div className={styles.cardContent}>
          {/* Header row with ferry info and seats */}
          <div className={styles.headerRow}>
            <FerryHeader
              ferryName={ferryName}
              rating={rating}
              detailsUrl={detailsUrl}
              operator={operator}
            />
            <SeatsInfo seatsLeft={seatsLeft} />
          </div>

          {/* Journey row with times, price, and book button */}
          <div className={styles.journeyRow}>
            <JourneyInfo
              departureTime={departureTime}
              departureLocation={departureLocation}
              arrivalTime={arrivalTime}
              arrivalLocation={arrivalLocation}
            />

            <div className={styles.priceAndBookContainer}>
              <PriceInfo
                price={price}
                totalPrice={totalPrice}
                isExpanded={false} // Always collapsed now
              />
              <Button
                variant="primary"
                showArrow
                size="small"
                onClick={handleBookNow}
                className={styles.bookButton}
              >
                Book
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }
);

FerryCard.displayName = "FerryCard";
