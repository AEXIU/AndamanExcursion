export interface HoverExpandCardProps {
  subtitle: string;
  title: string;
  image: string;
  imageAlt: string;
  className?: string;
  isExpanded?: boolean;
  onHover?: () => void;
  dataPosition?: number;
  style?: React.CSSProperties;
}
