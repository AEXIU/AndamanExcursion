export interface BlogCardProps {
  title: string;
  description: string;
  category?: string;
  date?: string;
  image: {
    src: string;
    alt: string;
  };
  href?: string;
  className?: string;
}
