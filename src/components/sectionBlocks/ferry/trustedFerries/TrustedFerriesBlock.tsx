import React from "react";
import { Section, Column, Row } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { SmallCard } from "@/components/molecules/Cards";
import { Media } from "@payload-types";

interface TrustedFerriesBlockProps {
  content: {
    title?: string;
    specialWord?: string;
    description?: string;
    ferries?: Array<{
      image: Media;
      imageAlt: string;
      title: string;
      price: string;
      rating: number;
      href: string;
    }>;
  };
}

export const TrustedFerriesBlock = ({ content }: TrustedFerriesBlockProps) => {
  const {
    title = "Our Most Trusted Ferries",
    specialWord = "Trusted Ferries",
    description,
    ferries = [],
  } = content;

  return (
    <Section id="trusted-ferries" aria-labelledby="trusted-ferries-title">
      <Column
        gap="var(--space-10)"
        fullWidth
        responsive
        responsiveGap="var(--space-4)"
        responsiveAlignItems="start"
      >
        <Row
          justifyContent="between"
          alignItems="center"
          gap="var(--space-4)"
          fullWidth
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <SectionTitle
            specialWord={specialWord}
            text={title}
            id="trusted-ferries-title"
          />
        </Row>

        {description && <p>{description}</p>}

        {/* Ferry cards */}
        <Row
          gap="var(--space-8)"
          justifyContent="between"
          wrap
          fullWidth
          responsive
          responsiveGap="var(--space-4)"
        >
          {ferries.map((ferry, index) => (
            <SmallCard
              key={index}
              image={ferry.image}
              imageAlt={ferry.imageAlt}
              title={ferry.title}
              rating={ferry.rating}
              price={ferry.price}
              href={ferry.href}
            />
          ))}
        </Row>
      </Column>
    </Section>
  );
};
