export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQContainerProps {
  items: FAQItem[];
  className?: string;
}
