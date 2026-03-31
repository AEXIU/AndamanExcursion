import { FAQItem } from "@/components/molecules/FAQContainer/FAQContainer.types";

export interface FAQProps {
  content: FAQContent;
}

export interface FAQContent {
  title: string;
  specialWord?: string;
  items: FAQItem[];
}
