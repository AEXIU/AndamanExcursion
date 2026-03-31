"use client";
import React from "react";
import { Section } from "@/components/layout";
import {
  DescriptionText,
  SectionTitle,
  Chip,
  InlineLink,
} from "@/components/atoms";
import MediaContainer from "@/components/atoms/MediaContainer/MediaContainer";
import styles from "./WhyChooseUs.module.css";
import { WhyChooseUsProps } from "./WhyChooseUs.types";

export const WhyChooseUs = ({ content }: WhyChooseUsProps) => {
  const {
    title,
    specialWord,
    description,
    points,
    ctaHref,
    ctaText,
    image,
    imageAlt,
  } = content;

  return (
    <Section
      className={styles.whyChooseUsSection}
      id="why-choose-us"
      aria-labelledby="why-choose-us-title"
    >
      <div className={styles.sectionContainer}>
        <div className={styles.headerRow}>
          <SectionTitle
            className={styles.sectionTitle}
            text={title}
            specialWord={specialWord}
            id="why-choose-us-title"
          />
          <DescriptionText
            text={description}
            align="right"
            className={styles.headerDescription}
          />
        </div>

        <div className={styles.contentRow}>
          <div className={styles.pointsColumn}>
            {points.map((item) => (
              <div key={item.id} className={styles.pointItem}>
                <h3 className={styles.pointTitle} id={`point-title-${item.id}`}>
                  {item.title}
                </h3>
                <p
                  className={styles.pointDescription}
                  aria-labelledby={`point-title-${item.id}`}
                >
                  {item.description}
                </p>
              </div>
            ))}
            <InlineLink
              href={ctaHref}
              ariaLabel={`${ctaText} about why choose Andaman Excursion`}
              icon="arrow-up-right"
              color="primary"
              className={styles.ctaLink}
            >
              {ctaText}
            </InlineLink>
          </div>

          <div className={styles.imageContainer}>
            <MediaContainer
              src={image}
              alt={imageAlt}
              className={styles.featureImage}
              objectFit="cover"
              priority
            />

            {/* Chips positioned relative to the image container */}
            <div className={styles.customerSatisfactionChip} aria-hidden="true">
              <Chip
                icon="/icons/misc/smilie.svg"
                text="Customer Satisfaction"
                className={styles.chip}
              />
            </div>

            <div className={styles.personalizedServiceChip} aria-hidden="true">
              <Chip
                icon="/icons/misc/star.svg"
                text="Personalized Service"
                className={styles.chip}
              />
            </div>

            <div className={styles.localExpertsChip} aria-hidden="true">
              <Chip
                icon="/icons/misc/crown.svg"
                text="Local Experts"
                className={styles.chip}
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
