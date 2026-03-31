"use client";

import React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/atoms/Button/Button";
import type { AlertDialogProps } from "./AlertDialog.types";
import styles from "./AlertDialog.module.css";

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  cancelLabel = "Cancel",
  actionLabel = "Continue",
  onCancel,
  onAction,
  variant = "default",
  showOnlyAction = false,
}) => {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={styles.overlay} />
        <AlertDialogPrimitive.Content className={styles.content}>
          <AlertDialogPrimitive.Title className={styles.title}>
            {title}
          </AlertDialogPrimitive.Title>
          {description && (
            <AlertDialogPrimitive.Description className={styles.description}>
              {description}
            </AlertDialogPrimitive.Description>
          )}
          <div className={styles.actions}>
            {showOnlyAction ? (
              <AlertDialogPrimitive.Action asChild>
                <Button
                  variant="primary"
                  onClick={onAction}
                  className={styles.actionButton}
                >
                  {actionLabel === "Continue" ? "Got it" : actionLabel}
                </Button>
              </AlertDialogPrimitive.Action>
            ) : (
              <>
                <AlertDialogPrimitive.Cancel asChild>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className={styles.cancelButton}
                  >
                    {cancelLabel}
                  </Button>
                </AlertDialogPrimitive.Cancel>
                <AlertDialogPrimitive.Action asChild>
                  <Button
                    variant={variant === "destructive" ? "primary" : "primary"}
                    onClick={onAction}
                    className={styles.actionButton}
                  >
                    {actionLabel}
                  </Button>
                </AlertDialogPrimitive.Action>
              </>
            )}
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};
