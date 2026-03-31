"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./BeforeUnloadModal.module.css";

interface BeforeUnloadModalProps {
  isVisible: boolean;
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  message?: string;
  showOnlyStayButton?: boolean; // For informational modals where leaving isn't an option
  stayButtonLabel?: string; // Custom label for stay button
  leaveButtonLabel?: string; // Custom label for leave button
}

export const BeforeUnloadModal: React.FC<BeforeUnloadModalProps> = ({
  isVisible,
  onStay,
  onLeave,
  title = "Are you sure you want to leave?",
  message = "Your booking confirmation details will be lost if you leave this page. Make sure to save your booking ID and confirmation details.",
  showOnlyStayButton = false,
  stayButtonLabel = "Stay on Page",
  leaveButtonLabel = "Leave Page",
}) => {
  if (!isVisible) return null;

  // Only render on client side to avoid hydration issues
  if (typeof window === "undefined") return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            {showOnlyStayButton ? (
              <Button
                variant="primary"
                onClick={onStay}
                className={styles.stayButton}
              >
                {stayButtonLabel === "Stay on Page" ? "Got it" : stayButtonLabel}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onStay}
                  className={styles.stayButton}
                >
                  {stayButtonLabel}
                </Button>
                <Button
                  variant="primary"
                  onClick={onLeave}
                  className={styles.leaveButton}
                >
                  {leaveButtonLabel}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
