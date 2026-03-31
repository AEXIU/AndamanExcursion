import React from "react";
import { TopAdventuresProps } from "./TopAdventures.types";
import styles from "./TopAdventures.module.css";
import { Heart, Star } from "lucide-react";
import { Column, Row, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { MediumCard } from "@/components/molecules/Cards";

export function TopAdventures({ content }: TopAdventuresProps) {
  const { title, specialWord, adventures } = content;

  return (
    <Section id="loved-adventures" aria-labelledby="loved-adventures-title">
      <Row fullWidth>
        <Column
          fullWidth
          gap="var(--space-12)"
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-4)"
        >
          <SectionTitle
            text={title}
            specialWord={specialWord}
            className={styles.sectionTitle}
            id="loved-adventures-title"
          />
          <Row
            gap="var(--space-6)"
            fullWidth
            responsive
            responsiveAlignItems="start"
            responsiveGap="var(--space-4)"
          >
            {adventures.map((adventure, index) => (
              <MediumCard
                key={index}
                badge={adventure.badgeLabel}
                badgeIcon={
                  adventure.badgeIcon === "Star" ? (
                    <Star
                      fill="var(--color-black)"
                      stroke="var(--color-black)"
                      aria-hidden="true"
                    />
                  ) : adventure.badgeIcon === "Heart" ? (
                    <Heart
                      fill="var(--color-black)"
                      stroke="var(--color-black)"
                      aria-hidden="true"
                    />
                  ) : null
                }
                title={adventure.title}
                description={adventure.description}
                image={adventure.image}
                imageAlt={adventure.imageAlt}
                href={adventure.href}
              />
            ))}
          </Row>
        </Column>
      </Row>
    </Section>
  );
}
