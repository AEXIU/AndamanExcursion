import { Control, FieldPath, FieldValues } from "react-hook-form";

export interface PhoneInputProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  hasError?: boolean;
  errorMessage?: string;

  // NEW: Enhanced props for country code handling
  onCountryChange?: (countryCode: string, countryName: string) => void;
  defaultCountryCode?: string;
}
