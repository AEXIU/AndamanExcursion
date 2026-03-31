import { Media } from "@payload-types";

export interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
  avatar?: Media;
  avatarAlt?: string;
  rating: number;
  className?: string;
}
