import { FerryVesselLayoutProps } from "@/types/SeatSelection.types";
import styles from "./greenOceanRoyalLayout.module.css";
import Image from "next/image";
import {
  getSeatClassName,
  getSeatImage,
  GREENOCEAN_ROYAL_SEATS,
} from "@/utils/seatMapping";
import greenOceanRoyal from "@public/graphics/ferry_vessels/green_ocean/green_ocean_royal_vessel.svg";
import rescueBoat from "@public/graphics/ship_parts/rescue_boat.svg";
import stairsDown from "@public/graphics/ship_parts/stairs_down.svg";
import wheelHouse from "@public/graphics/ship_parts/wheel_house.svg";
import cafe from "@public/graphics/ship_parts/cafe.svg";

export function GreenOceanRoyalLayout(
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
        src={greenOceanRoyal}
        className={styles.ferryOutlineImage}
        alt="Ferry Layout"
      />
      <div className={styles.seatLayoutContainer}>
        <div className={styles.seatLayout}>
          {renderSeatGroup(GREENOCEAN_ROYAL_SEATS.group1, "group1")}
          {renderSeatGroup(GREENOCEAN_ROYAL_SEATS.group2, "group2")}
          {renderSeatGroup(GREENOCEAN_ROYAL_SEATS.group3, "group3")}
          {renderSeatGroup(GREENOCEAN_ROYAL_SEATS.group4, "group4")}

          <div className={styles.shipRescueBoatContainer}>
            <Image
              src={rescueBoat}
              className={styles.shipRescueBoat}
              alt="Ship rescue boat graphic"
            />
          </div>
          <div className={styles.shipWheelHouseContainer}>
            <Image
              src={wheelHouse}
              className={styles.shipWheelHouse}
              alt="Ship wheel house graphic"
            />
          </div>
          <div className={styles.cafeContainer}>
            <Image
              src={cafe}
              className={styles.cafe}
              alt="Ship wheel house graphic"
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
