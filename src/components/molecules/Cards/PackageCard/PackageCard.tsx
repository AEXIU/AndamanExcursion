"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { PackageCardProps } from "./PackageCard.types";
import styles from "./PackageCard.module.css";
import Link from "next/link";
import clsx from "clsx";
import { ImageContainer, InlineLink } from "@/components/atoms";
import { cn } from "@/utils/cn";
import { MoveRightIcon } from "lucide-react";

export const PackageCard = ({
  title,
  description,
  media,
  href,
  className,
}: PackageCardProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = media?.cardImages?.length || 0;

  // Auto slide functionality
  const startAutoSlide = useCallback(() => {
    if (totalSlides <= 1) return;

    autoSlideRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
  }, [totalSlides]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [startAutoSlide, stopAutoSlide]);

  // Touch/Mouse event handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
    stopAutoSlide();
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderRef.current) return;

    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const threshold = 50;

    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      } else if (translateX < 0 && currentSlide < totalSlides - 1) {
        setCurrentSlide((prev) => prev + 1);
      }
    }

    setIsDragging(false);
    setTranslateX(0);

    setTimeout(startAutoSlide, 2000);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, translateX, startX]);

  const handleIndicatorClick = (index: number) => {
    setCurrentSlide(index);
    stopAutoSlide();
    setTimeout(startAutoSlide, 2000);
  };

  const CardContent = ({ isWrappedInLink = false }) => (
    <div className={styles.contentContainer}>
      <div className={styles.headerContainer}>
        <h2 className={styles.title}>{title}</h2>
        {href && !isWrappedInLink && (
          <div className={styles.viewDetailsContainer}>
            <InlineLink
              href={href}
              icon="arrow-right"
              iconSize={24}
              color="primary"
              ariaLabel={`View details for ${title}`}
            >
              View Details
            </InlineLink>
          </div>
        )}
        {href && isWrappedInLink && (
          <div className={styles.viewDetailsContainer}>
            <span className={styles.viewDetailsText}>View Details</span>
            <MoveRightIcon
              color="var(--color-primary)"
              className={styles.arrowIcon}
            />
          </div>
        )}
      </div>
      <div className={styles.divider} />
      <p className={styles.description}>{description}</p>

      {/* Mobile Slider */}
      <div
        className={clsx(styles.imagesContainer, styles.mobileSliderContainer)}
      >
        <div
          className={styles.mobileSliderTrack}
          ref={sliderRef}
          style={{
            transform: `translateX(${
              -currentSlide * 100 +
              (isDragging
                ? (translateX / (sliderRef.current?.offsetWidth || 1)) * 100
                : 0)
            }%)`,
            transition: isDragging ? "none" : "transform 0.3s ease",
            width: `${totalSlides * 100}%`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {media?.cardImages?.map((image, index) => (
            <div key={index} className={styles.mobileSlideImage}>
              <ImageContainer
                src={image.image}
                alt={image.alt}
                className={styles.image}
                fullWidth
              />
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className={styles.slideIndicators}>
            {media?.cardImages?.map((_, index) => (
              <div
                key={index}
                className={clsx(styles.slideIndicator, {
                  [styles.activeIndicator]: index === currentSlide,
                })}
                onClick={() => handleIndicatorClick(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Images */}
      <div
        className={clsx(styles.imagesContainer, styles.desktopImagesContainer)}
      >
        {media?.cardImages?.map((image, index) => {
          const isMiddleImage = index === 1 && media?.cardImages?.length >= 3;
          const WrapperComponent = isMiddleImage
            ? styles.largeImageWrapper
            : styles.smallImageWrapper;
          return (
            <div key={index} className={WrapperComponent}>
              <ImageContainer
                src={image.image}
                alt={image.alt}
                className={cn(
                  styles.image,
                  isMiddleImage && styles.middleImage
                )}
                fullWidth
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const cardClasses = clsx(styles.packageCard, className, {
    [styles.interactive]: href !== undefined,
  });

  return href ? (
    <div className={cardClasses}>
      <Link
        href={href}
        className={styles.cardLink}
        aria-label={`${title} - View package details`}
      >
        <CardContent isWrappedInLink={true} />
      </Link>
    </div>
  ) : (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
};
