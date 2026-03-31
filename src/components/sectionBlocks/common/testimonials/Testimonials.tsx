import React from "react";

import styles from "./Testimonials.module.css";
import googleIcon from "@public/icons/socials/google.svg";
import { SectionTitle, DecorativeCurlyArrow } from "@/components/atoms";
import type { TestimonialsProps } from "./Testimonials.types";
import { Column, Container, Section } from "@/components/layout";
import { TestimonialCard } from "@/components/molecules/Cards";
import { IconContainer } from "@/components/atoms/IconContainer/IconContainer";

export const Testimonials = ({ content }: TestimonialsProps) => {
  if (!content) return null;
  const { title, subtitle, testimonials, specialWord } = content;
  // Create a duplicate set of testimonials for the infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <Section
      className={styles.testimonialsSection}
      fullBleed
      id="testimonials"
      aria-labelledby="testimonials-title"
    >
      <Column gap={6} fullWidth className={styles.testimonialsContainer}>
        <Container className={styles.testimonialsHeaderContainer}>
          <Column gap={2}>
            <SectionTitle
              text={title}
              specialWord={specialWord}
              id="testimonials-title"
            />
            <DecorativeCurlyArrow
              top="10%"
              left="45%"
              scale={2}
              rotation={30}
            />
            <div className={styles.googleInfo}>
              <div className={styles.googleIcon}>
                <IconContainer
                  src={googleIcon}
                  size={20}
                  alt="Google"
                  aria-label="Google"
                />
              </div>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </Column>
        </Container>

        <div
          className={styles.carouselContainer}
          aria-label="Customer testimonials carousel"
        >
          <div className={styles.carousel}>
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.id}-${index}`}
                text={testimonial.text}
                author={testimonial.author}
                avatar={testimonial.avatar}
                rotation={testimonial.rotation}
              />
            ))}
          </div>
        </div>
      </Column>
    </Section>
  );
};
