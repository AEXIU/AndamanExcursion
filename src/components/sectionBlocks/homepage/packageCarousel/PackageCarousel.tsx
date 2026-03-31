import { DescriptionText, SectionTitle } from "@/components/atoms";

import React from "react";
import styles from "./PackageCarousel.module.css";
import { Column, Row, Section } from "@/components/layout";
import { Carousel } from "@/components/molecules/Carousel/Carousel";
import { PackageCarouselProps } from "./PackageCarousel.types";

export const PackageCarousel = ({ content }: PackageCarouselProps) => {
  const { title, description, slides } = content;

  return (
    <Section
      className={styles.packageCarouselSection}
      id="package-carousel"
      aria-labelledby="package-carousel-title"
    >
      <Column
        fullWidth
        gap="var(--space-10)"
        responsive
        responsiveAlignItems="start"
        responsiveGap="var(--space-4)"
      >
        <Row
          fullWidth
          justifyContent="between"
          gap={2}
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-4)"
          className={styles.packageCarouselRow}
        >
          <SectionTitle
            specialWord={title ? title.split(" ")[0] : "Package"}
            text={title}
            id="package-carousel-title"
          />
          <DescriptionText text={description} align="right" />
        </Row>
        <Row fullWidth>
          <Carousel slides={slides} />
        </Row>
      </Column>
    </Section>
  );
};
