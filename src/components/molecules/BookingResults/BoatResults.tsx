"use client";
import React, { useMemo } from "react";
import { useBoat, type Boat, type BoatSearchParams } from "@/store/BoatStore";
import { Column } from "@/components/layout";
import BoatCard from "../Cards/BoatCard/BoatCard";
import styles from "./BookingResults.module.css";
import NoBoatsCard from "../Cards/ComponentStateCards/NoBoatsCard";
import LoadingCard from "../Cards/ComponentStateCards/LoadingCard";

interface BoatResultsProps {
  searchParams: BoatSearchParams;
  boats: Boat[];
  loading: boolean;
}

export const BoatResults: React.FC<BoatResultsProps> = ({
  searchParams,
  boats,
  loading,
}) => {
  const { addToCart, isItemInCart } = useBoat();

  const handleAddToCart = (boat: Boat, time: string) => {
    addToCart(boat, 1, time, searchParams);

    // Scroll to cart section after adding
    setTimeout(() => {
      const cartSection = document.getElementById("cart-section");
      if (cartSection) {
        const headerOffset = 80; // Account for fixed header
        const elementPosition = cartSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  // Loading state
  if (loading) {
    return <LoadingCard className={styles.loadingContainer} />;
  }

  // No results state
  if (!boats || boats.length === 0) {
    return <NoBoatsCard className={styles.noResultsContainer} />;
  }

  return (
    <div className={styles.resultsContainer}>
      {/* <div className={styles.resultsHeader}>
        <h2>Available Boat Trips</h2>
        <p>
          {boats.length} boat{boats.length !== 1 ? "s" : ""} available
        </p>
      </div> */}

      <Column gap="var(--space-6)" className={styles.resultsList}>
        {boats.map((boat) => (
          <BoatCard
            key={boat.id}
            boat={boat}
            searchParams={searchParams}
            onAddToCart={handleAddToCart}
            isInCart={isItemInCart}
          />
        ))}
      </Column>
    </div>
  );
};
