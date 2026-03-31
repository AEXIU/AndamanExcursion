// Updated TimeFilters component - connected to store
import React, { memo, useCallback, useMemo } from "react";
import { Clock } from "lucide-react";
import { Chip } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import styles from "./TimeFilters.module.css";

export const TIME_FILTERS = [
  { id: "morning", text: "Morning", value: "0600-1200" },
  { id: "afternoon", text: "Afternoon", value: "1200-1800" },
  { id: "evening", text: "Evening", value: "1800-2359" },
];

// REMOVED: Props interface - now connects directly to store
interface TimeFiltersProps {
  // Optional: Allow overriding store behavior
  variant?: "store-connected" | "controlled";
  // Only needed for controlled variant (backward compatibility)
  timeFilter?: string | null;
  setTimeFilter?: (filter: string | null) => void;
}

const FilterChip = memo<{
  text: string;
  isSelected: boolean;
  onClick: () => void;
}>(({ text, isSelected, onClick }) => (
  <div
    className={`${styles.clickableChip} ${isSelected ? styles.selected : ""}`}
    onClick={onClick}
  >
    <Chip
      size="small"
      className={styles.timeFilterChip}
      iconComponent={<Clock size={16} />}
      text={text}
    />
  </div>
));
FilterChip.displayName = "FilterChip";

export const TimeFilters = memo<TimeFiltersProps>(
  ({
    variant = "store-connected",
    timeFilter: propTimeFilter,
    setTimeFilter: propSetTimeFilter,
  }) => {
    // NEW: Connect to store for timing state
    const storeTimeFilter = useFerryStore((state) => state.activeTimeFilter);
    const setActiveTimeFilter = useFerryStore(
      (state) => state.setActiveTimeFilter
    );

    // Choose source based on variant
    const activeTimeFilter =
      variant === "controlled" ? propTimeFilter : storeTimeFilter;
    const setTimeFilter =
      variant === "controlled" ? propSetTimeFilter : setActiveTimeFilter;

    const handleClearFilter = useCallback(() => {
      setTimeFilter?.(null);
    }, [setTimeFilter]);

    const createFilterHandler = useCallback(
      (value: string) => () => {
        setTimeFilter?.(value);
      },
      [setTimeFilter]
    );

    const filterChips = useMemo(() => {
      return TIME_FILTERS.map((filter) => {
        const isSelected = activeTimeFilter === filter.value;
        const onClick = createFilterHandler(filter.value);
        return (
          <FilterChip
            key={filter.id}
            text={filter.text}
            isSelected={isSelected}
            onClick={onClick}
          />
        );
      });
    }, [activeTimeFilter, createFilterHandler]);

    // NEW: Show current state info for debugging/UX
    const preferredTime = useFerryStore((state) => state.preferredTime);
    const showSyncIndicator =
      preferredTime && preferredTime !== activeTimeFilter;

    return (
      <div className={styles.timeFilters}>
        <div className={styles.filterHeader}>
          <span className={styles.filterLabel}>Filter by time:</span>
          {showSyncIndicator && (
            <span className={styles.syncIndicator}>
              (Based on your search preference)
            </span>
          )}
        </div>
        <div className={styles.chipContainer}>
          <FilterChip
            text="All Times"
            isSelected={!activeTimeFilter}
            onClick={handleClearFilter}
          />
          {filterChips}
        </div>
      </div>
    );
  }
);
TimeFilters.displayName = "TimeFilters";
