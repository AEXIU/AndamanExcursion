export interface Activity {
  id: string;
  name: string;
  slug: string;
  value: string;
  label: string;
}

export interface ActivitySelectProps {
  value: string;
  onChange: (...event: any[]) => void;
  options: Activity[];
  className?: string;
  hasError?: boolean;
  placeholder?: string;
}
