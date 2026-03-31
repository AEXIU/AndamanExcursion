// src/components/molecules/BookingResults/ActivityResultsRQ.tsx
import React, { memo, useMemo, useCallback } from "react";
import { Column } from "@/components/layout";
import { ActivitySearchParams, useActivityRQ } from "@/store";
import { useActivitiesSearch } from "@/hooks/queries";
import { transformActivitiesToCards } from "@/utils/activityTransformers";
import styles from "./BookingResults.module.css";
import ActivityCard from "../Cards/ActivityCard/ActivityCard";
import NoActivitiesCard from "../Cards/ComponentStateCards/NoActivitiesCard";
import ErrorCard from "../Cards/ComponentStateCards/ErrorCard";
import LoadingCard from "../Cards/ComponentStateCards/LoadingCard";

interface ActivityResultsRQProps {
  searchParams: ActivitySearchParams;
  className?: string;
}

export const ActivityResultsRQ = memo<ActivityResultsRQProps>(
  ({ searchParams, className }) => {
    // Use React Query for data fetching
    const {
      data: activities = [],
      isLoading,
      error,
      refetch,
      isFetching,
      dataUpdatedAt,
      isSuccess,
      isError,
      status,
    } = useActivitiesSearch(searchParams, !!searchParams.activityType);

    // // Debug logging
    // console.log("🔎 ActivityResultsRQ - Render state:", {
    //   searchParams,
    //   enabled: !!searchParams.activityType,
    //   isLoading,
    //   isFetching,
    //   error: error?.message,
    //   activitiesCount: activities?.length || 0,
    //   activities: activities?.map((a) => ({ id: a.id, title: a.title })) || [],
    //   dataUpdatedAt,
    //   isSuccess,
    //   isError,
    //   status,
    // });

    // Use the modernized Zustand store for cart operations
    const { addToCart, saveEditedItem, editingItemId, getCartItemById } =
      useActivityRQ();

    // Optimized activity selection handler
    const handleActivitySelection = useCallback(
      (activityId: string, optionId: string) => {
        // Find the selected activity
        const selectedActivity = activities.find(
          (activity) => activity.id === activityId
        );

        if (selectedActivity) {
          // Check if we're in edit mode
          if (editingItemId) {
            // Get the current cart item being edited
            const currentItem = getCartItemById(editingItemId);

            // Check if user is selecting the same activity with the same option
            const isSameActivity =
              currentItem &&
              currentItem.activity.id === activityId &&
              currentItem.activityOptionId === optionId;

            if (isSameActivity) {
              // User is confirming the edit with the same activity - just save the search param changes
              saveEditedItem(
                editingItemId,
                currentItem.activity,
                currentItem.activityOptionId
              );
            } else {
              // User is changing to a different activity or option - save with new activity
              saveEditedItem(editingItemId, selectedActivity, optionId);
            }
          } else {
            // Add new activity to cart with current search params
            addToCart(selectedActivity, 1, optionId, searchParams);

            // Scroll to cart section after adding
            setTimeout(() => {
              const cartSection = document.getElementById("cart-section");
              if (cartSection) {
                const headerOffset = 80; // Account for fixed header
                const elementPosition = cartSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth"
                });
              }
            }, 100);
          }
        }
      },
      [
        activities,
        editingItemId,
        saveEditedItem,
        addToCart,
        searchParams,
        getCartItemById,
      ]
    );

    // Transform activities using optimized pure functions (memoized)
    const activityCards = useMemo(() => {
      if (isLoading || !activities || activities.length === 0) {
        return [];
      }

      return transformActivitiesToCards(
        activities,
        searchParams,
        handleActivitySelection
      );
    }, [activities, searchParams, handleActivitySelection, isLoading]);

    // Handle retry for errors
    const handleRetry = useCallback(() => {
      refetch();
    }, [refetch]);

    // Render states
    if (isLoading) {
      return <LoadingCard className={styles.loadingContainer} />;
    }

    if (error) {
      return (
        <ErrorCard
          error={error as Error}
          onRetry={handleRetry}
          className={styles.errorContainer}
          text="Error loading activities"
        />
      );
    }

    if (!activities || activities.length === 0) {
      return <NoActivitiesCard className={styles.noResultsContainer} />;
    }

    return (
      <Column gap="var(--space-6)" className={className}>
        {activityCards.map((activityCard) => (
          <ActivityCard key={activityCard.id} {...activityCard} />
        ))}
      </Column>
    );
  }
);

ActivityResultsRQ.displayName = "ActivityResultsRQ";
