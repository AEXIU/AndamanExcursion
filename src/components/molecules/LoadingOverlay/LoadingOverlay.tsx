"use client";

import React from "react";
import { createPortal } from "react-dom";
import LoadingCard from "../Cards/ComponentStateCards/LoadingCard";
import styles from "./LoadingOverlay.module.css";

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title = "Processing Payment",
  message = "Please wait while we process your booking...",
  className,
}) => {
  if (!isVisible) return null;

  // Only render on client side to avoid hydration issues
  if (typeof window === "undefined") return null;

  return createPortal(
    <div className={`${styles.overlay} ${className || ""}`}>
      <div className={styles.content}>
        <div className={styles.loadingContainer}>
          <LoadingCard text="" />
        </div>
        <div className={styles.textContent}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
          {/* <div className={styles.progressDots}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div> */}
        </div>
      </div>
    </div>,
    document.body
  );
};
