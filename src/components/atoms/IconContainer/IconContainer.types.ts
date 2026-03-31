export interface IconContainerProps {
  src: string | { url: string } | null | undefined;
  alt: string;
  size?: number | "auto"; // Allow 'auto' for CSS-controlled sizing
  responsive?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}
