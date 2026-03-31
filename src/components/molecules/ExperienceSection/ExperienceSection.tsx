import React from "react";
import { Container, Row, Section } from "@/components/layout";
import { DescriptionText, SectionTitle } from "@/components/atoms";
import { FeatureCard } from "@/components/molecules/Cards/FeatureCard/FeatureCard";
import styles from "./ExperienceSection.module.css";
import Image from "next/image";
import stepsWave from "@public/graphics/stepsWave.svg";
import { Media } from "@payload-types";

export interface ExperienceSectionContent {
  title: string;
  specialWord: string;
  description: string;
  cards: ExperienceCard[];
}

interface ExperienceCard {
  title: string;
  description: string;
  icon: Media;
}

export const ExperienceSection: React.FC<{
  content: ExperienceSectionContent;
}> = ({ content }) => {
  return (
    <Section
      fullBleed
      id="experience"
      className={styles.experience}
      aria-labelledby="experience-title"
    >
      <Image
        src={stepsWave}
        alt="dotted decorative wave"
        fill
        aria-hidden="true"
        className={styles.dottedWave}
      />
      <Container className={styles.experienceContainer}>
        <Row
          fullWidth
          gap={3}
          alignItems="start"
          justifyContent="between"
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <SectionTitle
            text={content.title}
            specialWord={content.specialWord}
          />
          <DescriptionText
            align="right"
            text={content.description}
            className={styles.description}
          />
        </Row>
        <Row
          gap="var(--space-4)"
          justifyContent="between"
          alignItems="start"
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          {content.cards.map((card) => (
            <FeatureCard
              key={card.title}
              className={styles.featureCard}
              {...card}
            />
          ))}
        </Row>
      </Container>
    </Section>
  );
};
