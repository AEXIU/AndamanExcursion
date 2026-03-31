"use client";
import React, { useState, useEffect, useCallback } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import styles from "./Select.module.css";
import { SelectProps } from "./Select.types";

// Add error message prop to the interface
interface SelectPropsWithError extends SelectProps {
  errorMessage?: string;
  required?: boolean;
}

export const Select = ({
  value,
  onChange,
  label,
  options,
  className,
  hasError,
  placeholder,
  errorMessage,
  required = false,
}: SelectPropsWithError) => {
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

  // Find the selected option name
  const selectedOption =
    options.find((opt) => opt.value === value)?.label || "";
  const displayText =
    selectedOption || placeholder || `Select ${label.toLowerCase()}`;

  return (
    <div className={styles.fieldContainer}>
      <SelectPrimitive.Root value={value} onValueChange={onChange} open={isOpen} onOpenChange={setIsOpen}>
        <SelectPrimitive.Trigger
          className={cn(
            styles.selectWrapper,
            className,
            hasError && styles.error
          )}
        >
          <span className={styles.selectLabel}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </span>
          <SelectPrimitive.Value
            placeholder={displayText}
            className={styles.selectValue}
          />
          <ChevronDown
            size={16}
            className={cn(styles.selectIcon, styles.textPrimary)}
          />
          {/* Inline error message inside the border */}
          {hasError && errorMessage && (
            <p className={styles.errorMessage} role="alert">
              {errorMessage}
            </p>
          )}
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={styles.selectContent}
            position="popper"
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={styles.selectItem}
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
};
