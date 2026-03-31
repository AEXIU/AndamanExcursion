"use client";
import type { SmallCardProps } from "./SmallCard.types";
import { MoveUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./SmallCard.module.css";
import { Chip } from "@/components/atoms";
import { cn } from "@/utils/cn";
import MediaContainer from "@/components/atoms/MediaContainer/MediaContainer";

const star = "/icons/misc/star.svg";
const heart = "/icons/misc/heart.svg";

export const SmallCard = ({
  image,
  imageAlt,
  title,
  duration,
  price,
  description,
  href,
  rating,
  priority = false,
  variant = "default",
}: SmallCardProps) => {
  const isMemberCard = variant === "member";

  const CardContent = () => (
    <>
      <div className={styles.imageWrapper}>
        <MediaContainer
          src={image}
          alt={imageAlt || title}
          className={styles.cardImage}
          aspectRatio="auto"
          objectFit="cover"
          priority={priority}
        />
        {!isMemberCard && <div className={styles.imageOverlay} />}
        <div
          className={cn(
            styles.contentContainer,
            description && styles.contentContainerWithDescription,
            isMemberCard && styles.contentContainerMember
          )}
        >
          {!isMemberCard && duration && (
            <div className={styles.durationBadge}>
              <span className={styles.durationText}>{duration}</span>
            </div>
          )}
          <div className={styles.cardInfo}>
            {!isMemberCard && rating && (
              <Chip
                icon={star}
                text={rating.toFixed(1).toString() + " Stars"}
                className={styles.ratingBadge}
              />
            )}
            {!isMemberCard && description && (
              <Chip
                icon={heart}
                text={"Featured Experience"}
                className={styles.favouriteBadge}
              />
            )}
            <h3
              className={cn(
                styles.cardTitle,
                isMemberCard && styles.cardTitleMember
              )}
            >
              {title}
            </h3>
            {description && (
              <p
                className={cn(
                  styles.cardDescription,
                  isMemberCard && styles.cardDescriptionMember
                )}
              >
                {description}
              </p>
            )}
            {!isMemberCard && price && (
              <p className={styles.cardPrice}>
                ₹{typeof price === "number" ? price.toLocaleString() : price}
              </p>
            )}
          </div>
        </div>
        {!isMemberCard && (
          <div
            className={cn(
              styles.arrowButton,
              description && styles.arrowButtonWithDescription
            )}
            aria-hidden="true"
          >
            <MoveUpRight size={20} color="var(--color-primary)" />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div
      className={cn(
        styles.cardContainer,
        description && styles.cardContainerWithDescription,
        isMemberCard && styles.cardContainerMember
      )}
    >
      {href && !isMemberCard ? (
        <Link href={href} className={styles.cardLink}>
          <CardContent />
        </Link>
      ) : (
        <CardContent />
      )}
    </div>
  );
};
