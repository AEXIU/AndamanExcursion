"use client";

import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";
import styles from "./Textarea.module.css";
import type { TextareaProps } from "./Textarea.types";
import { cn } from "@/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      name,
      control,
      label,
      placeholder,
      required = false,
      disabled = false,
      className = "",
      rows = 1,
      hasError = false,
    },
    ref
  ) => {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div
            className={cn(
              styles.textareaWrapper,
              {
                [styles.error]: error || hasError,
              },
              className
            )}
            onClick={() => {
              const textareaElement = document.getElementById(name);
              if (textareaElement) {
                textareaElement.focus();
              }
            }}
          >
            {label && (
              <label htmlFor={name} className={styles.label}>
                {label} {required && <span className={styles.required}>*</span>}
              </label>
            )}
            <textarea
              {...field}
              ref={ref}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              className={styles.textarea}
              rows={rows}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? `${name}-error` : undefined}
            />
            {error && (
              <p
                id={`${name}-error`}
                className={styles.errorMessage}
                role="alert"
              >
                {error.message}
              </p>
            )}
          </div>
        )}
      />
    );
  }
);

Textarea.displayName = "Textarea";
