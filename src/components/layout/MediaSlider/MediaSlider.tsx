"use client";
import React, { useState, memo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import styles from "./MediaSlider.module.css";
import { Button } from "@/components/atoms";
import { Media } from "@payload-types";
import MediaContainer from "@/components/atoms/MediaContainer/MediaContainer";

interface MediaSliderProps {
  media: Array<{
    src: string | Media;
    alt: string;
    isVideo?: boolean;
  }>;
  altText?: string;
}

export const MediaSlider = memo<MediaSliderProps>(
  ({ media, altText = "Activity media" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrevious = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prevIndex) =>
          prevIndex === 0 ? media.length - 1 : prevIndex - 1
        );
      },
      [media.length]
    );

    const handleNext = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentIndex((prevIndex) =>
          prevIndex === media.length - 1 ? 0 : prevIndex + 1
        );
      },
      [media.length]
    );

    const handleDotClick = useCallback((index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setCurrentIndex(index);
    }, []);

    // Helper to get media URL from Media object
    const getMediaUrl = (src: string | Media): string => {
      if (typeof src === "string") {
        return src;
      }

      if (src && typeof src === "object" && "url" in src) {
        return src.url || "";
      }

      return "";
    };

    // Helper to check if media is video
    const isVideoMedia = (mediaItem: {
      src: string | Media;
      alt: string;
      isVideo?: boolean;
    }) => {
      // First check the explicit isVideo flag
      if (mediaItem.isVideo === true) return true;
      if (mediaItem.isVideo === false) return false;

      // Check Media object properties
      if (typeof mediaItem.src === "object" && mediaItem.src) {
        if (mediaItem.src.mimeType?.startsWith("video/")) return true;
      }

      // Check file extension
      const url = getMediaUrl(mediaItem.src);
      if (url && /\.(mp4|webm|ogg|avi|mov|wmv)$/i.test(url)) return true;

      return false;
    };

    // Render placeholder when no media is available
    if (!media || media.length === 0) {
      return (
        <div className={styles.imageSliderContainer}>
          <div className={styles.imageContainer}>
            <MediaContainer
              src=""
              alt="No media available"
              className={styles.ferryImage}
              aspectRatio="square"
              objectFit="cover"
              fullWidth={true}
            />
          </div>
        </div>
      );
    }

    const currentMedia = media[currentIndex];
    const currentMediaIsVideo = isVideoMedia(currentMedia);

    return (
      <div
        className={styles.imageSliderContainer}
        onClick={(e) => {
          // Prevent clicks on the slider container from bubbling up
          // unless it's on the actual media (image/video)
          const target = e.target as HTMLElement;
          if (
            target.closest('[class*="sliderButton"]') ||
            target.closest('[class*="sliderCounter"]') ||
            target.closest("button")
          ) {
            e.stopPropagation();
          }
        }}
      >
        {/* Main media display */}
        <div className={styles.imageContainer}>
          {currentMediaIsVideo ? (
            <video
              className={styles.ferryImage}
              autoPlay
              muted
              loop
              playsInline
              controls
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "inherit",
              }}
              aria-label={currentMedia.alt || `${altText} ${currentIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
            >
              <source src={getMediaUrl(currentMedia.src)} type="video/mp4" />
              <source src={getMediaUrl(currentMedia.src)} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <MediaContainer
              src={currentMedia.src}
              alt={currentMedia.alt || `${altText} ${currentIndex + 1}`}
              className={styles.ferryImage}
              aspectRatio="auto"
              objectFit="cover"
              fullWidth={true}
            />
          )}

          {/* Media type indicator */}
          <div className={styles.mediaTypeIndicator}>
            {currentMediaIsVideo ? (
              <Play size={20} aria-label="Video content" />
            ) : (
              <ImageIcon size={20} aria-label="Image content" />
            )}
          </div>
        </div>

        {/* Navigation arrows - only show if more than 1 item */}
        {media.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="small"
              className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
              onClick={handlePrevious}
              aria-label="Previous media"
              type="button"
              data-slider-control="prev"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="small"
              className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
              onClick={handleNext}
              aria-label="Next media"
              type="button"
              data-slider-control="next"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          </>
        )}

        {/* Current position indicator */}
        {media.length > 1 && (
          <div
            className={styles.sliderCounter}
            onClick={(e) => e.stopPropagation()}
            data-slider-control="counter"
          >
            <span aria-live="polite">
              {currentIndex + 1} / {media.length}
            </span>
          </div>
        )}
      </div>
    );
  }
);

MediaSlider.displayName = "MediaSlider";
