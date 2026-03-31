import React, { memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "../FerryCard.module.css";
import { ferryCardContent } from "../FerryCard.content";

interface PriceInfoProps {
  price: number;
  totalPrice: number;
  isExpanded: boolean;
}

export const PriceInfo = memo<PriceInfoProps>(
  ({ price, totalPrice, isExpanded }) => {
    return (
      <div className={styles.priceInfo}>
        <span className={styles.pricePerAdult}>
          {ferryCardContent.price.rupeeSymbol}
          {price}
          {ferryCardContent.perAdult}
        </span>
        <span
          className={styles.totalPrice}
          aria-label={`${ferryCardContent.price.totalPrice}: ${totalPrice} ${ferryCardContent.price.rupees}`}
        >
          {ferryCardContent.price.rupeeSymbol}
          {totalPrice}
          {ferryCardContent.total}
        </span>
        {/* <div className={styles.expandIcon} aria-hidden="true">
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div> */}
      </div>
    );
  }
);

PriceInfo.displayName = "PriceInfo";
