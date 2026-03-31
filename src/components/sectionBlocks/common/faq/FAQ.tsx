"use client";

import { Column, Row, Section } from "@/components/layout";
import React from "react";

import styles from "./FAQ.module.css";
import { FAQContainer } from "@/components/molecules/FAQContainer/FAQContainer";
import type { FAQProps } from "./FAQ.types";
import { DecorativeCurlyArrow, SectionTitle } from "@/components/atoms";

export const FAQ = ({ content }: FAQProps) => {
  if (!content) return null;
  const { title, specialWord, items } = content;

  return (
    <Section id="faq" aria-labelledby="faq-title">
      <Row wrap fullWidth justifyContent="between">
        <Column className={styles.titleColumn}>
          <SectionTitle text={title} specialWord={specialWord} id="faq-title" />
          <DecorativeCurlyArrow
            top="120px"
            left="75%"
            scale={2}
            rotation={210}
            flip
          />
        </Column>
        <Column className={styles.contentColumn} fullWidth>
          <FAQContainer items={items} />
        </Column>
      </Row>
    </Section>
  );
};
