import { Control, FieldPath, FieldValues } from "react-hook-form";

export interface InputProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "number" | "tel" | "password";
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  hasError?: boolean;
}