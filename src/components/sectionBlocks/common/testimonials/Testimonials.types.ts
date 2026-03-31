import { Media } from "@payload-types";
import { ReactNode } from "react";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

export interface TestimonialsProps extends BaseSectionProps {
  content: TestimonialsContent;
}

export interface TestimonialItem {
  id: number;
  text: string;
  author: string;
  avatar: Media;
  rotation: number;
}

export interface TestimonialsContent {
  title: string;
  specialWord: string;
  subtitle: string;
  testimonials: TestimonialItem[];
}
