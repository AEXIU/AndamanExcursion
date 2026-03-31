import React from "react";
import { ImageContainer } from "@/components/atoms";
import { HoverExpandCardProps } from "./HoverExpandCard.types";
import styles from "./HoverExpandCard.module.css";

export const HoverExpandCard: React.FC<HoverExpandCardProps> = ({
  subtitle,
  title,
  image,
  imageAlt,
  className = "",
  isExpanded = false,
  onHover,
  dataPosition,
  style,
}) => {
  const cardClasses = [
    styles.card,
    isExpanded ? styles.expanded : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cardClasses}
      onMouseEnter={onHover}
      data-position={dataPosition}
      style={style}
    >
      <ImageContainer
        src={image}
        alt={imageAlt}
        priority
        fullWidth
        className={styles.image}
      />
      <div className={styles.content}>
        <div className={styles.textContent}>
          <h3 className={styles.subtitle}>{subtitle}</h3>
          <p className={styles.title}>{title}</p>
        </div>
      </div>
    </div>
  );
};
