"use client";
import React from "react";
import Image from "next/image";
import styles from "./VideoContainer.module.css";
import type { VideoContainerProps } from "./VideoContainer.types";
import { useImageSrc } from "@/hooks/useImageSrc";
import type { Media } from "@payload-types";

// Utility function to extract URL from Media object
const getMediaUrl = (media: string | Media | undefined): string => {
  if (!media) return "";
  if (typeof media === "string") return media;
  if (typeof media === "object" && media.url) {
    // Convert API paths to direct paths for better performance
    let url = media.url;
    if (url.startsWith("/api/media/file/")) {
      url = url.replace("/api/media/file/", "/media/");
    }
    return url;
  }
  return "";
};

// Utility function to get media metadata
const getMediaMetadata = (media: string | Media | undefined) => {
  if (!media || typeof media === "string") return null;
  if (typeof media === "object") {
    return {
      alt: media.alt,
      width: media.width,
      height: media.height,
      filename: media.filename,
      mimeType: media.mimeType,
    };
  }
  return null;
};

export const VideoContainer = ({
  src,
  alt,
  className = "",
  aspectRatio = "16/9",
  objectFit = "cover",
  priority = false,
  fullWidth = false,
  autoplay = false,
  loop = false,
  muted = true,
  controls = true,
  poster,
  width,
  height,
  fixedSize = false,
  playsInline = true,
  preload = "metadata",
  onPlay,
  onPause,
  onEnded,
  onError,
}: VideoContainerProps) => {
  // Extract URLs from Media objects
  const videoUrl = getMediaUrl(src);
  const posterUrl = getMediaUrl(poster);
  const mediaMetadata = getMediaMetadata(src);

  // Use alt from Media object if not provided as prop
  const effectiveAlt = alt || mediaMetadata?.alt || "Video content";

  // Process poster image if provided (ensure it's actually an image)
  const { src: processedPoster, isValid: posterValid } = useImageSrc(
    posterUrl && !posterUrl.includes(".mp4") ? posterUrl : "",
    {
      fallbackUrl: "",
    }
  );

  // Determine sizing approach
  const useFixedSize = fixedSize || (width && height);

  // Map aspect ratios to valid CSS class names
  const getAspectRatioClass = (ratio: string) => {
    const ratioMap: Record<string, string> = {
      "16/9": "aspect16x9",
      "4/3": "aspect4x3",
      "1/1": "aspect1x1",
      "21/9": "aspect21x9",
      auto: "aspectAuto",
    };
    return ratioMap[ratio] || "aspectAuto";
  };

  // Build container classes
  const containerClasses = [
    styles.container,
    !useFixedSize && styles[getAspectRatioClass(aspectRatio)],
    fullWidth && !useFixedSize && styles.fullWidth,
    useFixedSize && styles.fixedSize,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Generate inline styles for fixed dimensions
  const containerStyle =
    useFixedSize && width && height
      ? {
          width: `${width}px`,
          height: `${height}px`,
          minHeight: `${height}px`,
        }
      : undefined;

  return (
    <div className={containerClasses} style={containerStyle}>
      <video
        className={styles.video}
        src={videoUrl}
        poster={posterValid ? processedPoster : undefined}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={preload}
        controls={controls}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onError={onError}
        aria-label={effectiveAlt}
        style={{
          objectFit,
          width: useFixedSize ? width : "100%",
          height: useFixedSize ? height : "100%",
        }}
      />
    </div>
  );
};
