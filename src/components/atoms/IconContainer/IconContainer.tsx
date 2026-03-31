"use client";
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import styles from "./IconContainer.module.css";
import { IconContainerProps } from "./IconContainer.types";
import { ImageOff } from "lucide-react";

export const IconContainer = ({
  src,
  alt,
  size = 24,
  responsive,
  className = "",
  decorative = false,
  priority = false,
}: IconContainerProps) => {
  const [iconError, setIconError] = useState(false);
  const [iconLoading, setIconLoading] = useState(true);

  useEffect(() => {
    setIconError(false);
    setIconLoading(true);
  }, [src]);

  // Validate src prop
  const isValidSrc =
    src && (typeof src === "string" ? src.trim() !== "" : true);

  // Check if the source is an SVG
  const isSvg = typeof src === "string" && src.toLowerCase().includes(".svg");

  const handleIconError = useCallback(() => {
    setIconError(true);
    setIconLoading(false);
  }, []);

  const handleIconLoad = useCallback(() => {
    setIconLoading(false);
    setIconError(false);
  }, []);

  // Generate responsive CSS custom properties if responsive sizes are provided
  const generateResponsiveStyles = (): React.CSSProperties => {
    if (!responsive) return {};

    const style: React.CSSProperties & Record<string, string> = {};

    if (responsive.mobile) {
      style["--icon-size-mobile"] = `${responsive.mobile}px`;
    }
    if (responsive.tablet) {
      style["--icon-size-tablet"] = `${responsive.tablet}px`;
    }
    if (responsive.desktop) {
      style["--icon-size-desktop"] = `${responsive.desktop}px`;
    }

    return style;
  };

  const containerClasses = [
    styles.container,
    iconLoading && styles.loading,
    iconError && styles.error,
    isSvg && styles.svg,
    responsive && styles.responsive,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Determine container style
  const containerStyle: React.CSSProperties = {
    ...(size === "auto" ? {} : { width: size, height: size }),
    ...(isSvg ? { padding: "1px" } : {}),
    ...generateResponsiveStyles(),
  };

  // Fallback content when icon fails or src is invalid
  const renderFallback = () => (
    <div
      className={styles.fallback}
      style={containerStyle}
      role="img"
      aria-label={alt || "Icon unavailable"}
    >
      <ImageOff
        size={typeof size === "number" ? Math.min(24, size * 0.8) : 24}
        className={styles.fallbackIcon}
      />
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className={styles.loadingOverlay} style={containerStyle}>
      <div className={styles.loadingSpinner} />
    </div>
  );

  // Don't render anything if src is invalid
  if (!isValidSrc) {
    return renderFallback();
  }

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : alt}
    >
      {iconError ? (
        renderFallback()
      ) : (
        <>
          <Image
            src={typeof src === "string" ? src : src?.url || ""}
            alt={alt || ""}
            width={typeof size === "number" ? size : 24}
            height={typeof size === "number" ? size : 24}
            className={styles.icon}
            priority={priority}
            onError={handleIconError}
            onLoad={handleIconLoad}
            // SVG-specific optimizations
            {...(isSvg && {
              unoptimized: false,
              quality: 100,
            })}
          />
          {iconLoading && renderLoading()}
        </>
      )}
    </div>
  );
};
