import { Media } from "@payload-types";

export interface VideoContainerProps {
  src: string | Media;
  alt: string;
  className?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "21/9" | "auto";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  priority?: boolean;
  fullWidth?: boolean;

  // Video-specific props
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string | Media;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";

  // Sizing options
  width?: number;
  height?: number;
  fixedSize?: boolean;

  // Event handlers
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
}
