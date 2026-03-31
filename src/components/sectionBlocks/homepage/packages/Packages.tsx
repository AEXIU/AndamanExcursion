import React from "react";
import { Section, Column, Row } from "@/components/layout";
import { SectionTitle, Button } from "@/components/atoms";
import { SmallCard } from "@/components/molecules/Cards";
import { PackagesProps, Package } from "./Packages.types";

export const Packages = ({ content }: PackagesProps) => {
  const { title, packages } = content;

  return (
    <Section id="packages" aria-labelledby="packages-title">
      <Column
        gap="var(--space-10)"
        fullWidth
        responsive
        responsiveAlignItems="start"
        responsiveGap="var(--space-4)"
      >
        <Row
          justifyContent="between"
          alignItems="center"
          gap="var(--space-4)"
          fullWidth
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-4)"
        >
          <SectionTitle
            specialWord="Packages"
            text={title}
            id="packages-title"
          />
          <Row justifyContent="end">
            <Button href="/packages" ariaLabel="View all packages" showArrow>
              View All
            </Button>
          </Row>
        </Row>

        {/* Package cards */}
        <Row
          gap="var(--space-8)"
          justifyContent="between"
          wrap
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-4)"
          fullWidth
        >
          {packages.length > 0 ? (
            packages.map((item: Package) => (
              <SmallCard
                key={item.id}
                image={item.image}
                imageAlt={`${item.title} package`}
                title={item.title}
                duration={item.duration}
                price={item.price}
                href={item.href || `/packages/all/${item.slug}`}
              />
            ))
          ) : (
            <div className="no-packages-message">
              <p>No featured packages available at the moment.</p>
            </div>
          )}
        </Row>
      </Column>
    </Section>
  );
};
