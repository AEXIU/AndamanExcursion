import { FerryVesselLayoutProps, Seat } from "@/types/SeatSelection.types";
import styles from "./sealinkLuxuryLayout.module.css";
import Image from "next/image";
import {
  getSeatClassName,
  getSeatImage,
  SEALINK_LUXURY_SEATS,
} from "@/utils/seatMapping";

import sealinkLuxury from "@public/graphics/ferry_vessels/sealink/sealink_luxury_vessel.svg";
import rear from "@public/graphics/ship_parts/rear.svg";
import rescueBoat from "@public/graphics/ship_parts/rescue_boat.svg";
import stairsUp from "@public/graphics/ship_parts/stairs_up.svg";

export function UpdatedSealinkLuxuryLayout(
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
        src={sealinkLuxury}
        className={styles.ferryOutlineImage}
        alt="Ferry Layout"
      />
      <div className={styles.seatLayoutContainer}>
        <div className={styles.seatLayout}>
          {renderSeatGroup(SEALINK_LUXURY_SEATS.group1, "group1")}
          {renderSeatGroup(SEALINK_LUXURY_SEATS.group2, "group2")}
          {renderSeatGroup(SEALINK_LUXURY_SEATS.group3, "group3")}
          {renderSeatGroup(SEALINK_LUXURY_SEATS.group4, "group4")}
          {renderSeatGroup(SEALINK_LUXURY_SEATS.group5, "group5")}
          {renderSeatGroup(SEALINK_LUXURY_SEATS.group6, "group6")}
          {renderSeatGroup(SEALINK_LUXURY_SEATS.group7, "group7")}
          {renderSeatGroup(SEALINK_LUXURY_SEATS.group8, "group8")}

          <div className={styles.shipRearContainer}>
            <Image
              src={rear}
              className={styles.shipRear}
              alt="Ship rear graphic"
            />
          </div>
          <div className={styles.shipRescueBoatContainer}>
            <Image
              src={rescueBoat}
              className={styles.shipRescueBoat}
              alt="Ship rescue boat graphic"
            />
          </div>
          <div className={styles.shipStairsUpContainer}>
            <Image
              src={stairsUp}
              className={styles.shipStairsUp}
              alt="Ship stairs up graphic"
            />
          </div>
          <div className={styles.frontContainer}>
            <span>Front</span>
          </div>
        </div>
      </div>
    </div>
  );
}
