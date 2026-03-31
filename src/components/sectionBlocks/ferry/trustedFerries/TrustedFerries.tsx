import React from "react";
import { Section, Column, Row } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { SmallCard } from "@/components/molecules/Cards";
import { Media } from "@payload-types";

export interface TrustedFerriesContent {
  image: Media;
  imageAlt: string;
  title: string;
  price: string;
  rating: number;
  href: string;
}
export const TrustedFerries = ({
  content,
}: {
  content: TrustedFerriesContent[];
}) => {
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
            specialWord="Trusted Ferries"
            text="Our Most Trusted Ferries"
            id="trusted-ferries-title"
          />
        </Row>

        {/* Package cards */}
        <Row
          gap="var(--space-8)"
          justifyContent="between"
          wrap
          fullWidth
          responsive
          responsiveGap="var(--space-4)"
        >
          {content.map((item, index) => (
            <SmallCard
              key={index}
              image={item.image}
              imageAlt={item.imageAlt}
              title={item.title}
              rating={item.rating}
              price={item.price}
              href={item.href}
            />
          ))}
        </Row>
      </Column>
    </Section>
  );
};
