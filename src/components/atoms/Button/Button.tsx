import React from "react";
import styles from "./Button.module.css";
import type { ButtonProps } from "./Button.types";
import { MoveRight } from "lucide-react";
import Link from "next/link";

export const Button = ({
  children,
  onClick,
  className,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  showArrow = false,
  href,
  target = "_self",
  ariaLabel,
  icon,
  loading = false,
}: ButtonProps) => {
  const buttonClasses = [
    styles.button,
    styles[variant] || styles.primary,
    styles[size] || styles.medium,
    disabled ? styles.disabled : "",
    loading ? styles.loading : "",
    className || "",
  ]
    .join(" ")
    .trim();

  const content = (
    <>
      {loading ? (
        <span className={styles.loading}>
          <span className={styles.spinner}></span>
          Processing...
        </span>
      ) : (
        <>
          {children}
          {showArrow && (
            <span className={styles.icon}>
              <MoveRight size={16} aria-hidden="true" />
            </span>
          )}
          {icon && <span className={styles.icon}>{icon}</span>}
        </>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
};
