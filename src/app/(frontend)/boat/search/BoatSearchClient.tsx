// src/app/(frontend)/boat/search/BoatSearchClient.tsx
"use client";
import React, { Suspense, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import styles from "./page.module.css";
import { SectionTitle } from "@/components/atoms";
import { useBoat } from "@/store/BoatStore";
import { useBoatFormOptions } from "@/hooks/queries/useBoats";
import { SearchSummary } from "@/components/molecules/BookingResults";
import { BoatResults } from "@/components/molecules/BookingResults/BoatResults";
import { BoatCartSummary } from "@/components/molecules/BookingResults/BoatCartSummary";
import { UnifiedSearchingForm } from "@/components/organisms";

interface BoatSearchClientProps {
  initialSearchParams: {
    fromLocation?: string;
    toLocation?: string;
    date?: string;
    time?: string;
    adults?: string;
    children?: string;
  };
}

// Component for cart content with empty state
const BoatCartContent = () => {
  const { cart } = useBoat();
  const router = useRouter();

  // Optimized scroll handler
  const handleAddMore = useCallback(() => {
    const formElement = document.getElementById("booking-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <p className={styles.emptyCartText}>No boats selected yet</p>
        <p className={styles.emptyCartSubtext}>
          Use the form to search and add boat trips
        </p>
      </div>
    );
  }

  return (
    <BoatCartSummary
      cart={cart}
      onAddMore={handleAddMore}
      onCheckout={() => {
        // Navigate to checkout with type as boat
        router.push("/checkout?type=boat");
      }}
    />
  );
};

// Component that handles search params and displays results
const BoatSearchContent = ({
  initialSearchParams,
}: {
  initialSearchParams: BoatSearchClientProps["initialSearchParams"];
}) => {
  const searchParams = useSearchParams();
  const { searchParams: currentParams, updateSearchParams } = useBoat();
  const initializedRef = React.useRef(false);

  // Memoize search params extraction to avoid re-computation
  const urlSearchParams = useMemo(() => {
    const fromLocation = searchParams.get("fromLocation");
    const toLocation = searchParams.get("toLocation");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const adults = parseInt(searchParams.get("adults") || "1", 10); // Fixed: Match activity default of 1 adult
    const children = parseInt(searchParams.get("children") || "0", 10);

    return {
      fromLocation,
      toLocation,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "",
      adults,
      children,
    };
  }, [searchParams]);

  // Load search params from URL on mount only once
  useEffect(() => {
    if (initializedRef.current) return;

    const { fromLocation, toLocation, ...restParams } = urlSearchParams;

    // Trigger search if we have fromLocation
    if (fromLocation) {
      const params = {
        fromLocation,
        toLocation: toLocation || "",
        ...restParams,
      };

      updateSearchParams(params);
      initializedRef.current = true;
    }
  }, [urlSearchParams, updateSearchParams]);

  // Fetch boat data
  const {
    boatRoutes,
    fromLocations,
    isLoading: isLoadingBoatOptions,
  } = useBoatFormOptions();

  // Memoize display names to prevent unnecessary re-computations
  const displayNames = useMemo(() => {
    const fromLocationName = fromLocations.find(
      (location) => location.slug === currentParams.fromLocation
    )?.name;

    const selectedRoute = boatRoutes.data?.find(
      (route) => route.id === currentParams.toLocation
    );
    const toLocationName = selectedRoute?.toLocation;

    return {
      fromLocationName,
      toLocationName,
    };
  }, [
    currentParams.fromLocation,
    currentParams.toLocation,
    fromLocations,
    boatRoutes.data,
  ]);

  // Memoize total passengers calculation
  const totalPassengers = useMemo(
    () => currentParams.adults + currentParams.children,
    [currentParams.adults, currentParams.children]
  );

  // Get available boats for the selected route
  const availableBoats = useMemo(() => {
    if (!currentParams.toLocation) return [];

    const selectedRoute = boatRoutes.data?.find(
      (route) => route.id === currentParams.toLocation
    );
    if (!selectedRoute) return [];

    // Transform route data to match Boat.route interface
    const routeData = {
      id: selectedRoute.id,
      from:
        typeof selectedRoute.fromLocation === "string"
          ? selectedRoute.fromLocation
          : selectedRoute.fromLocation.name,
      to: selectedRoute.toLocation,
      fare: selectedRoute.fare,
      timing:
        selectedRoute.availableTimings
          ?.map((t) => t.departureTime)
          .filter(Boolean) || [],
      minTimeAllowed: selectedRoute.duration || "Full day",
      description: selectedRoute.description || undefined,
    };

    // Fallback: create a boat from the route data
    return [
      {
        id: selectedRoute.id,
        route: routeData,
        name: selectedRoute.name,
        description: selectedRoute.description || undefined,
        fare: selectedRoute.fare,
        timing:
          selectedRoute.availableTimings
            ?.map((t) => t.departureTime)
            .filter(Boolean) || [],
        minTimeAllowed: selectedRoute.duration || "Full day",
        capacity: 50, // Default capacity
        operator: "Andaman Excursion",
      },
    ];
  }, [currentParams.toLocation, boatRoutes.data]);

  return (
    <Column gap="var(--space-6)" fullWidth>
      {/* Search Summary & Results Container */}
      <Section className={styles.resultsSection}>
        <Column gap="var(--space-4)" fullWidth>
          {/* Search Summary */}
          {currentParams.fromLocation && (
            <SearchSummary
              loading={isLoadingBoatOptions}
              resultCount={availableBoats.length}
              activity={`${displayNames.fromLocationName} to ${displayNames.toLocationName}`}
              activityName=""
              location=""
              locationName=""
              date={currentParams.date}
              time={currentParams.time}
              passengers={totalPassengers}
              type="boat"
            />
          )}

          {/* Boat Results */}
          <BoatResults
            searchParams={currentParams}
            boats={availableBoats}
            loading={isLoadingBoatOptions}
          />
        </Column>
      </Section>
    </Column>
  );
};

// Memoized component for the page title
const BoatPageTitle = React.memo(() => {
  const { searchParams } = useBoat();
  const { fromLocations } = useBoatFormOptions();

  // Memoize the title computation
  const titleData = useMemo(() => {
    const fromLocationName =
      fromLocations.find(
        (location) => location.slug === searchParams.fromLocation
      )?.name || "Boat Trips";

    const titleText = `${fromLocationName} Ferry Services`;

    return { fromLocationName, titleText };
  }, [fromLocations, searchParams.fromLocation]);

  return (
    <SectionTitle
      specialWord={titleData.fromLocationName}
      text={titleData.titleText}
      id="available-boats-title"
    />
  );
});

BoatPageTitle.displayName = "BoatPageTitle";

// Main client component that contains all the interactive logic
export function BoatSearchClient({
  initialSearchParams,
}: BoatSearchClientProps) {
  return (
    <main className={styles.main}>
      {/* Booking Form Section */}
      <Section
        ariaLabelledby="management-section"
        id="booking-form-section"
        className={styles.managementSection}
      >
        <Column gap="var(--space-6)" fullWidth alignItems="start">
          <h1 className={styles.sectionHeading}>Your Boat Trips</h1>
          <Row gap="var(--space-3)" className={styles.formColumn}>
            <UnifiedSearchingForm
              variant="embedded"
              initialTab="local-boat"
              className={styles.bookingForm}
            />
          </Row>
        </Column>
      </Section>

      {/* Cart Section - "Your Selection" - Above results */}
      <Section id="cart-section" className={styles.cartSection}>
        <Row gap="var(--space-3)" fullWidth className={styles.cartColumn}>
          <Suspense
            fallback={
              <div className={styles.cartLoading}>Loading cart...</div>
            }
          >
            <BoatCartContent />
          </Suspense>
        </Row>
      </Section>

      {/* Search Results Section - Ferry Services */}
      <Section
        id="search-results"
        aria-labelledby="search-results-content"
        className={styles.contentArea}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <BoatPageTitle />
        </Suspense>
        <Suspense
          fallback={
            <div className={styles.loadingFallback}>
              <div className={styles.spinner} />
              <p>Loading your boat search...</p>
            </div>
          }
        >
          <BoatSearchContent initialSearchParams={initialSearchParams} />
        </Suspense>
      </Section>
    </main>
  );
}
