import React from "react";
import { ImageContainer } from "@/components/atoms";
import { Column, Row } from "@/components/layout";
import styles from "./PackageDetailHeader.module.css";
import type { PackageDetailHeaderProps } from "./PackageDetailHeader.types";
import { MediaSlider } from "@/components/layout/MediaSlider/MediaSlider";

export const PackageDetailHeader: React.FC<PackageDetailHeaderProps> = ({
  packageData,
}) => {
  // Get period display
  const periodValue =
    typeof packageData.coreInfo?.period === "object"
      ? packageData.coreInfo.period?.value
      : packageData.coreInfo?.period || "";
  const periodDisplay = periodValue.replace("-", "D ") + "N";

  // Get location display
  const locationDisplay = packageData.coreInfo?.locations
    ?.map((location) => {
      if (typeof location === "string") return location;
      return location.name;
    })
    .join(", ");

  // Transform package images to MediaSlider format
  const transformedMedia =
    packageData.images?.map((image) => ({
      src: image.url, // Extract URL string from the image object
      alt: image.alt || `${packageData.title} package image`,
      isVideo: false, // Assuming these are images from package data
    })) || [];

  return (
    <>
      <Row fullWidth responsive responsiveGap="var(--space-4)">
        {/* Wrapper for MediaSlider with proper positioning */}
        <div className={styles.mediaSliderWrapper}>
          {transformedMedia.length > 0 ? (
            <MediaSlider
              media={transformedMedia}
              altText={`${packageData.title} package gallery`}
            />
          ) : (
            // Fallback to ImageContainer if no images
            <ImageContainer
              src="/images/placeholder.png"
              alt={packageData.title}
              className={styles.imageContainer}
            />
          )}
        </div>
      </Row>

      <Row
        fullWidth
        justifyContent="between"
        alignItems="start"
        responsive
        responsiveGap="var(--space-4)"
      >
        <h1 className={styles.sectionTitle}>{packageData.title}</h1>
        <Column
          gap={1}
          alignItems="end"
          className={styles.infoContainer}
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-2)"
        >
          <p role="text" aria-label="Price" className={styles.price}>
            ₹{packageData.pricing?.price || 0}/adult
          </p>
          <Row
            gap={1}
            responsive
            responsiveGap="var(--space-2)"
            alignItems="start"
          >
            <p role="text" aria-label="Location" className={styles.location}>
              {locationDisplay}
            </p>
            <span
              role="separator"
              aria-label="Separator"
              className={styles.separator}
            >
              •
            </span>
            <p role="text" aria-label="Period" className={styles.period}>
              {periodDisplay}
            </p>
          </Row>
        </Column>
      </Row>
    </>
  );
};
