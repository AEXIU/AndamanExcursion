export interface WhyChooseUsProps {
  content: WhyChooseUsContent;
}

export interface WhyChooseUsContent {
  title: string;
  specialWord: string;
  description: string;
  points: WhyChooseUsPoint[];
  image: string;
  imageAlt: string;
  ctaHref: string;
  ctaText: string;
}

export interface WhyChooseUsPoint {
  id: number;
  title: string;
  description: string;
}
