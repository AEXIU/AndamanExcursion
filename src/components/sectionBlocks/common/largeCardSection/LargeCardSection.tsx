import React from "react";
import type { LargeCardSectionProps } from "./LargeCardSection.types";
import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules/Cards";

export const LargeCardSection = ({ content }: LargeCardSectionProps) => {
  if (!content) return null;
  const { subtitle, title, image, imageAlt, ctaText, ctaHref } = content;

  return (
    <Section id="large-card-section" aria-label="Large Card Section">
      <LargeCard
        subtitle={subtitle}
        title={title}
        image={image}
        imageAlt={imageAlt}
        ctaText={ctaText}
        ctaHref={ctaHref}
      />
    </Section>
  );
};
