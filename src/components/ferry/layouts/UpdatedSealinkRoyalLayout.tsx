// sealink-economy

import { FerryVesselLayoutProps } from "@/types/SeatSelection.types";
import styles from "./sealinkRoyalLayout.module.css";
import Image from "next/image";
import {
  getSeatClassName,
  getSeatImage,
  SEALINK_ROYAL_SEATS,
} from "@/utils/seatMapping";

import sealinkRoyal from "@public/graphics/ferry_vessels/sealink/sealink_royal_vessel.svg";
import rearWithToilet from "@public/graphics/ship_parts/rear_with_bathroom.svg";
import wheelHouse from "@public/graphics/ship_parts/wheel_house.svg";
import stairsUpAndDown from "@public/graphics/ship_parts/stairs_up_down.svg";

export function UpdatedSealinkRoyalLayout(
  props: Omit<FerryVesselLayoutProps, "operator" | "vesselClass">
) {
  const getSeatsByGroup = (groupSeats: string[]) => {
    return props.seats.filter((seat) =>
      groupSeats.includes(seat.displayNumber.toUpperCase())
    );
  };

  const renderSeatGroup = (groupSeats: string[], groupClass: string) => {
    const seats = getSeatsByGroup(groupSeats);
    return (
      <div className={`${styles.seatGroup} ${styles[groupClass]}`}>
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={getSeatClassName(seat)}
            onClick={() => {
              if (seat.status !== "booked" && seat.status !== "blocked") {
                props.onSeatSelect(seat.id);
              }
            }}
          >
            <Image
              src={getSeatImage(seat)}
              alt={`Seat ${seat.displayNumber}`}
              className={styles.seatImage}
              draggable={false}
            />
            {/* Optional: Show seat number overlay */}
            <span className={styles.seatNumber}>{seat.displayNumber}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.ferryContainer}>
      <Image
        src={sealinkRoyal}
        className={styles.ferryOutlineImage}
        alt="Ferry Layout"
      />
      <div className={styles.seatLayoutContainer}>
        <div className={styles.seatLayout}>
          {renderSeatGroup(SEALINK_ROYAL_SEATS.group1, "group1")}
          {renderSeatGroup(SEALINK_ROYAL_SEATS.group2, "group2")}
          {renderSeatGroup(SEALINK_ROYAL_SEATS.group3, "group3")}
          {renderSeatGroup(SEALINK_ROYAL_SEATS.group4, "group4")}

          <div className={styles.shipRearContainer}>
            <Image
              src={rearWithToilet}
              className={styles.shipRear}
              alt="Ship rear with toilet graphic"
            />
          </div>
          <div className={styles.shipWheelHouseContainer}>
            <Image
              src={wheelHouse}
              className={styles.shipWheelHouse}
              alt="Ship wheel house graphic"
            />
          </div>
          <div className={styles.stairsUpAndDownContainer}>
            <Image
              src={stairsUpAndDown}
              className={styles.shipWheelHouse}
              alt="Ship wheel house graphic"
            />
          </div>
          <div className={styles.upperDeckContainer}>
            <span>Upper Deck</span>
          </div>
          <div className={styles.frontContainer}>
            <span>Front</span>
          </div>
        </div>
      </div>
    </div>
  );
}
