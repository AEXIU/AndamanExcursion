// ===== Updated FerryResults.tsx =====
import React from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { FerryCard } from "@/components/molecules/Cards/FerryCard";
import type { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { useFerryStore } from "@/store/FerryStore";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import styles from "./FerryResults.module.css";
import NoFerriesCard from "@/components/molecules/Cards/ComponentStateCards/NoFerriesCard";
import LoadingCard from "@/components/molecules/Cards/ComponentStateCards/LoadingCard";

interface FerryResultsProps {
  loading: boolean;
  results: UnifiedFerryResult[];
}

export function FerryResults({ loading, results }: FerryResultsProps) {
  const { selectFerry, searchParams } = useFerryStore();
  const router = useRouter();

  const transformToFerryCardProps = (
    ferry: UnifiedFerryResult,
    index: number
  ): FerryCardProps => {
    const validClasses = ferry.classes.filter((cls) => cls.availableSeats > 0);
    if (validClasses.length === 0) {
      console.warn(`Ferry ${ferry.ferryName} has no available classes`);
    }

    // Get price range for display
    const prices = validClasses.map((cls) => cls.price);
    const minPrice =
      prices.length > 0 ? Math.min(...prices) : ferry.pricing.total;
    const maxPrice =
      prices.length > 0 ? Math.max(...prices) : ferry.pricing.total;

    // Calculate total available seats across all classes
    const totalSeats = validClasses.reduce(
      (sum, cls) => sum + cls.availableSeats,
      0
    );

    // Calculate total price based on actual passenger counts from search params
    const calculateTotalPrice = (basePrice: number) => {
      const adults = searchParams.adults || 1;
      const children = searchParams.children || 0;
      const infants = searchParams.infants || 0;

      // Adults pay full price, children typically 50%, infants free
      return adults * basePrice + children * basePrice * 0.5;
    };

    const calculatedTotalPrice = calculateTotalPrice(minPrice);

    // Create display price text
    const getPriceDisplay = () => {
      if (minPrice === maxPrice) {
        return `₹${minPrice}`;
      }
      return `₹${minPrice} - ₹${maxPrice}`;
    };

    // Get class summary for display
    const getClassSummary = () => {
      if (validClasses.length === 1) {
        return validClasses[0].name;
      }
      return `${validClasses.length} classes available`;
    };

    return {
      ferryName: ferry.ferryName,
      rating: 4.5,
      departureTime: ferry.schedule.departureTime,
      departureLocation: ferry.route.from.name,
      arrivalTime: ferry.schedule.arrivalTime,
      arrivalLocation: ferry.route.to.name,
      // price: getPriceDisplay(),
      price: minPrice,
      totalPrice: calculatedTotalPrice, // Use calculated price based on passenger counts
      seatsLeft:
        totalSeats > 0 ? totalSeats : ferry.availability.availableSeats,
      operator: ferry.operator,

      // Updated class information
      // classInfo: {
      //   summary: getClassSummary(),
      //   count: validClasses.length,
      //   details: validClasses.map((cls) => ({
      //     name: cls.name,
      //     price: cls.price,
      //     seats: cls.availableSeats,
      //     amenities: cls.amenities,
      //   })),
      // },

      // Updated: Changed from onChooseSeats to onBookNow
      onBookNow: () => {
        // Select the ferry and navigate to booking
        // For now, we'll use the first available class or cheapest class
        const selectedClass =
          validClasses.length > 0
            ? validClasses.reduce((cheapest, current) =>
                current.price < cheapest.price ? current : cheapest
              )
            : ferry.classes[0];

        if (selectedClass) {
          selectFerry(ferry);
          router.push(`/ferry/booking/${ferry.id}?class=${selectedClass.id}`);
        } else {
          // Fallback - just go to booking page without class
          selectFerry(ferry);
          router.push(`/ferry/booking/${ferry.id}`);
        }
      },

      ferryIndex: index,
      detailsUrl: `/ferry/booking/${ferry.id}`,
    };
  };

  // Simple loading state
  if (loading) {
    return <LoadingCard className={styles.loadingContainer} />;
  }

  // No results - let ServiceStatusDisplay handle error states
  if (results.length === 0) {
    return <NoFerriesCard className={styles.noResultsContainer} />;
  }

  // Results available - pure display
  return (
    <div className={styles.ferryResultsContainer}>
      <div className={styles.ferryList}>
        {results.map((ferry, index) => (
          <FerryCard
            key={`${ferry.operator}-${ferry.id}-${index}`}
            {...transformToFerryCardProps(ferry, index)}
          />
        ))}
      </div>

      {/* <div className={styles.resultsFooter}>
        <div className={styles.resultsInfo}>
          <Info size={16} className={styles.infoIcon} />
          <p>
            Showing {results.length} available ferry
            {results.length !== 1 ? "s" : ""}
          </p>
        </div>
        <p className={styles.resultsNote}>
          Prices shown are starting from the lowest available class. Multiple
          classes may be available for selection. Final price may vary based on
          selected class and additional services.
        </p>
      </div> */}
    </div>
  );
}
