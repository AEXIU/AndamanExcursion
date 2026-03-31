export interface AlertDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when the open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * The title of the alert dialog
   */
  title?: string;

  /**
   * The description/message of the alert dialog
   */
  description?: string;

  /**
   * Label for the cancel button
   */
  cancelLabel?: string;

  /**
   * Label for the action button
   */
  actionLabel?: string;

  /**
   * Callback when cancel is clicked
   */
  onCancel: () => void;

  /**
   * Callback when action is clicked
   */
  onAction: () => void;

  /**
   * Visual variant of the action button
   */
  variant?: "default" | "destructive";

  /**
   * Whether to show only the action button (for informational dialogs)
   */
  showOnlyAction?: boolean;
}
