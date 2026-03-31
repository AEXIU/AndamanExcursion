"use client";
import React, { useState, useEffect, useCallback } from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./LocationSelect.module.css";
import type { LocationSelectProps } from "./LocationSelect.types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

// Add error message prop to the interface
interface LocationSelectPropsWithError extends LocationSelectProps {
  errorMessage?: string;
}

export const LocationSelect = ({
  value,
  onChange,
  label,
  options,
  className,
  hasError,
  placeholder,
  errorMessage,
}: LocationSelectPropsWithError) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown immediately on scroll
  const handleScroll = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [isOpen, handleScroll]);

  // Find the selected location
  const selectedLocation = options.find(
    (loc) => loc.value === value || loc.slug === value || loc.id === value
  );
  const displayText =
    selectedLocation?.label || placeholder || "Select location";

  // Create unique ID for the label
  const labelId = React.useId();

  return (
    <div className={styles.fieldContainer}>
      <Select.Root value={value} onValueChange={onChange} open={isOpen} onOpenChange={setIsOpen}>
        <Select.Trigger
          className={cn(
            styles.selectWrapper,
            className,
            hasError && styles.error
          )}
          aria-labelledby={labelId}
          aria-describedby={
            hasError && errorMessage ? `${labelId}-error` : undefined
          }
        >
          <span className={styles.selectLabel} id={labelId}>
            {label}
            <span className={styles.required}>*</span>
          </span>
          <Select.Value
            placeholder={displayText}
            className={styles.selectValue}
          />
          <ChevronDown
            size={20}
            color="var(--color-primary)"
            className={cn(styles.selectIcon, styles.textPrimary)}
          />
          {/* Inline error message inside the border */}
          {hasError && errorMessage && (
            <p
              className={styles.errorMessage}
              role="alert"
              id={`${labelId}-error`}
            >
              {errorMessage}
            </p>
          )}
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className={styles.selectContent}
            position="popper"
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
          >
            <Select.Viewport>
              {options.map((location) => (
                <Select.Item
                  key={location.id}
                  value={location.value || location.slug || location.id}
                  className={styles.selectItem}
                >
                  <Select.ItemText>
                    {location.label || location.name}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};
