import React from "react";
import { Column, Row, Section } from "@/components/layout";
import {
  DescriptionText,
  ImageContainer,
  VideoContainer,
  SectionTitle,
} from "@/components/atoms";
import styles from "./Story.module.css";
import { StoryProps } from "./Story.types";
import type { Media } from "@payload-types";
import MediaContainer from "@/components/atoms/MediaContainer/MediaContainer";

// Utility function to extract URL from Media object
const getMediaUrl = (media: string | Media | undefined): string => {
  if (!media) return "";
  if (typeof media === "string") return media;
  if (typeof media === "object" && media.url) return media.url;
  return "";
};

// Utility function to check if media is video
const isVideoMedia = (
  media: string | Media | undefined,
  mediaType?: string
): boolean => {
  // First check explicit mediaType
  if (mediaType === "video") return true;

  // If no media, it's not a video
  if (!media) return false;

  // Check by MIME type if Media object
  if (typeof media === "object" && media.mimeType) {
    const isVideoMimeType = media.mimeType.startsWith("video/");

    return isVideoMimeType;
  }

  // Check by file extension for strings
  const url = getMediaUrl(media);
  if (!url) return false;

  const hasVideoExtension = /\.(mp4|webm|ogg|avi|mov|wmv)$/i.test(url);
  return hasVideoExtension;
};

export const Story = ({ content }: StoryProps) => {
  const { title, specialWord, description, media, alt, mediaType, poster } =
    content;

  const renderMedia = () => {
    // Check if media is a video
    const isVideo = isVideoMedia(media, mediaType);

    if (isVideo) {
      // Extract video settings from media object with sensible defaults
      const videoSettings = media?.videoSettings || {};
      const videoPoster = videoSettings.poster || poster;

      return (
        <MediaContainer
          src={media}
          alt={alt}
          className={styles.media}
          aspectRatio="auto"
          controls={videoSettings.controls !== false}
          autoplay={videoSettings.autoplay || false}
          muted={videoSettings.muted !== false}
          loop={videoSettings.loop || false}
          poster={videoPoster} // MediaContainer handles Media objects
          playsInline={true}
        />
      );
    }

    // Fallback to ImageContainer for images
    return (
      <ImageContainer
        src={getMediaUrl(media)}
        alt={alt}
        className={styles.media}
      />
    );
  };

  return (
    <Section
      fullBleed
      backgroundColor="light"
      id="our-story"
      aria-labelledby="story-title"
      className={styles.storySectionContainer}
    >
      <Column
        gap="var(--space-12)"
        fullWidth
        className={styles.sectionContainer}
        responsive
        responsiveAlignItems="start"
        responsiveGap="var(--space-4)"
      >
        <Row
          fullWidth
          alignItems="center"
          justifyContent="between"
          responsive
          responsiveAlignItems="start"
        >
          <SectionTitle
            text={title}
            specialWord={specialWord}
            id="story-title"
          />
          <DescriptionText text={description} align="right" />
        </Row>
        <Row fullWidth justifyContent="center" alignItems="center">
          {renderMedia()}
        </Row>
      </Column>
    </Section>
  );
};
