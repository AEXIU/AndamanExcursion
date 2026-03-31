export interface BaseCardProps {
  image: string;
  imageAlt: string;
  title: string;
}

export interface LargeCardProps extends BaseCardProps {
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}
