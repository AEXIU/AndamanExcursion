import React from "react";
import { ImageContainer } from "../ImageContainer/ImageContainer";
import styles from "./BrandLogo.module.css";

const BrandLogo: React.FC = () => {
  return (
    <ImageContainer
      src="/icons/logo.svg"
      alt="Andaman Excursion Logo"
      aspectRatio="auto"
      objectFit="contain"
      className={styles.brandLogo}
    />
  );
};

export default BrandLogo;
