import { Media } from "@payload-types";
import { ReactNode } from "react";

export interface BaseSectionProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}
export interface TopAdventuresProps extends BaseSectionProps {
  content: TopAdventuresContent;
}

export interface TopAdventuresContent {
  title: string;
  specialWord: string;
  adventures: TopAdventure[];
}

export interface TopAdventure {
  title: string;
  description: string;
  image: Media;
  imageAlt: string;
  badgeLabel?: string;
  badgeIcon?: BadgeIconType;
  href: string;
}

export type BadgeIconType = "Star" | "Heart";
