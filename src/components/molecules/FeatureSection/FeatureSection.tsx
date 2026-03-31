import React from "react";
import { Section } from "@/components/layout";
import {
  Button,
  DecorativeCurlyArrow,
  DescriptionText,
  SectionTitle,
} from "@/components/atoms";
import styles from "./FeatureSection.module.css";
import { Media } from "@payload-types";
import MediaContainer from "@/components/atoms/MediaContainer/MediaContainer";

export interface FeatureSectionContent {
  title: string;
  specialWord: string;
  description: string;
  image: Media;
  imageAlt: string;
  ctaText: string;
  ctaHref?: string;
}

interface FeatureSectionProps {
  content: FeatureSectionContent;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({ content }) => {
  const { title, specialWord, description, image, imageAlt, ctaText, ctaHref } =
    content;

  return (
    <Section fullBleed className={styles.waveContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.textContent}>
          <SectionTitle text={title} specialWord={specialWord} />
          <DecorativeCurlyArrow top="0%" left="70%" scale={1.2} />
          <DescriptionText text={description} className={styles.description} />
          <Button showArrow href={ctaHref}>
            {ctaText}
          </Button>
        </div>
        <div className={styles.imageContainer}>
          <MediaContainer
            src={image}
            alt={imageAlt || image?.alt}
            aspectRatio="video"
            priority
            fullWidth
            className={styles.image}
          />
        </div>
      </div>
    </Section>
  );
};
