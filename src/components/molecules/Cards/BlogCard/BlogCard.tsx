"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { BlogCardProps } from "./BlogCard.types";
import styles from "./BlogCard.module.css";
import Link from "next/link";
import clsx from "clsx";
import { ImageContainer } from "@/components/atoms";
import { MoveRightIcon } from "lucide-react";

export const BlogCard = ({
  title,
  description,
  category,
  date,
  image,
  href,
  className,
}: BlogCardProps) => {
  const CardContent = ({ isWrappedInLink = false }) => (
    <div className={styles.contentContainer}>
      <div className={styles.imageWrapper}>
        <ImageContainer
          src={image.src}
          alt={image.alt}
          className={styles.image}
          fullWidth
        />
        {category && (
          <div className={styles.categoryBadge}>
            <span className={styles.categoryText}>{category}</span>
          </div>
        )}
      </div>

      <div className={styles.textContent}>
        <div className={styles.headerContainer}>
          <h3 className={styles.title}>{title}</h3>
          {/* {href && isWrappedInLink && (
            <MoveRightIcon
              color="var(--color-primary)"
              className={styles.arrowIcon}
            />
          )} */}
        </div>

        <p className={styles.description}>{description}</p>

        {date && (
          <div className={styles.footer}>
            <span className={styles.date}>{date}</span>
          </div>
        )}
      </div>
    </div>
  );

  const cardClasses = clsx(styles.blogCard, className, {
    [styles.interactive]: href !== undefined,
  });

  return href ? (
    <Link
      href={href}
      className={cardClasses}
      aria-label={`Read article: ${title}`}
    >
      <CardContent isWrappedInLink={true} />
    </Link>
  ) : (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
};
