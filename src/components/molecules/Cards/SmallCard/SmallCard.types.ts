import { Media } from "@payload-types";

export interface BaseCardProps {
  image: Media;
  imageAlt?: string;
  title: string;
}

export interface SmallCardProps extends BaseCardProps {
  description?: string;
  duration?: string;
  price?: string | number;
  href?: string;
  rating?: number;
  priority?: boolean;
  variant?: "default" | "member";
}
