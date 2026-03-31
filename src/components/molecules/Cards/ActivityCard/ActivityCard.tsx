"use client";

import React, {
  useRef,
  useState,
  useCallback,
  memo,
  useMemo,
  useEffect,
} from "react";
import clsx from "clsx";
import styles from "./ActivityCard.module.css";
import { Button } from "@/components/atoms";
import { MediaSlider } from "@/components/layout/MediaSlider/MediaSlider";
import { ClassCard } from "../ClassCard/ClassCard";
import { ChevronDown, Clock, MapPin, User } from "lucide-react";
import { Media } from "@payload-types";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  isAvailable: boolean;
}

interface ActivityOption {
  id: string;
  type: string;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  description: string;
  seatsLeft: number;
  amenities?: {
    icon: string;
    label: string;
  }[];
  media?: (string | Media)[];
}

interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  media: Array<{ src: string | Media; alt: string }>;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  type: string;
  duration: string;
  location?: string;
  totalGuests?: number;
  href?: string;
  className?: string;
  activityOptions?: ActivityOption[];
  availableTimeSlots?: Array<{
    id: string;
    startTime: string;
    endTime?: string;
    displayTime: string;
    isAvailable: boolean;
  }>;
  onSelectActivity?: (activityId: string, optionId: string) => void;
  selectedOptionId?: string;
  maxTimeSlots?: number;
  timeSlots?: string[];
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  title,
  description,
  media,
  price,
  totalPrice,
  originalPrice,
  originalTotalPrice,
  type,
  duration,
  availableTimeSlots = [],
  href,
  className,
  activityOptions = [],
  onSelectActivity,
  selectedOptionId,
  totalGuests,
  location,
  timeSlots = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Success state
  const [addedActivityId, setAddedActivityId] = useState<string | null>(null);

  // Find the initial selected option index based on selectedOptionId
  const initialSelectedIndex = useMemo(() => {
    if (selectedOptionId && activityOptions.length > 0) {
      const foundIndex = activityOptions.findIndex(
        (option) => option.id === selectedOptionId
      );
      return foundIndex >= 0 ? foundIndex : 0;
    }
    return 0;
  }, [selectedOptionId, activityOptions]);

  const [selectedOptionIndex, setSelectedOptionIndex] =
    useState(initialSelectedIndex);

  // Update selectedOptionIndex when selectedOptionId changes (for edit mode)
  useEffect(() => {
    if (selectedOptionId && activityOptions.length > 0) {
      const foundIndex = activityOptions.findIndex(
        (option) => option.id === selectedOptionId
      );
      if (foundIndex >= 0) {
        setSelectedOptionIndex(foundIndex);
      }
    }
  }, [selectedOptionId, activityOptions]);

  // Optimized add activity handler
  const handleAddActivity = useCallback(
    (optionId: string) => {
      if (onSelectActivity) {
        onSelectActivity(id, optionId);

        // Show success feedback
        setAddedActivityId(optionId);

        const formElement = document.getElementById("booking-form-section");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Clear success feedback after 3 seconds
        setTimeout(() => {
          setAddedActivityId(null);
        }, 3000);
      }
    },
    [id, onSelectActivity]
  );

  // Optimized option selection handler
  const handleSelectOption = useCallback((index: number) => {
    setSelectedOptionIndex(index);
  }, []);

  // Updated card click handler - simplified to just toggle expansion
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Prevent expansion if clicking on interactive elements
    const target = e.target as HTMLElement;

    // Check if clicking within the MediaSlider navigation or controls
    const isMediaSliderControl =
      target.closest('[class*="sliderButton"]') ||
      target.closest('[class*="sliderDot"]') ||
      target.closest('[class*="sliderCounter"]') ||
      target.closest('[data-slider-control]');

    // Check for interactive elements, but exclude the card itself
    const closestButton = target.closest("button");
    const closestRoleButton = target.closest('[role="button"]');
    
    // If the closest role="button" is the card itself, ignore it
    const isCardItself = closestRoleButton === e.currentTarget;
    
    const isInteractiveElement =
      closestButton ||
      (closestRoleButton && !isCardItself) ||
      target.tagName === "BUTTON" ||
      target.closest("video") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea") ||
      isMediaSliderControl;

    if (isInteractiveElement) {
      e.stopPropagation();
      return;
    }

    // Toggle expansion state
    setIsExpanded((prev) => !prev);
  }, [isExpanded]);

  const handleCardKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Don't handle keyboard events if focus is on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="button"]')) {
      return;
    }

    // Toggle expansion on Enter or Space
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsExpanded((prev) => !prev);
    }
  }, []);

  // Dedicated toggle handler for the "View Details" button
  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  // Calculate discount percentage if original prices exist
  const discountPercentage = useMemo(() => {
    if (originalPrice && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return null;
  }, [originalPrice, price]);

  const totalDiscountPercentage = useMemo(() => {
    if (originalTotalPrice && originalTotalPrice > totalPrice) {
      return Math.round(
        ((originalTotalPrice - totalPrice) / originalTotalPrice) * 100
      );
    }
    return null;
  }, [originalTotalPrice, totalPrice]);

  // Format all media for MediaSlider (including featured image)
  const allMediaForSlider = useMemo(() => {
    return media.map((mediaItem) => ({
      src: mediaItem.src,
      alt: mediaItem.alt || `${title} image`,
    }));
  }, [media, title]);

  // Get properly formatted time slots for display
  const displayTimeSlots = useMemo(() => {
    if (!availableTimeSlots?.length) return [];
    return availableTimeSlots.filter((slot) => slot.isAvailable);
  }, [availableTimeSlots]);

  return (
    <article
      className={clsx(styles.card, className, {
        [styles.expanded]: isExpanded,
      })}
      role="button"
      tabIndex={0}
      aria-label={`Activity: ${title}. ${
        isExpanded
          ? "Press Enter to collapse"
          : "Press Enter to expand and view details"
      }`}
      aria-expanded={isExpanded}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div
        className={styles.contentWrapper}
        data-expanded={isExpanded}
        ref={contentWrapperRef}
      >
        {/* Media Slider Section - Replacing the single image */}
        <div className={styles.imageWrapper}>
          <MediaSlider
            media={allMediaForSlider}
            altText={`${title} activity media`}
          />
        </div>

        {/* Content Section - New improved layout */}
        <div className={styles.textContent}>
          {/* TOP ROW: Title and Pricing */}
          <div className={styles.topRow}>
            <div className={styles.titleSection}>
              <h3 className={styles.title}>{title}</h3>
              <div className={styles.activityMetadata}>
                {type && (
                  <div className={styles.typeContainer}>
                    <span className={styles.type}>{type}</span>
                  </div>
                )}
                {duration && (
                  <div className={styles.durationContainer}>
                    <Clock
                      size={16}
                      className={styles.durationIcon}
                      color="var(--color-text-secondary)"
                    />
                    <span className={styles.duration}>{duration}</span>
                  </div>
                )}
                {location && (
                  <div className={styles.locationContainer}>
                    <MapPin size={16} color="var(--color-text-secondary)" />
                    <span className={styles.location}>{location}</span>
                  </div>
                )}
                {totalGuests && (
                  <div className={styles.locationContainer}>
                    <User
                      size={16}
                      className={styles.guestsIcon}
                      color="var(--color-text-secondary)"
                    />
                    <span className={styles.location}>{totalGuests}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className={styles.pricingSection}>
              {discountPercentage && (
                <span
                  className={styles.discountBadge}
                  aria-label={`${discountPercentage}% discount`}
                >
                  -{discountPercentage}% OFF
                </span>
              )}
              <div className={styles.mainPriceRow}>
                <span
                  className={styles.originalPrice}
                  aria-label={`Original price: ₹${originalPrice}`}
                >
                  ₹{originalPrice}
                </span>
                <span
                  className={styles.currentPrice}
                  aria-label={`Current price: ₹${price} per adult`}
                >
                  ₹{price}
                </span>
                <span className={styles.perPerson} aria-hidden="true">
                  /adult
                </span>
              </div>

              {/* Total Price Info */}
              <div className={styles.totalPriceInfo}>
                {originalTotalPrice && originalTotalPrice > totalPrice && (
                  <span
                    className={styles.originalTotalPrice}
                    aria-label={`Original total: ₹${originalTotalPrice}`}
                  >
                    ₹{originalTotalPrice}
                  </span>
                )}
                <span
                  className={styles.totalPrice}
                  aria-label={`Total price: ₹${totalPrice}`}
                >
                  ₹{totalPrice}
                </span>
                <span className={styles.totalLabel} aria-hidden="true">
                  /total
                </span>
              </div>
            </div>
          </div>

          {/* THIRD ROW: Available Times */}
          {displayTimeSlots.length > 0 && (
            <div className={styles.timeSlotsRow}>
              <h4 className={styles.timeSlotsTitle}>Available Times</h4>
              <div className={styles.timeSlotsList}>
                {displayTimeSlots.slice(0, 4).map((slot) => (
                  <span key={slot.id} className={styles.timeSlot}>
                    {slot.displayTime}
                  </span>
                ))}
                {displayTimeSlots.length > 4 && (
                  <span className={styles.moreSlots}>
                    +{displayTimeSlots.length - 4} more times
                  </span>
                )}
              </div>
            </div>
          )}

          {/* FOURTH ROW: Description and Toggle Details */}
          <div className={styles.bottomRow}>
            <p className={styles.description}>{description}</p>
              <Button
                variant="outline"
                onClick={toggleExpand}
                type="button"
                size="small"
                aria-expanded={isExpanded}
                icon={
                  <ChevronDown
                    strokeWidth={2}
                    size={16}
                    aria-hidden="true"
                    className={clsx(styles.chevronIcon, {
                      [styles.chevronExpanded]: isExpanded,
                    })}
                  />
                }
              >
                {isExpanded ? "Hide Details" : "View Details"}
              </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <section
          className={styles.classesContainer}
          id={`${id}-details`}
          role="region"
          aria-label={`${title} booking options`}
        >
          <div className={styles.classesWrapper}>
            {activityOptions.map((activityOption, index) => (
              <ClassCard
                key={activityOption.id}
                classOption={activityOption}
                isActive={index === selectedOptionIndex}
                onSelect={() => handleSelectOption(index)}
                onAction={() => handleAddActivity(activityOption.id)}
                showActionButton={index === selectedOptionIndex}
                actionButtonText="Add Activity"
                contentType="activity"
                isAdded={addedActivityId === activityOption.id}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

// Export memoized component for performance
export default memo(ActivityCard);
