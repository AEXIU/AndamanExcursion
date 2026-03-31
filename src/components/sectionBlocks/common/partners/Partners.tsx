import React from "react";
import { Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { PartnerIteration, PartnersProps } from "./Partners.types";
import styles from "./Partners.module.css";
import { IconContainer } from "@/components/atoms/IconContainer/IconContainer";

export const Partners = ({ content }: PartnersProps) => {
  const { title, specialWord, partners } = content;

  return (
    <Section id="partners" aria-labelledby="partners-title">
      <div className={styles.partnersContainer}>
        <SectionTitle
          text={title}
          specialWord={specialWord}
          id="partners-title"
        />
        <div className={styles.partnersWrapper}>
          <div className={styles.partnersGrid}>
            {partners.map((partner: PartnerIteration, index) => (
              <div key={index} className={styles.partnerLogo}>
                <IconContainer
                  src={partner.partner.url as string}
                  alt={`${partner.alt[index]} - Partner logo`}
                  size={150}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
