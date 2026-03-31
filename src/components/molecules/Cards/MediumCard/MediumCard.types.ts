import { Media } from "@payload-types";
import { ReactNode } from "react";

export interface BaseCardProps {
  image: Media;
  imageAlt: string;
  title: string;
}

export interface MediumCardProps extends BaseCardProps {
  badge?: string;
  badgeIcon?: ReactNode;
  description: string;
  href?: string;
  className?: string;
}
