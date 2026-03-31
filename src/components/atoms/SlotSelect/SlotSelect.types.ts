export interface TimeSlot {
  id: string;
  time: string;
  slug: string;
  value: string;
  label: string;
}

export interface SlotSelectProps {
  value: string;
  placeholder?: string;
  onChange: (...event: any[]) => void;
  options: TimeSlot[];
  className?: string;
  hasError?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}
