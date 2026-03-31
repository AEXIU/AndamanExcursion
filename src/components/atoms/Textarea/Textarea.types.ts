import { Control } from "react-hook-form";

export interface TextareaProps {
  name: string;
  control: Control<any>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  hasError?: boolean;
}
