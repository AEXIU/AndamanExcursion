export interface PassengerCount {
  adults: number;
  children: number;
  infants?: number; // Optional for backward compatibility
}

export interface PassengerCounterProps {
  value: PassengerCount;
  onChange: (type: keyof PassengerCount, value: number) => void;
  className?: string;
  hasError?: boolean;
  errorMessage?: string;
  label?: string;
}
