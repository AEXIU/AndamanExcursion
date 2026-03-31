import { DescriptionText, ImageContainer } from "@/components/atoms";
import { Section } from "@/components/layout";
import React from "react";
import styles from "./SecondaryBanner.module.css";
import { Media } from "@payload-types";
import { cn } from "@/utils/cn";

interface SecondaryBannerProps {
  title: string;
  subtitle: string;
  description: string;
  image: Media;
}

export const SecondaryBanner = ({
  content,
}: {
  content: SecondaryBannerProps;
}) => {
  const hasDescription = content.description;

  return (
    <Section className={styles.section}>
      <div className={styles.contentContainer}>
        <div className={styles.titleContainer}>
          <h1
            className={
              hasDescription
                ? styles.title
                : cn(styles.highlight, styles.controlledLineHeight)
            }
          >
            {content.title} <br />
            <span className={hasDescription ? styles.highlight : styles.title}>
              {content.subtitle}
            </span>
          </h1>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <ImageContainer
          src={content.image}
          alt={content.image.alt}
          aspectRatio="banner"
          className={styles.image}
          priority
          fullWidth
        />
      </div>
      {hasDescription && (
        <DescriptionText
          text={content.description}
          className={styles.description}
        />
      )}
    </Section>
  );
};
