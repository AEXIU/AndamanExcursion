// pages/ferry/results/page.tsx - 2 COLUMN LAYOUT
"use client";
import React, { Suspense } from "react";
import { Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { FerryResults } from "./components/FerryResults";
import { SearchSummary } from "./components/SearchSummary";
// import { ServiceStatusDisplay } from "./components/ServiceStatusDisplay";
import { UnifiedSearchingForm } from "@/components/organisms";
import { useFerryFlow } from "@/hooks/queries/useFerryStore";
import { useTimeFiltering } from "@/hooks/ferrySearch/useTimeFiltering";
// import { useErrorHandling } from "@/hooks/ferrySearch/useErrorHandling";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import LoadingCard from "@/components/molecules/Cards/ComponentStateCards/LoadingCard";
import { useFerryStore } from "@/store";
import ferryGraphic from "@graphics/ferry_graphic.svg";
import Image from "next/image";

// Mock component for right sidebar
const RightSidebarContent = () => {
  return (
    <div className={styles.sidebarContainer}>
      {/* Travel Tips Card */}
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarCardImageContainer}>
          <Image
            className={styles.sidebarCardImage}
            src={ferryGraphic}
            alt="Ferry Graphic"
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.sidebarCardTitle}>
            The better way to travel islands
          </h3>
          <div className={styles.sidebarCardContent}>
            <ul className={styles.tipsList}>
              <li>
                <span className={styles.tipsListTitle}>
                  Sail Through Paradise
                </span>
                <span>Experience Andaman by sea.</span>
              </li>
              <li>
                <span className={styles.tipsListTitle}>Comfort on Waves</span>
                <span>Modern ferries, cozy journeys.</span>
              </li>
              <li>
                <span className={styles.tipsListTitle}>
                  Every Seat Has a View
                </span>
                <span>Blue waters all around.</span>
              </li>
              <li>
                <span className={styles.tipsListTitle}>
                  Your Island Hopping Partner
                </span>
                <span>From Port Blair to Havelock & beyond.</span>
              </li>
              <li>
                <span className={styles.tipsListTitle}>
                  The Journey Feels Like Escape
                </span>
                <span>Relax, capture, and cruise.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const FerryResultsContent = () => {
  const router = useRouter();

  const storeSearchParams = useFerryStore((state) => state.searchParams);
  const preferredTime = useFerryStore((state) => state.preferredTime);

  const {
    ferries: searchResults,
    searchErrors,
    isSearching: isLoading,
    searchError: error,
    refetchSearch,
    isPartialFailure,
    hasSearchParamsChanged,
  } = useFerryFlow({
    enableReactiveSearch: true,
    debounceMs: 1500,
  });

  const { filteredResults } = useTimeFiltering(searchResults || []);

  // const { enhancedError, handleRetry } = useErrorHandling(
  //   error,
  //   searchErrors,
  //   searchResults || [],
  //   isPartialFailure || false,
  //   refetchSearch
  // );

  // const handleNewSearch = () => {
  //   router.push("/ferry");
  // };

  const getTimingDisplay = () => {
    if (!preferredTime) return "Any Time";

    switch (preferredTime) {
      case "0600-1200":
        return "Morning";
      case "1200-1800":
        return "Afternoon";
      case "1800-2359":
        return "Evening";
      default:
        return "Any Time";
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Modify Search Section - Full Width Row */}
      <div className={styles.modifySearchSection}>
        <SectionTitle text="Modify Search" specialWord="Search" />
        <UnifiedSearchingForm
          variant="embedded"
          className={styles.bookingForm}
          enableReactiveSearch={true}
          showManualSearch={false}
        />
        {hasSearchParamsChanged && (
          <div className={styles.searchingIndicator}>Updating results...</div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className={styles.pageContainer}>
        {/* Left Column - Main Content */}
        <div className={styles.mainColumn}>
          {/* Search Summary with timing preference */}
          <div className={styles.searchSummaryWrapper}>
            <SearchSummary
              loading={isLoading}
              ferryCount={filteredResults.length}
              searchParams={storeSearchParams}
            />
            {preferredTime && (
              <div className={styles.filterSummary}>
                Showing {getTimingDisplay()} departures •{" "}
                {filteredResults.length} ferries found
              </div>
            )}
          </div>

          {/* Service Status */}
          {/* <ServiceStatusDisplay
            searchErrors={searchErrors}
            isPartialFailure={isPartialFailure || false}
            isLoading={isLoading}
            searchResultsCount={searchResults?.length || 0}
            onRetry={handleRetry}
            onNewSearch={handleNewSearch}
          /> */}

          {/* Results */}
          <FerryResults loading={isLoading} results={filteredResults} />
        </div>

        {/* Right Column - Sidebar */}
        <div className={styles.sidebarColumn}>
          <RightSidebarContent />
        </div>
      </div>
    </div>
  );
};

const FerryResultsLoader = () => (
  <div className={styles.pageLoader}>
    <LoadingCard />
  </div>
);

export default function FerryResultsPage() {
  return (
    <Section className={styles.ferryResultsPage}>
      <Suspense fallback={<FerryResultsLoader />}>
        <FerryResultsContent />
      </Suspense>
    </Section>
  );
}
