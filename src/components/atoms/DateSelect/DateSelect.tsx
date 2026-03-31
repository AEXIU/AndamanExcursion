"use client";
import React, { useRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./DateSelect.module.css";
import type { DateSelectProps } from "./DateSelect.types";
import { cn } from "@/utils/cn";

// Add error message prop to the interface
interface DateSelectPropsWithError extends DateSelectProps {
  errorMessage?: string;
  required?: boolean;
}

export const DateSelect = ({
  selected,
  onChange,
  className,
  hasError,
  label = "Date",
  errorMessage,
  required = true,
  minDaysFromNow = 0,
  allowPastDates = false,
}: DateSelectPropsWithError) => {
  // Create unique IDs for accessibility
  const labelId = React.useId();
  const inputId = React.useId();
  const errorId = React.useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const scrollHandlerRef = useRef<((e: Event) => void) | null>(null);

  // Close calendar immediately when the page is scrolled (but not for datepicker's own scrolls)
  useEffect(() => {
    // Clean up previous handler
    if (scrollHandlerRef.current) {
      window.removeEventListener("scroll", scrollHandlerRef.current, true);
      scrollHandlerRef.current = null;
    }

    if (!isCalendarOpen) return;

    // Small delay so the datepicker's own render events don't immediately close it
    const timerId = setTimeout(() => {
      const handler = (e: Event) => {
        const target = e.target as HTMLElement;
        // Ignore scroll events from within the datepicker itself
        if (target?.closest?.(".react-datepicker-popper") || target?.closest?.(".react-datepicker")) {
          return;
        }
        setIsCalendarOpen(false);
      };
      scrollHandlerRef.current = handler;
      window.addEventListener("scroll", handler, true);
    }, 100);

    return () => {
      clearTimeout(timerId);
      if (scrollHandlerRef.current) {
        window.removeEventListener("scroll", scrollHandlerRef.current, true);
        scrollHandlerRef.current = null;
      }
    };
  }, [isCalendarOpen]);

  // Calculate minimum date based on minDaysFromNow (null if allowPastDates is true)
  const minDate = React.useMemo(() => {
    if (allowPastDates) return null;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + minDaysFromNow);
    return date;
  }, [minDaysFromNow, allowPastDates]);

  // Ensure selected is a valid Date object or null
  const selectedDate =
    selected instanceof Date
      ? selected
      : selected
      ? new Date(selected)
      : null;

  // Prevent form submission when selecting a date
  const handleDateChange = (date: Date | null) => {
    if (date) {
      onChange(date);
    }
  };

  // Handle navigation to previous day
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setDate(newDate.getDate() - 1);
    // Only allow navigation if new date is >= minDate (or no minDate restriction)
    if (!minDate || newDate >= minDate) {
      onChange(newDate);
    }
  };

  // Check if previous day button should be disabled
  const isPreviousDayDisabled = React.useMemo(() => {
    if (!minDate) return false; // No restriction if allowPastDates is true
    const previousDay = new Date(selectedDate || new Date());
    previousDay.setDate(previousDay.getDate() - 1);
    previousDay.setHours(0, 0, 0, 0);
    return previousDay < minDate;
  }, [selectedDate, minDate]);

  // Handle navigation to next day
  const handleNextDay = () => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setDate(newDate.getDate() + 1);
    onChange(newDate);
  };

  return (
    <div className={styles.fieldContainer}>
      <div
        className={cn(
          styles.selectWrapper,
          className,
          hasError && styles.error
        )}
      >
        <label htmlFor={inputId} className={styles.selectLabel} id={labelId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
        <div className={styles.datePickerInner} ref={containerRef}>
          <button
            type="button"
            aria-label="Previous Day"
            className={styles.dateNavButton}
            onClick={handlePreviousDay}
            disabled={isPreviousDayDisabled}
          >
            <ChevronLeft color={isPreviousDayDisabled ? "var(--color-gray-400)" : "var(--color-primary)"} size={20} />
          </button>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="EEE, dd MMM yyyy"
            placeholderText="Select Date"
            minDate={minDate || undefined}
            className={styles.datePicker}
            id={inputId}
            aria-labelledby={labelId}
            aria-describedby={hasError && errorMessage ? errorId : undefined}
            aria-invalid={hasError ? "true" : "false"}
            popperClassName="react-datepicker-popper"
            popperPlacement="bottom-start"
            open={isCalendarOpen}
            onCalendarOpen={() => setIsCalendarOpen(true)}
            onCalendarClose={() => setIsCalendarOpen(false)}
            popperProps={{
              // Use absolute (not fixed) so the calendar escapes no stacking contexts.
              // The filter stacking context that was trapping position:fixed
              // has been removed from .unifiedSearchingForm.
              strategy: "absolute",
            }}
            onKeyDown={(e) => {
              // Prevent Enter key from submitting the form
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
          <button
            type="button"
            aria-label="Next Day"
            className={styles.dateNavButton}
            onClick={handleNextDay}
          >
            <ChevronRight color="var(--color-primary)" size={20} />
          </button>
        </div>
        {/* Inline error message inside the border */}
        {hasError && errorMessage && (
          <p className={styles.errorMessage} role="alert" id={errorId}>
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};
