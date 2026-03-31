import React from "react";
import styles from "./Section.module.css";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  backgroundColor?: "white" | "light" | "primary" | "secondary" | "transparent";
  spacing?: "0" | "4" | "5" | "10";
  noPadding?: boolean;
  fullBleed?: boolean;
  ariaLabelledby?: string;
}

export const Section = ({
  children,
  className = "",
  id,
  backgroundColor = "transparent",
  spacing = "0",
  noPadding = false,
  fullBleed = false,
  ariaLabelledby,
}: SectionProps) => {
  const sectionClasses = [
    styles.section,
    styles[`bg-${backgroundColor}`],
    styles[`spacing-${spacing}`],
    noPadding && styles.noPadding,
    fullBleed && styles.fullBleed,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <section
      className={sectionClasses}
      id={id}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </section>
  );
};
