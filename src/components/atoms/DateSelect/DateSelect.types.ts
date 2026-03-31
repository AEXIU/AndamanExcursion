export interface DateSelectProps {
  selected: Date | string | number | null;
  onChange: (date: Date) => void;
  className?: string;
  hasError?: boolean;
  label?: string;
  /** Minimum days from today (0 = today allowed, 1 = tomorrow onwards) */
  minDaysFromNow?: number;
  /** Allow past dates (no minimum date restriction) */
  allowPastDates?: boolean;
}
