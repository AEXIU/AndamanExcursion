"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { CarouselProps } from "./Carousel.types";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import styles from "./Carousel.module.css";
import { ImageContainer, InlineLink } from "@/components/atoms";

export const Carousel = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Simple mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") prevSlide();
      if (event.key === "ArrowRight") nextSlide();
    },
    [prevSlide, nextSlide]
  );

  return (
    <div
      className={styles.carouselContainer}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      <div className={styles.carouselWrapper}>
        <div
          className={styles.slidesContainer}
          role="tabpanel"
          aria-live="polite"
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${
                index === currentSlide ? styles.activeSlide : ""
              }`}
              aria-hidden={index !== currentSlide}
              role="tabpanel"
              aria-label={`Slide ${index + 1} of ${slides.length}: ${
                slide.title
              }`}
            >
              <div className={styles.contentWrapper}>
                <div className={styles.textContent}>
                  <h2 className={styles.slideTitle}>{slide.title}</h2>
                  <p className={styles.slidePrice}>{slide.price}</p>
                  <p className={styles.slideDescription}>{slide.description}</p>

                  <div className={styles.viewMoreWrapper}>
                    <InlineLink href={slide.ctaLink || `/packages/${slide.id}`}>
                      {slide.ctaLabel || "View More"}
                    </InlineLink>
                  </div>
                </div>

                <div className={styles.imageWrapper}>
                  <div className={styles.starIconTop} aria-hidden="true">
                    <Star
                      size={24}
                      fill="var(--color-secondary)"
                      stroke="none"
                    />
                  </div>
                  <ImageContainer
                    src={slide.image}
                    alt={slide.image?.alt || `${slide.title} package image`}
                    className={styles.slideImage}
                    priority={index === 0}
                  />
                  <div className={styles.starIconBottom} aria-hidden="true">
                    <Star size={24} fill="#EBF3FF" stroke="none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.carouselControls}>
        <div className={styles.indicators} role="tablist">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentSlide ? styles.activeIndicator : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentSlide}
              role="tab"
            />
          ))}
        </div>

        <div className={styles.navigationButtons}>
          <button
            className={styles.navButton}
            onClick={prevSlide}
            aria-label="Go to previous slide"
            type="button"
          >
            <ArrowLeft stroke="var(--color-primary)" size={24} />
          </button>
          <button
            className={styles.navButton}
            onClick={nextSlide}
            aria-label="Go to next slide"
            type="button"
          >
            <ArrowRight stroke="var(--color-primary)" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
