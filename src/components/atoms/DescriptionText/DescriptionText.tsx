import React from "react";
import styles from "./DescriptionText.module.css";
import type { DescriptionTextProps  } from "./DescriptionText.types";

export const DescriptionText = ({
  text,
  align = "left",
  className,
}: DescriptionTextProps) => {
  const descriptionClasses = [
    styles.description,
    styles[align],
    className || "",
  ]
    .join(" ")
    .trim();

  return <p className={descriptionClasses}>{text}</p>;
};
