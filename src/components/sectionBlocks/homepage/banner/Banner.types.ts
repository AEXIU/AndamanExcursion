import { ReactNode } from "react";
import { Media } from "@payload-types";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

export interface BannerProps extends BaseSectionProps {
  content: BannerContent;
}

export interface BannerContent {
  title?: string;
  subtitle?: string;
  description?: string;
  image: Media;
  // imageAlt: string;
  ctaText?: string;
  ctaHref?: string;
  blockName?: string | null | undefined;
  blockType: "hero";
  initialTab?: "ferry" | "local-boat" | "activities";
}
