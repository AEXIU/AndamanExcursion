export interface LargeCardSectionProps {
  content: LargeCardSectionContent;
}

export interface LargeCardSectionContent {
  subtitle?: string;
  title: string;
  image: string;
  imageAlt: string;
  ctaText: string;
  ctaHref: string;
}
