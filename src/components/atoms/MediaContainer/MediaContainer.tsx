"use client";

import React, { useRef, useEffect, useState, memo } from "react";
import Image from "next/image";
import styles from "./MediaContainer.module.css";
import { Media } from "@payload-types";
import { useImageSrc } from "@/hooks/useImageSrc";
import { cn } from "@/utils/cn";
import { ImageOff } from "lucide-react";
import clsx from "clsx";

export interface MediaContainerProps {
  src: string | Media | undefined | null;
  alt: string;
  className?: string;
  aspectRatio?:
    | "auto"
    | "square"
    | "video"
    | "portrait"
    | "landscape"
    | "banner";
  objectFit?: "cover" | "contain" | "fill";
  priority?: boolean;
  fullWidth?: boolean;
  decorative?: boolean;
  width?: number;
  height?: number;
  fixedSize?: boolean;
  // Video specific props
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  poster?: string | Media;
  playsInline?: boolean;
  // Loading state customization
  showSkeleton?: boolean;
  skeletonColor?: string;
  blurDataURL?: string; // For custom blur placeholder
}

const MediaContainer: React.FC<MediaContainerProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "auto",
  objectFit = "cover",
  priority = false,
  fullWidth = false,
  decorative = false,
  width,
  height,
  fixedSize = false,
  // Video props
  autoplay = true,
  muted = true,
  loop = true,
  controls = false,
  poster,
  playsInline = true,
  // Loading props
  showSkeleton = true,
  skeletonColor,
  blurDataURL,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoError, setIsVideoError] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image load failed:", {
      processedSrc,
      originalSrc: src,
      alt,
      selectedSize,
    });
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Smart size selection based on component props
  const getPreferredSize = (): string => {
    if (fixedSize && width) {
      if (width <= 400) return "small";
      if (width <= 768) return "medium";
      return "large";
    }

    if (fullWidth) {
      if (aspectRatio === "banner") return "large";
      return "medium";
    }

    switch (aspectRatio) {
      case "square":
      case "portrait":
        return "small";
      case "landscape":
      case "banner":
        return "medium";
      default:
        return "medium";
    }
  };

  // Use the hook with smart size selection
  const {
    src: processedSrc,
    isValid,
    isMediaObject,
    selectedSize,
    mediaMetadata,
  } = useImageSrc(src, {
    preferredSize: getPreferredSize(),
    containerWidth: width,
    highDPI:
      typeof window !== "undefined" ? window.devicePixelRatio > 1 : false,
    debug: process.env.NODE_ENV === "development",
  });

  // Determine if this is a video
  useEffect(() => {
    if (isMediaObject && src && typeof src === "object") {
      const media = src as Media;
      setIsVideo(media.mimeType?.startsWith("video/") ?? false);
    } else if (typeof processedSrc === "string") {
      const videoExtensions = /\.(mp4|webm|ogg|avi|mov|wmv)$/i;
      setIsVideo(videoExtensions.test(processedSrc));
    }
  }, [processedSrc, isMediaObject, src]);

  // Handle video events
  const handleVideoLoadStart = () => {
    setVideoLoading(true);
  };

  const handleVideoCanPlay = () => {
    setVideoLoading(false);
  };

  // ADD THIS NEW HANDLER
  const handleVideoLoadedMetadata = () => {
    // Safari prefers loadedmetadata over canplay
    setVideoLoading(false);
  };

  const handleVideoError = () => {
    setIsVideoError(true);
    setVideoLoading(false);
  };

  // Handle video autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (video && isVideo && autoplay) {
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          console.warn("Video autoplay failed:", error);
        }
      };
      playVideo();
    }
  }, [isVideo, autoplay]);

  // Reset loading states when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setVideoLoading(true);
  }, [src, processedSrc]);

  // Generate CSS classes
  const containerClasses = cn(
    styles.mediaContainer,
    {
      [styles.fullWidth]: fullWidth,
      [styles.fixedSize]: fixedSize,
      [styles[`aspect-${aspectRatio}`]]: aspectRatio !== "auto" && !fixedSize,
      [styles[`fit-${objectFit}`]]: true,
      [styles.loading]: (isVideo ? videoLoading : imageLoading) && isValid,
    },
    className
  );

  // Get poster image with the same optimization logic
  const getPosterSrc = (): string | undefined => {
    if (poster) {
      if (typeof poster === "string") {
        return poster;
      }
      if (typeof poster === "object" && poster.url) {
        return poster.sizes?.small?.url || poster.url;
      }
    }

    if (isMediaObject && src && typeof src === "object") {
      const media = src as Media;
      if (media.videoSettings?.poster) {
        const posterMedia = media.videoSettings.poster as Media;
        return posterMedia.sizes?.small?.url || posterMedia.url || "";
      }
    }

    return undefined;
  };

  // Generate a simple blur data URL based on aspect ratio
  const getBlurDataURL = (): string => {
    if (blurDataURL) return blurDataURL;

    // Generate a simple gradient blur placeholder
    const color = skeletonColor || "#f3f4f6";
    const width = 40;
    const height =
      aspectRatio === "square" ? 40 : aspectRatio === "portrait" ? 53 : 23;

    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
            <stop offset="50%" stop-color="${color}" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.3"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
      </svg>`
    )}`;
  };

  // If not valid or error occurred, show placeholder
  if (!isValid || (isVideo && isVideoError) || imageError) {
    return (
      <div
        className={containerClasses}
        style={fixedSize ? { width, height } : undefined}
      >
        <div className={styles.placeholder}>
          <ImageOff size={24} className={styles.placeholderIcon} />
          <span className={styles.placeholderText}>
            {alt || "Media not available"}
          </span>
        </div>
      </div>
    );
  }

  // Render video
  if (isVideo && !isVideoError) {
    const videoSettings =
      isMediaObject && src && typeof src === "object"
        ? (src as Media).videoSettings
        : undefined;

    return (
      <div
        className={containerClasses}
        style={fixedSize ? { width, height } : undefined}
      >
        {/* Loading skeleton for video */}
        {videoLoading && showSkeleton && (
          <div
            className={styles.skeleton}
            style={{ backgroundColor: skeletonColor }}
          >
            <div className={styles.skeletonShimmer} />
          </div>
        )}

        <video
          ref={videoRef}
          className={clsx(styles.media, styles.video, {
            [styles.mediaLoaded]: !videoLoading,
          })}
          autoPlay={autoplay && (videoSettings?.autoplay ?? true)}
          muted={muted && (videoSettings?.muted ?? true)}
          loop={loop && (videoSettings?.loop ?? true)}
          controls={controls || (videoSettings?.controls ?? false)}
          playsInline={playsInline}
          poster={getPosterSrc()}
          preload="metadata"
          onLoadStart={handleVideoLoadStart}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          aria-label={decorative ? undefined : alt}
          role={decorative ? "presentation" : undefined}
        >
          <source
            src={processedSrc}
            type={mediaMetadata?.mimeType || "video/mp4"}
          />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Render image using pre-optimized Payload sizes
  return (
    <div
      className={containerClasses}
      style={fixedSize ? { width, height } : undefined}
    >
      {/* Loading skeleton for image */}
      {imageLoading && showSkeleton && (
        <div
          className={styles.skeleton}
          style={{ backgroundColor: skeletonColor }}
        >
          <div className={styles.skeletonShimmer} />
        </div>
      )}

      {fixedSize && width && height ? (
        <Image
          src={processedSrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={clsx(styles.media, {
            [styles.mediaLoaded]: !imageLoading,
          })}
          onLoad={handleImageLoad}
          onError={handleImageError}
          placeholder="blur"
          blurDataURL={getBlurDataURL()}
          aria-hidden={decorative}
        />
      ) : (
        <Image
          src={processedSrc}
          alt={alt}
          fill
          priority={priority}
          className={clsx(styles.media, {
            [styles.mediaLoaded]: !imageLoading,
          })}
          sizes={fullWidth ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          placeholder="blur"
          blurDataURL={getBlurDataURL()}
          aria-hidden={decorative}
        />
      )}
    </div>
  );
};

export default memo(MediaContainer);
