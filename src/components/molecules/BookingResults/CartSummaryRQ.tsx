// This file could be better named as ActivityCartSummary (least of my concerns right now tho)

"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit2,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Button, PassengerCounter, DateSelect } from "@/components/atoms";
import type { PassengerCount } from "@/components/atoms";
import { useActivityRQ } from "@/store";
import { useFormOptions, useActivityTimesByCategory } from "@/hooks/queries";
import type { CartSummaryProps } from "./CartSummary.types";
import styles from "./CartSummary.module.css";

export const CartSummaryRQ: React.FC<CartSummaryProps> = ({
  className,
  onAddMore,
}) => {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    startEditingItem,
    updateEditingSearchParams,
    saveEditedItem,
    editingItemId,
    editingSearchParams,
  } = useActivityRQ();

  // Use React Query for form options
  const { timeSlots } = useFormOptions();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingField, setEditingField] = useState<{
    itemId: string;
    field: "date" | "time" | "passengers";
  } | null>(null);

  const editingOverlayRef = useRef<HTMLDivElement>(null);

  // Get the category and location for the currently editing item
  const editingItemDetails = useMemo(() => {
    if (!editingField || editingField.field !== "time")
      return { category: null, location: null };

    const item = cart.find((item) => item.id === editingField.itemId);
    if (!item) return { category: null, location: null };

    const activity = item.activity;

    // Extract category slug
    const categorySlug =
      typeof activity.coreInfo.category[0] === "string"
        ? activity.coreInfo.category[0]
        : activity.coreInfo.category[0]?.slug || null;

    // Extract location slug
    const locationSlug =
      typeof activity.coreInfo.location[0] === "string"
        ? activity.coreInfo.location[0]
        : activity.coreInfo.location[0]?.slug || null;

    return { category: categorySlug, location: locationSlug };
  }, [editingField, cart]);

  // Use the correct hook to get time slots for the editing item's category and location
  const { data: categoryTimeSlots = [], isLoading: isLoadingTimeSlots } =
    useActivityTimesByCategory(
      editingItemDetails.category,
      editingItemDetails.location
    );

  // Transform time slots for editing
  const editingTimeSlots = useMemo(() => {
    // Use editingField instead of editingItemId from store
    if (!editingField || editingField.field !== "time") return [];

    // Get the specific activity from cart
    const item = cart.find((item) => item.id === editingField.itemId);
    const activity = item?.activity;

    // Use the fetched category time slots first
    if (categoryTimeSlots && categoryTimeSlots.length > 0) {
      return categoryTimeSlots.map((slot) => ({
        id: slot.value,
        value: slot.value,
        label: slot.label,
        time: slot.label,
      }));
    }

    // Fallback: Try to get activity's direct time slots
    const activitySlots = activity?.coreInfo?.defaultTimeSlots;

    if (activitySlots && activitySlots.length > 0) {
      const timeSlotOptions = activitySlots.map((slot: any) => ({
        id: slot.id,
        value: slot.startTime.replace(":", "-"),
        label: slot.displayTime || `${slot.startTime} - ${slot.endTime}`,
        time: slot.displayTime || `${slot.startTime} - ${slot.endTime}`,
      }));
      return timeSlotOptions;
    }

    // Final fallback: Simple standard options
    const fallbackOptions = [
      {
        id: "morning",
        value: "09-00",
        label: "9:00 AM - 12:00 PM",
        time: "9:00 AM - 12:00 PM",
      },
      {
        id: "afternoon",
        value: "14-00",
        label: "2:00 PM - 5:00 PM",
        time: "2:00 PM - 5:00 PM",
      },
    ];

    return fallbackOptions;
  }, [editingField, cart, categoryTimeSlots]);

  // Handle direct updates to cart items using the existing store methods
  const updateCartItem = useCallback(
    (cartItemId: string, updates: any) => {
      startEditingItem(cartItemId);
      updateEditingSearchParams(updates);
      saveEditedItem(cartItemId);
    },
    [startEditingItem, updateEditingSearchParams, saveEditedItem]
  );

  const handleDateChange = useCallback(
    (cartItemId: string, newDate: Date) => {
      updateCartItem(cartItemId, {
        date: newDate.toISOString().split("T")[0],
      });
      setEditingField(null);
    },
    [updateCartItem]
  );

  const handleTimeChange = useCallback(
    (cartItemId: string, newTimeSlot: string) => {
      updateCartItem(cartItemId, {
        time: newTimeSlot,
      });
      setEditingField(null);
    },
    [updateCartItem]
  );

  const handlePassengerChange = useCallback(
    (cartItemId: string, type: keyof PassengerCount, value: number) => {
      // Map the PassengerCounter type to the correct cart property
      // COMMENTED OUT: Infants not supported for activities
      const cartPropertyMap: Record<keyof PassengerCount, string> = {
        adults: "adults",
        children: "children",
        infants: "children", // COMMENTED OUT: Legacy support - map infants to children (not used for activities)
      };

      const cartProperty = cartPropertyMap[type];
      updateCartItem(cartItemId, {
        [cartProperty]: value,
      });
    },
    [updateCartItem]
  );

  const handleDateClick = useCallback((cartItemId: string) => {
    setEditingField({ itemId: cartItemId, field: "date" });
  }, []);

  const handleTimeClick = useCallback((cartItemId: string) => {
    setEditingField({ itemId: cartItemId, field: "time" });
  }, []);

  const handlePassengerClick = useCallback((cartItemId: string) => {
    setEditingField({ itemId: cartItemId, field: "passengers" });
  }, []);

  const handleRemove = useCallback(
    (cartItemId: string) => {
      removeFromCart(cartItemId);
    },
    [removeFromCart]
  );

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display using time slot options
  const formatTime = (timeString: string): string => {
    const timeSlot = editingTimeSlots.find((slot) => slot.value === timeString);
    return timeSlot?.label || timeString;
  };

  // Calculate total price and guest count
  const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalGuests = cart.reduce(
    (sum, item) => sum + item.searchParams.adults, // COMMENTED OUT: Only adults counted for activities
    0
  );

  // Handle clicks inside editing overlay to prevent closing
  const handleEditingOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handle closing editing overlay (only for passengers field done button)
  const handleCloseEditingOverlay = useCallback(() => {
    setEditingField(null);
  }, []);

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.cartContainer} ${className || ""}`}>
      {/* Mobile Header */}
      <div
        className={styles.mobileHeader}
        onClick={(e) => {
          e.stopPropagation();
          setIsCollapsed(!isCollapsed);
        }}
      >
        <div className={styles.headerWithBadge}>
          <div className={styles.itemCountBadge}>{cart.length}</div>
          <div className={styles.mobileHeaderContent}>
            <h3 className={styles.mobileTitle}>Your Selection</h3>
            <p className={styles.mobileSubtitle}>
              {totalGuests} guests • ₹{totalPrice.toLocaleString()}
            </p>
          </div>
        </div>
        <div className={styles.collapseSection}>
          <span className={styles.collapseText}>
            {isCollapsed ? "Show" : "Hide"}
          </span>
          <button
            className={styles.collapseButton}
            type="button"
            aria-label={isCollapsed ? "Expand cart" : "Collapse cart"}
          >
            <ChevronDown
              size={16}
              className={isCollapsed ? styles.rotated : ""}
            />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Your Selection</h3>
        {/* <Button
          variant="outline"
          className={styles.addMoreButton}
          onClick={onAddMore}
        >
          <Plus size={16} />
          <span className={styles.addMoreText}>Add More Activities</span>
          <span className={styles.addMoreTextShort}>Add</span>
        </Button> */}
      </div>

      {/* Cart Content */}
      <div
        className={`${styles.cartContent} ${isCollapsed ? styles.collapsed : ""
          }`}
      >
        <div className={styles.cartItems}>
          {cart.map((item) => {
            const activity = item.activity;
            const searchParams = item.searchParams;
            const isExpanded = expandedItems.has(item.id);
            const isEditingThisItem = editingField?.itemId === item.id;

            return (
              <div
                key={item.id}
                className={`${styles.cartItem} ${isEditingThisItem ? styles.editing : ""
                  }`}
              >
                {/* Mobile Compact View */}
                <div className={styles.mobileCompactView}>
                  <div className={styles.compactHeader}>
                    <div className={styles.compactInfo}>
                      <div className={styles.imageWithBadge}>
                        <img
                          src={
                            typeof activity.media.featuredImage === "string"
                              ? activity.media.featuredImage
                              : activity.media.featuredImage?.url ||
                              "/placeholder.jpg"
                          }
                          alt={activity.title}
                          className={styles.compactImage}
                        />
                        {searchParams.adults > 1 && (
                          <div className={styles.quantityBadge}>
                            {searchParams.adults}
                          </div>
                        )}
                      </div>
                      <div className={styles.compactDetails}>
                        <h4 className={styles.compactTitle}>
                          {activity.title}
                        </h4>
                        <div className={styles.compactMeta}>
                          <div
                            className={`${styles.editableField}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDateClick(item.id);
                            }}
                          >
                            <Calendar size={12} />
                            <span>{formatDate(searchParams.date)}</span>
                            <Edit2 size={10} className={styles.editIcon} />
                          </div>
                          <div
                            className={`${styles.editableField}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTimeClick(item.id);
                            }}
                          >
                            <Clock size={12} />
                            <span>{formatTime(searchParams.time)}</span>
                            <Edit2 size={10} className={styles.editIcon} />
                          </div>
                        </div>
                        <div className={styles.compactPricing}>
                          <div
                            className={`${styles.editableField} ${styles.guestCountClickable}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePassengerClick(item.id);
                            }}
                          >
                            <Users size={12} />
                            <span className={styles.guestCount}>
                              {searchParams.adults}{" "}
                              guests
                            </span>
                            <Edit2 size={8} className={styles.editIcon} />
                          </div>
                          <span className={styles.compactPrice}>
                            ₹{item.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.expandButton}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(item.id);
                      }}
                      aria-label={
                        isExpanded ? "Collapse details" : "Expand details"
                      }
                    >
                      <ChevronDown
                        size={16}
                        className={isExpanded ? styles.rotated : ""}
                      />
                    </button>
                  </div>

                  {/* Expanded Mobile Details */}
                  <div
                    className={`${styles.expandedDetails} ${isExpanded ? styles.expanded : ""
                      }`}
                  >
                    <div className={styles.mobileDetails}>
                      <div className={styles.detailRow}>
                        <MapPin size={14} />
                        <span>
                          {typeof activity.coreInfo.location === "string"
                            ? activity.coreInfo.location
                            : typeof activity.coreInfo.location[0] === "string"
                              ? activity.coreInfo.location[0]
                              : activity.coreInfo.location[0]?.name ||
                              "Unknown Location"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.mobileActions}>
                      <Button
                        variant="outline"
                        className={styles.mobileRemoveButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className={styles.desktopView}>
                  <div className={styles.cartItemGrid}>
                    {/* Column 1: Image */}
                    <div className={styles.gridImage}>
                      <div className={styles.imageWithBadge}>
                        <img
                          src={
                            typeof activity.media.featuredImage === "string"
                              ? activity.media.featuredImage
                              : activity.media.featuredImage?.url ||
                              "/placeholder.jpg"
                          }
                          alt={activity.title}
                          className={styles.activityImage}
                        />
                        {searchParams.adults > 1 && (
                          <div className={styles.quantityBadge}>
                            {searchParams.adults}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Details */}
                    <div className={styles.gridDetails}>
                      <h4 className={styles.cartItemTitle}>{activity.title}</h4>
                      {item.activityOptionId && (
                        <div className={styles.optionBadge}>
                          {activity.activityOptions?.find(
                            (opt) => opt.id === item.activityOptionId
                          )?.optionTitle || "Standard Option"}
                        </div>
                      )}
                      <div className={styles.locationInfo}>
                        <MapPin size={14} />
                        <span>
                          {typeof activity.coreInfo.location === "string"
                            ? activity.coreInfo.location
                            : typeof activity.coreInfo.location[0] === "string"
                              ? activity.coreInfo.location[0]
                              : activity.coreInfo.location[0]?.name ||
                              "Unknown Location"}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Date */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(item.id);
                      }}
                      className={styles.gridDate}
                    >
                      <div className={styles.columnLabel}>Date</div>
                      <div className={`${styles.editableField}`}>
                        <Calendar size={16} />
                        <span>{formatDate(searchParams.date)}</span>
                        <Edit2 size={12} className={styles.editIcon} />
                      </div>
                    </div>

                    {/* Column 4: Time */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTimeClick(item.id);
                      }}
                      className={styles.gridTime}
                    >
                      <div className={styles.columnLabel}>Time</div>
                      <div className={`${styles.editableField}`}>
                        <Clock size={16} />
                        <span>{formatTime(searchParams.time)}</span>
                        <Edit2 size={12} className={styles.editIcon} />
                      </div>
                    </div>

                    {/* Column 5: Price & Guests */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePassengerClick(item.id);
                      }}
                      className={styles.gridPricing}
                    >
                      <div className={styles.mainPrice}>
                        ₹{item.totalPrice.toLocaleString()}
                      </div>
                      <div
                        className={`${styles.editableField} ${styles.guestCountClickable} ${styles.quantityInfo}`}
                      >
                        <Users size={14} />
                        <span>
                          {searchParams.adults} guests
                        </span>
                        <Edit2 size={12} className={styles.editIcon} />
                      </div>
                    </div>

                    {/* Column 6: Actions */}
                    <div className={styles.gridActions}>
                      <Button
                        variant="outline"
                        className={styles.removeButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                      >
                        <Trash2 size={14} />
                        <span className={styles.buttonText}>Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Inline Editing Overlays */}
                {editingField?.itemId === item.id && (
                  <div
                    ref={editingOverlayRef}
                    className={styles.editingOverlay}
                    onClick={handleEditingOverlayClick}
                  >
                    {editingField.field === "date" && (
                      <div className={styles.inlineEditSection}>
                        <h4 className={styles.editSectionTitle}>Select Date</h4>
                        <DateSelect
                          selected={new Date(searchParams.date)}
                          onChange={(date) => handleDateChange(item.id, date)}
                          label=""
                          className={styles.inlineDateSelect}
                        />
                        <div className={styles.inlineEditActions}>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={handleCloseEditingOverlay}
                            className={styles.cancelEditButton}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {editingField.field === "time" && (
                      <div className={styles.inlineEditSection}>
                        <h4 className={styles.editSectionTitle}>Select Time</h4>
                        {isLoadingTimeSlots ? (
                          <div className={styles.loadingTimeSlots}>
                            Loading available times...
                          </div>
                        ) : (
                          <div className={styles.timeSlotGrid}>
                            {editingTimeSlots.map((slot) => (
                              <button
                                key={slot.value}
                                className={`${styles.timeSlotButton} ${searchParams.time === slot.value
                                    ? styles.selected
                                    : ""
                                  }`}
                                onClick={() =>
                                  handleTimeChange(item.id, slot.value)
                                }
                              >
                                {slot.label}
                              </button>
                            ))}
                            {editingTimeSlots.length === 0 && (
                              <div className={styles.noTimeSlots}>
                                No time slots available for this activity
                              </div>
                            )}
                          </div>
                        )}
                        <div className={styles.inlineEditActions}>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={handleCloseEditingOverlay}
                            className={styles.cancelEditButton}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {editingField.field === "passengers" && (
                      <div className={styles.inlineEditSection}>
                        <h4 className={styles.editSectionTitle}>
                          Adjust Guests
                        </h4>
                        <PassengerCounter
                          value={{
                            adults: searchParams.adults,
                            children: searchParams.children,
                          }}
                          onChange={(type, value) =>
                            handlePassengerChange(item.id, type, value)
                          }
                          className={styles.inlinePassengerCounter}
                          hideInfants={true} // COMMENTED OUT: Hide infants for activities
                          hideChildren={true} // COMMENTED OUT: Hide children for activities
                        />
                        <div className={styles.inlineEditActions}>
                          <Button
                            variant="primary"
                            size="small"
                            onClick={handleCloseEditingOverlay}
                            className={styles.saveEditButton}
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Signals Row */}
        <div className={styles.trustSignalsRow}>
          <p className={styles.trustItem}>✓ Instant Confirmation</p>
          <p className={styles.trustSubtext}>Free cancellation</p>
        </div>

        {/* Action Section */}
        <div className={styles.actionSection}>
          <Button
            className={styles.enhancedNextButton}
            onClick={() => router.push("/checkout?type=activity")}
            showArrow
          >
            Proceed to Booking
          </Button>
        </div>
      </div>
    </div>
  );
};
