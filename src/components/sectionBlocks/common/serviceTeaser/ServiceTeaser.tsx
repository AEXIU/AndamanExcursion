import { Section } from "@/components/layout";
import { DescriptionText, SectionTitle } from "@/components/atoms";
import { DecorativeCurlyArrow, ImageContainer } from "@/components/atoms";
import { Button } from "@/components/atoms";
import React from "react";
import styles from "./ServiceTeaser.module.css";
import { Media } from "@payload-types";

interface ServiceTeaserProps {
  title: string;
  specialWord: string;
  description: string;
  image: Media;
  ctaText: string;
  ctaHref: string;
}

export const ServiceTeaser = ({ content }: { content: ServiceTeaserProps }) => {
  return (
    <Section fullBleed className={styles.waveContainer}>
      <div className={styles.contentContainer}>
        <SectionTitle
          className={styles.featureTitle}
          text={content.title}
          specialWord={content.specialWord}
          titleTextClasses={styles.title}
          specialWordStyles={styles.highlight}
        />
        <DecorativeCurlyArrow
          top="50%"
          left="20%"
          flip
          rotation={210}
          scale={1.5}
        />
        <div className={styles.imageContainer}>
          <ImageContainer
            src={content.image}
            alt={content.image.alt}
            aspectRatio="square"
            priority
            fullWidth
            className={styles.image}
          />
        </div>
        <div className={styles.content}>
          <DescriptionText
            text={content.description}
            className={styles.description}
          />
          <Button showArrow href={content.ctaHref}>
            {content.ctaText}
          </Button>
        </div>
      </div>
    </Section>
  );
};
