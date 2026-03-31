export interface SectionTitleProps {
  text: string;
  className?: string;
  specialWord?: string;
  id?: string;
  headingLevel?: "h1" | "h2"; // New prop for heading level
  titleTextClasses?: string; // New prop for title text classes
  specialWordStyles?: string; // New prop for special word styles
}
