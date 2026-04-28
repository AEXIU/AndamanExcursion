// Updated SectionTitle component with smart underline selection
"use client";
import React, { useState, useRef } from "react";
import styles from "./SectionTitle.module.css";
import type { SectionTitleProps } from "./SectionTitle.types";
import underlineShort from "@public/graphics/underlineShort.svg";
import underlineLong from "@public/graphics/underlineLong.svg";
import Image from "next/image";
import { useSingleElementUnderline } from "@/utils/underlinePositioning";
import clsx from "clsx";

// Threshold in pixels to determine which underline to use
const UNDERLINE_THRESHOLD = 200; // Adjust based on your design needs

export const SectionTitle = ({
  text,
  className,
  specialWord,
  id,
  headingLevel = "h2",
  titleTextClasses,
  specialWordStyles,
  hideUnderline = false,
}: SectionTitleProps) => {
  const titleClasses = [styles.sectionTitle, className || ""].join(" ").trim();
  const [isHovered, setIsHovered] = useState(false);
  const specialWordRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Calculate responsive offset based on viewport
  const getResponsiveOffset = () => {
    if (typeof window === "undefined") return 10; // SSR fallback

    const vw = window.innerWidth;

    if (vw <= 360) return 1;
    if (vw <= 480) return 2;
    if (vw <= 768) return 4;
    if (vw <= 1024) return 8;
    return 10;
  };

  // Use the utility hook for underline positioning with responsive offset
  const { positions: underlinePositions } = useSingleElementUnderline(
    titleRef,
    specialWordRef,
    [specialWord, text],
    getResponsiveOffset()
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Function to render text with special word highlighted
  const renderTextWithSpecialWord = () => {
    if (!specialWord || !text.includes(specialWord)) {
      return <span>{text}</span>;
    }

    const parts = text.split(specialWord);
    const result: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      if (part) {
        result.push(<span key={`text-${index}`}>{part}</span>);
      }

      if (index < parts.length - 1) {
        result.push(
          <span
            key={`special-${index}`}
            ref={index === 0 ? specialWordRef : null}
            className={clsx(styles.specialWord, specialWordStyles)}
            data-hover={isHovered}
          >
            {specialWord}
          </span>
        );
      }
    });

    return result;
  };

  return (
    <div
      className={titleClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {headingLevel === "h1" ? (
        <h1
          ref={titleRef}
          className={clsx(styles.title, titleTextClasses)}
          id={id}
        >
          {renderTextWithSpecialWord()}
        </h1>
      ) : (
        <h2
          ref={titleRef}
          className={clsx(styles.title, titleTextClasses)}
          id={id}
        >
          {renderTextWithSpecialWord()}
        </h2>
      )}

      {specialWord && !hideUnderline &&
        underlinePositions.map((position, index) => {
          // Smart selection: use short underline for narrow words, long for wider words
          const useShortUnderline = position.width < UNDERLINE_THRESHOLD;
          const underlineGraphic = useShortUnderline
            ? underlineShort
            : underlineLong;

          return (
            <div
              key={`underline-${index}`}
              className={styles.underline}
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: `${position.width}px`,
              }}
            >
              <Image
                src={underlineGraphic}
                alt="underline"
                width={position.width}
                height={6}
                style={{ height: "auto" }}
                className={clsx(
                  underlineGraphic === underlineShort
                    ? styles.shortUnderline
                    : styles.longUnderline,
                  styles.underlineImage
                )}
                aria-hidden="true"
              />
            </div>
          );
        })}
    </div>
  );
};
