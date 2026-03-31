// ImageContainer.types.ts
import { Media } from "@payload-types";

export interface ImageContainerProps {
  src: string | Media | undefined | null;
  alt: string;
  className?: string;
  aspectRatio?:
    | "auto"
    | "square"
    | "video"
    | "portrait"
    | "landscape"
    | "banner";
  objectFit?: "cover" | "contain" | "fill";
  priority?: boolean;
  fullWidth?: boolean;
  decorative?: boolean;
  // Removed preferredSize - component now handles this intelligently
  width?: number;
  height?: number;
  fixedSize?: boolean;
}
