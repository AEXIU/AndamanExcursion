import { FerryVesselLayoutProps } from "@/types/SeatSelection.types";
import styles from "./greenOceanPremiumLayout.module.css";
import Image from "next/image";
import {
  getSeatClassName,
  getSeatImage,
  GREENOCEAN_PREMIUM_SEATS,
} from "@/utils/seatMapping";
import greenOceanPremium from "@public/graphics/ferry_vessels/green_ocean/green_ocean_premium_vessel.svg";
import rescueBoat from "@public/graphics/ship_parts/rescue_boat.svg";
import stairsDown from "@public/graphics/ship_parts/stairs_down.svg";

export function GreenOceanPremiumLayout(
  props: Omit<FerryVesselLayoutProps, "operator" | "vesselClass">
) {
  const getSeatsByGroup = (groupSeats: (string | null)[]) => {
    return groupSeats.map((seatId) => {
      if (seatId === null) return null;
      return (
        props.seats.find(
          (seat) => seat.displayNumber.toUpperCase() === seatId
        ) || null
      );
    });
  };

  const renderSeatGroup = (
    groupSeats: (string | null)[],
    groupClass: string
  ) => {
    const seats = getSeatsByGroup(groupSeats);

    return (
      <div className={`${styles.seatGroup} ${styles[groupClass]}`}>
        {seats.map((seat, index) => {
          // Render empty block for null values
          if (seat === null) {
            return (
              <div
                key={`empty-${groupClass}-${index}`}
                className={styles.emptySeat}
              />
            );
          }

          // Render actual seat
          return (
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
              <span className={styles.seatNumber}>{seat.displayNumber}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.ferryContainer}>
      <Image
        src={greenOceanPremium}
        className={styles.ferryOutlineImage}
        alt="Ferry Layout"
      />
      <div className={styles.seatLayoutContainer}>
        <div className={styles.seatLayout}>
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group1, "group1")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group2, "group2")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group3, "group3")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group4, "group4")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group5, "group5")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group6, "group6")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group7, "group7")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group8, "group8")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group9, "group9")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group10, "group10")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group11, "group11")}
          {renderSeatGroup(GREENOCEAN_PREMIUM_SEATS.group12, "group12")}

          <div className={styles.shipRescueBoatContainer}>
            <Image
              src={rescueBoat}
              className={styles.shipRescueBoat}
              alt="Ship rescue boat graphic"
            />
          </div>
          <div className={styles.shipStairsDownContainer}>
            <Image
              src={stairsDown}
              className={styles.shipStairsDown}
              alt="Ship stairs down graphic"
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
