import React, { useMemo, useCallback } from "react";
import type { FeaturePackageCardProps } from "./FeaturePackageCard.types";
import clsx from "clsx";
import styles from "./FeaturePackageCard.module.css";
import { ImageContainer } from "@/components/atoms";

// Extract location icon as a constant to avoid recreating on each render
const LocationIcon = () => (
  <svg
    className={styles.locationIcon}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// Extract arrow icon as a constant
const ActionArrow = () => (
  <svg
    className={styles.actionArrow}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const FeaturePackageCard: React.FC<FeaturePackageCardProps> = ({
  title,
  description,
  price,
  originalPrice,
  locations,
  duration,
  image,
  href,
  className,
}) => {
  // Optimized helper function to format all locations with & separator
  const formattedLocations = useMemo(() => {
    if (!locations?.length) return "";

    // Extract location names efficiently
    const locationNames = locations
      .map((location) => {
        if (typeof location === "string") return location;
        return location?.name || "Unknown Location";
      })
      .filter(Boolean); // Remove any falsy values

    // Join all locations with " & "
    return locationNames.join(" & ");
  }, [locations]);

  // Calculate discount percentage - memoized for performance
  const discountPercentage = useMemo(() => {
    return originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;
  }, [originalPrice, price]);

  // Memoize aria-label to avoid recalculation
  const ariaLabel = useMemo(
    () =>
      `View ${title} package details - ${formattedLocations} - ${duration} - ₹${price} per person`,
    [title, formattedLocations, duration, price]
  );

  // Optimize click handlers with useCallback
  const handleClick = useCallback(() => {
    window.location.href = href;
  }, [href]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.location.href = href;
      }
    },
    [href]
  );

  // Early return optimization - only render if required props exist
  if (!title || !price || !href) {
    return null;
  }

  return (
    <article
      className={clsx(styles.card, className)}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      <div className={styles.contentWrapper}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <ImageContainer
            src={image}
            alt={`${title} package`}
            className={styles.imageWrapper}
          />
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          {/* Top Section: Title, Location & Duration Badge */}
          <div className={styles.topSection}>
            <div className={styles.titleGroup}>
              <h3 className={styles.title}>{title}</h3>

              {/* Location with Icon */}
              {formattedLocations && (
                <div className={styles.locationGroup}>
                  <LocationIcon />
                  <span className={styles.location}>{formattedLocations}</span>
                </div>
              )}
            </div>

            {/* Duration Badge */}
            {duration && (
              <div
                className={styles.durationBadge}
                aria-label={`Duration: ${duration}`}
              >
                {duration}
              </div>
            )}
          </div>

          {/* Description */}
          {description && <p className={styles.description}>{description}</p>}

          {/* Bottom Section: Price & Action */}
          <div className={styles.bottomSection}>
            {/* Price Section */}
            <div className={styles.priceSection}>
              {/* Discount and Original Price Row */}
              {originalPrice && originalPrice > price && (
                <div className={styles.discountRow}>
                  <span
                    className={styles.originalPrice}
                    aria-label={`Original price: ₹${originalPrice}`}
                  >
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  {discountPercentage && (
                    <span
                      className={styles.discountBadge}
                      aria-label={`${discountPercentage}% discount`}
                    >
                      -{discountPercentage}% OFF
                    </span>
                  )}
                </div>
              )}

              {/* Current Price Row */}
              <div className={styles.currentPriceRow}>
                <span
                  className={styles.currentPrice}
                  aria-label={`Current price: ₹${price} per person`}
                >
                  ₹{price.toLocaleString()}
                </span>
                <span className={styles.perPerson} aria-hidden="true">
                  /person
                </span>
              </div>
            </div>

            {/* Visual Action Indicator */}
            <div className={styles.actionIndicator} aria-hidden="true">
              <span className={styles.actionText}>View Details</span>
              <ActionArrow />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
