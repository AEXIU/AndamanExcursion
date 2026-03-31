// Grid.types.ts
export interface GridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  };
  gap?: number | string;
  minItemWidth?: string;
  style?: React.CSSProperties;
  role?: string;
  ariaLabel?: string;
}
