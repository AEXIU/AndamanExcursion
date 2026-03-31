"use client";
import React, { memo, useEffect, useState, useCallback } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import styles from "./SlotSelect.module.css";
import type { SlotSelectProps } from "./SlotSelect.types";
import { cn } from "@/utils/cn";

// Add error message prop to the interface
interface SlotSelectPropsWithError extends SlotSelectProps {
  errorMessage?: string;
  label?: string;
  optional?: boolean;
}

const SlotSelect = memo(
  ({
    value,
    onChange,
    options,
    className,
    hasError,
    placeholder,
    disabled = false,
    isLoading = false,
    errorMessage,
    label = "Slot",
    optional = false,
  }: SlotSelectPropsWithError) => {
    const isDisabled = disabled || isLoading;
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


    // Select first slot if value is empty and options exist (only if not disabled)
    useEffect(() => {
      if (!value && options.length > 0 && !isDisabled) {
        const firstSlot = options[0];
        onChange(firstSlot.value || firstSlot.slug || firstSlot.id);
      }
    }, [value, options, onChange, isDisabled]);

    // Find the selected slot
    const selectedSlot = options.find(
      (slot) => slot.value === value || slot.slug === value || slot.id === value
    );

    const displayText = isLoading
      ? "Loading time slots..."
      : selectedSlot
        ? selectedSlot.label || selectedSlot.time
        : placeholder || "Select a time slot";

    // Create unique ID for the label
    const labelId = React.useId();

    return (
      <div className={styles.fieldContainer}>
        <Select.Root
          value={value}
          onValueChange={onChange}
          disabled={isDisabled}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <Select.Trigger
            className={cn(
              styles.selectWrapper,
              className,
              hasError && styles.error,
              isDisabled && styles.disabled
            )}
            aria-labelledby={labelId}
            aria-describedby={
              hasError && errorMessage ? `${labelId}-error` : undefined
            }
            disabled={isDisabled}
          >
            <span className={styles.selectLabel} id={labelId}>
              {label}
              {!optional && <span className={styles.required}>*</span>}
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
                {options.map((slot) => (
                  <Select.Item
                    key={slot.id || slot.slug || slot.value}
                    value={slot.value || slot.slug || slot.id}
                    className={styles.selectItem}
                  >
                    <Select.ItemText>{slot.label || slot.time}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    );
  }
);

SlotSelect.displayName = "SlotSelect";

export { SlotSelect };
