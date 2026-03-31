import { Media } from "@payload-types";

export interface PackagesProps {
  content: PackagesContent;
}

export interface PackagesContent {
  title: string;
  description: string;
  packages: Package[];
}

export interface Package {
  id: string;
  slug: string;
  title: string;
  description?: string;
  image: Media;
  price: string | number;
  duration: string;
  location?: string;
  href?: string;
}
