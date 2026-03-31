import { Media } from "@payload-types";

export interface PackageCardProps {
  title: string;
  description: string;
  media: {
    heroImage: {
      image: string | Media;
      alt: string;
    };
    cardImages: {
      image: string | Media;
      alt: string;
    }[];
  };
  href?: string;
  className?: string;
}