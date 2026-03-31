import { Media } from "@payload-types";

export interface PartnerIteration {
  partner: Media;
  alt: string;
}

export interface PartnersProps {
  content: PartnersContent;
}

export interface PartnersContent {
  title: string;
  specialWord: string;
  partners: PartnerIteration[];
}
