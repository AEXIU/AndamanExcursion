import { Media } from "@payload-types";

export interface PackageCarouselProps {
  content: PackageCarouselContent;
}

export interface PackageCarouselContent {
  title: string;
  description: string;
  slides: PackageCarouselSlide[];
}

export interface PackageCarouselSlide {
  id: number;
  title: string;
  price: string;
  description: string;
  image: Media;
  // imageAlt: string;
}
