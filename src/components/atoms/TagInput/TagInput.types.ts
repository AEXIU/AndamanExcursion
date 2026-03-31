export interface TagInputProps {
  tags: string[];
  defaultTags?: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  placeholder?: string;
  maxTags?: number;
}
