"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import { HiddenGemsProps } from "./HiddenGems.types";
import Link from "next/link";
import { Section } from "@/components/layout";
import styles from "./HiddenGems.module.css";
import DecorativeCurlyArrow from "@/components/atoms/DecorativeCurlyArrow/DecorativeCurlyArrow";
import { cn } from "@/utils/cn";

export const HiddenGems = ({ content }: HiddenGemsProps) => {
  const { title, specialWord, description, ctaText, ctaHref, images } = content;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderView, setIsSliderView] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  // Check if we should show slider view
  useEffect(() => {
    const checkSliderView = () => setIsSliderView(window.innerWidth < 1200);

    checkSliderView();
    window.addEventListener("resize", checkSliderView);
    return () => window.removeEventListener("resize", checkSliderView);
  }, []);

  // Auto-play functionality for slider
  useEffect(() => {
    if (!isSliderView || isDragging) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isSliderView, images.length, isDragging]);

  // Navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Touch/Mouse drag handlers
  const handleStart = useCallback(
    (clientX: number) => {
      if (!isSliderView) return;
      setIsDragging(true);
      startXRef.current = clientX;
      currentXRef.current = clientX;
    },
    [isSliderView]
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      currentXRef.current = clientX;
    },
    [isDragging]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const deltaX = currentXRef.current - startXRef.current;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setIsDragging(false);
  }, [isDragging, nextSlide, prevSlide]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  return (
    <Section
      backgroundColor="light"
      fullBleed
      className={styles.hiddenGemsSection}
      id="hidden-gems"
      aria-labelledby="hidden-gems-title"
    >
      <div className={styles.container}>
        <div className={styles.contentColumn}>
          <SectionTitle
            text={title}
            specialWord={specialWord}
            className={styles.sectionTitle}
            id="hidden-gems-title"
          />
          <DecorativeCurlyArrow top="20%" left="65%" />
          <DescriptionText text={description} />
          <Link href={ctaHref}>
            <Button showArrow>{ctaText}</Button>
          </Link>
        </div>

        {isSliderView ? (
          // Slider view for < 1200px
          <div className={styles.sliderContainer}>
            <div
              ref={sliderRef}
              className={styles.slider}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.slide} ${
                    index === currentSlide ? styles.activeSlide : ""
                  }`}
                >
                  <ImageContainer
                    src={image.image}
                    alt={image.alt}
                    className={styles.sliderImage}
                    fullWidth
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            <div className={styles.sliderControls}>
              <div className={styles.indicators}>
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.indicator} ${
                      index === currentSlide ? styles.activeIndicator : ""
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Grid view for >= 1200px
          <div className={styles.imagesGrid}>
            {images.map((image, index) => (
              <ImageContainer
                key={index}
                src={image.image}
                alt={image.alt}
                className={cn(
                  styles.gridImage,
                  styles[`gridImage${index + 1}`]
                )}
                fullWidth
                priority
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};
