"use client";
import React from "react";
import { Controller, FieldValues } from "react-hook-form";
import * as Label from "@radix-ui/react-label";
import styles from "./Input.module.css";
import type { InputProps } from "./Input.types";
import { cn } from "@/utils/cn";

// Add error message prop to the interface
interface InputPropsWithError<T extends FieldValues = FieldValues>
  extends InputProps<T> {
  errorMessage?: string;
}

export const Input = <T extends FieldValues = FieldValues>(
  props: InputPropsWithError<T>
) => {
  const {
    name,
    control,
    label,
    placeholder,
    type = "text",
    required = false,
    disabled = false,
    className = "",
    min,
    max,
    hasError = false,
    errorMessage,
  } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={styles.fieldContainer}>
          <div
            className={cn(
              styles.inputWrapper,
              {
                [styles.error]: error || hasError,
              },
              className
            )}
            onClick={() => {
              const inputElement = document.getElementById(name);
              if (inputElement) {
                inputElement.focus();
              }
            }}
          >
            {label && (
              <Label.Root htmlFor={name} className={styles.label}>
                {label}
                {required && <span className={styles.required}>*</span>}
              </Label.Root>
            )}
            <input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={styles.input}
              min={min}
              max={max}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? `${name}-error` : undefined}
            />
            {/* Inline error message inside the border */}
            {(error || (hasError && errorMessage)) && (
              <p
                id={`${name}-error`}
                className={styles.errorMessage}
                role="alert"
              >
                {error?.message || errorMessage}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
};

Input.displayName = "Input";
