import { Media } from "@payload-types";

export interface CarouselSlide {
  id: number;
  title: string;
  price: string;
  description: string;
  image: Media;
  ctaLink?: string;
  ctaLabel?: string;
  // imageAlt: string;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export interface CarouselControlsProps {
  totalSlides: number;
  currentSlide: number;
  goToSlide: (index: number) => void;
  prevSlide: () => void;
  nextSlide: () => void;
}
