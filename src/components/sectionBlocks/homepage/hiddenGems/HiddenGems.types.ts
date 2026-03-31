import { Media } from "@payload-types";

export interface HiddenGemsProps {
  content: HiddenGemsContent;
}

export interface HiddenGemsImage {
  image: Media;
  alt: string;
}

export interface HiddenGemsContent {
  title: string;
  specialWord: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  images: HiddenGemsImage[];
}
