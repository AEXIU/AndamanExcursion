export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (...event: any[]) => void;
  label: string;
  options: SelectOption[];
  className?: string;
  hasError?: boolean;
  placeholder?: string;
}
