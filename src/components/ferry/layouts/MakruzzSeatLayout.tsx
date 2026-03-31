import { FerryVesselLayoutProps, Seat } from "@/types/SeatSelection.types";
import styles from "./makruzzLayout.module.css";
import Image from "next/image";
import {
    getSeatClassName,
    getSeatImage,
    MAKRUZZ_PEARL_PREMIUM_SEATS,
    MAKRUZZ_PREMIUM_SEATS,
    MAKRUZZ_DELUXE_SEATS,
    MAKRUZZ_GOLD_PREMIUM_SEATS,
    MAKRUZZ_GOLD_DELUXE_SEATS,
} from "@/utils/seatMapping";
import makruzzPearlVessel from "@public/graphics/ferry_vessels/makruzz/makruzz_pearl_vessel.svg";
import stairsDown from "@public/graphics/ship_parts/stairs_down.svg";

interface MakruzzLayoutProps extends Omit<FerryVesselLayoutProps, "operator" | "vesselClass"> {
    vesselClass: string;
    operator?: string;
}

export function MakruzzSeatLayout({ seats, selectedSeats, onSeatSelect, vesselClass, operator }: MakruzzLayoutProps) {
    const isPearl = operator === "makruzz_pearl";
    const isGold = operator === "makruzz_gold";
    const isDeluxeOrRoyal = (vesselClass?.toLowerCase() === "deluxe" || vesselClass?.toLowerCase() === "royal") && !isPearl;

    // Pick the correct seat mapping
    const pearlMapping = MAKRUZZ_PEARL_PREMIUM_SEATS;
    const regularMapping = MAKRUZZ_PREMIUM_SEATS; // This is for the "Premium" class, not Pearl
    const deluxeMapping = MAKRUZZ_DELUXE_SEATS;
    const goldMapping = MAKRUZZ_GOLD_PREMIUM_SEATS;
    const goldDeluxeMapping = MAKRUZZ_GOLD_DELUXE_SEATS;

    const currentSeatMapping = isGold ? (isDeluxeOrRoyal ? goldDeluxeMapping : goldMapping) : (isPearl ? pearlMapping : (isDeluxeOrRoyal ? deluxeMapping : regularMapping));

    const getSeatsByGroup = (groupSeats: (string | null)[]) => {
        return groupSeats.map((seatId) => {
            if (seatId === null) return null;

            const foundSeat = seats.find(
                (seat) => (seat.displayNumber || seat.id).toUpperCase() === seatId
            );

            if (foundSeat) return foundSeat;

            // If the seat is defined in the layout map but wasn't returned by the API
            // (i.e. it belongs to another class), mock it as a blocked seat so it still renders.
            return {
                id: seatId,
                number: seatId,
                displayNumber: seatId,
                status: "blocked",
            } as Seat;
        });
    };

    const renderSeatGroup = (
        groupSeats: (string | null)[],
        groupClass: string
    ) => {
        const seatList = getSeatsByGroup(groupSeats);

        return (
            <div className={`${styles.seatGroup} ${styles[groupClass]}`}>
                {seatList.map((seat, index) => {
                    if (seat === null) {
                        return (
                            <div
                                key={`empty-${groupClass}-${index}`}
                                className={styles.emptySeat}
                            />
                        );
                    }

                    const isSelected = selectedSeats.includes(seat.id);

                    // Determine if seat belongs to a different class than the passenger's booking class
                    const seatIdent = (seat.displayNumber || seat.id).toUpperCase();
                    const isWrongClass =
                        (vesselClass.toLowerCase() === "deluxe" && seatIdent.startsWith("R")) ||
                        (vesselClass.toLowerCase() === "royal" && seatIdent.startsWith("D"));

                    const displaySeat = isSelected
                        ? { ...seat, status: "selected" as const }
                        : isWrongClass
                            ? { ...seat, status: "blocked" as const }
                            : seat;

                    return (
                        <div
                            key={seat.id}
                            className={getSeatClassName(displaySeat)}
                            onClick={() => {
                                if (displaySeat.status !== "booked" && displaySeat.status !== "blocked") {
                                    onSeatSelect(displaySeat.id);
                                }
                            }}
                        >
                            <Image
                                src={getSeatImage(displaySeat)}
                                alt={`Seat ${seat.displayNumber || seat.id}`}
                                className={styles.seatImage}
                                draggable={false}
                            />
                            <span className={styles.seatNumber}>{seat.displayNumber || seat.id}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ─── MAKRUZZ GOLD (Deluxe & Royal) Layout ───────────────────────────────
    if (isGold && isDeluxeOrRoyal) {
        return (
            <div className={styles.ferryContainer}>
                <Image
                    src={makruzzPearlVessel}
                    className={styles.ferryOutlineImage}
                    alt="Makruzz Gold Deluxe/Royal Layout"
                />
                <div className={styles.seatLayoutContainer}>
                    <div className={styles.goldDeluxeSeatLayout}>
                        <div className={styles.goldDeluxeFrontContainer}>
                            <span>Front</span>
                        </div>

                        {renderSeatGroup(goldDeluxeMapping.groupA, "goldDeluxeGroupA")}
                        {renderSeatGroup(goldDeluxeMapping.groupB, "goldDeluxeGroupB")}
                        {renderSeatGroup(goldDeluxeMapping.groupC, "goldDeluxeGroupC")}

                        <div className={styles.goldDeluxeSectionGap} />

                        {renderSeatGroup(goldDeluxeMapping.groupD, "goldDeluxeGroupD")}
                        {renderSeatGroup(goldDeluxeMapping.groupE, "goldDeluxeGroupE")}
                    </div>
                </div>
            </div>
        );
    }

    // ─── MAKRUZZ GOLD (Premium) Layout ───────────────────────────────
    if (isGold) {
        return (
            <div className={styles.ferryContainer}>
                <Image
                    src={makruzzPearlVessel}
                    className={styles.ferryOutlineImage}
                    alt="Makruzz Gold Layout"
                />
                <div className={styles.seatLayoutContainer}>
                    <div className={styles.goldSeatLayout}>
                        <div className={styles.goldFrontContainer}>
                            <span>Front</span>
                        </div>

                        {/* Upper Section */}
                        {renderSeatGroup(goldMapping.groupA, "goldGroupA")}
                        {renderSeatGroup(goldMapping.groupB, "goldGroupB")}
                        {renderSeatGroup(goldMapping.groupC, "goldGroupC")}

                        <div className={styles.goldSectionGap} />

                        {/* Lower Section */}
                        {renderSeatGroup(goldMapping.groupD, "goldGroupD")}
                        {renderSeatGroup(goldMapping.groupE, "goldGroupE")}
                        {renderSeatGroup(goldMapping.groupF, "goldGroupF")}
                    </div>
                </div>
            </div>
        );
    }

    // ─── MAKRUZZ REGULAR (Deluxe & Royal) Layout ───────────────────────────────
    if (isDeluxeOrRoyal) {
        return (
            <div className={styles.ferryContainer}>
                <Image
                    src={makruzzPearlVessel}
                    className={styles.ferryOutlineImage}
                    alt="Makruzz Deluxe/Royal Layout"
                />
                <div className={styles.seatLayoutContainer}>
                    <div className={styles.deluxeSeatLayout}>
                        <div className={styles.deluxeFrontContainer}>
                            <span>Front</span>
                        </div>

                        {renderSeatGroup(deluxeMapping.groupA, "deluxeGroupA")}
                        {renderSeatGroup(deluxeMapping.groupB, "deluxeGroupB")}
                        {renderSeatGroup(deluxeMapping.groupC, "deluxeGroupC")}

                        <div className={styles.deluxeRoyalSpacer} />

                        {renderSeatGroup(deluxeMapping.groupD, "royalGroupD")}
                        {renderSeatGroup(deluxeMapping.groupE, "royalGroupE")}
                    </div>
                </div>
            </div>
        );
    }

    // ─── MAKRUZZ REGULAR (Premium) Layout ───────────────────────────────
    if (!isPearl) { // This condition means it's not Pearl and not Deluxe/Royal, so it must be Premium
        return (
            <div className={styles.ferryContainer}>
                <Image
                    src={makruzzPearlVessel}
                    className={styles.ferryOutlineImage}
                    alt="Makruzz Layout"
                />
                <div className={styles.seatLayoutContainer}>
                    <div className={styles.regularSeatLayout}>
                        {/* Upper section — inner groups start 1 row above outer groups */}
                        {renderSeatGroup(regularMapping.groupA, "regularGroupA")}
                        {renderSeatGroup(regularMapping.groupB, "regularGroupB")}
                        {renderSeatGroup(regularMapping.groupC, "regularGroupC")}
                        {renderSeatGroup(regularMapping.groupD, "regularGroupD")}

                        {/* Gap / aisle between sections */}
                        <div className={styles.regularSectionGap} />

                        {/* Lower section — wider with 4-col groups */}
                        {renderSeatGroup(regularMapping.groupE, "regularGroupE")}
                        {renderSeatGroup(regularMapping.groupF, "regularGroupF")}

                        {/* Front label */}
                        <div className={styles.regularFrontContainer}>
                            <span>Front</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── MAKRUZZ PEARL (Premium) Layout (Original Default) ───────────────────────────────
    return (
        <div className={styles.ferryContainer}>
            <Image
                src={makruzzPearlVessel}
                className={styles.ferryOutlineImage}
                alt="Makruzz Pearl Layout"
            />
            <div className={styles.seatLayoutContainer}>
                <div className={styles.seatLayout}>
                    {/* Upper Deck - Groups 1-4 */}
                    {renderSeatGroup(pearlMapping.group1, "group1")}
                    {renderSeatGroup(pearlMapping.group2, "group2")}
                    {renderSeatGroup(pearlMapping.group3, "group3")}
                    {renderSeatGroup(pearlMapping.group4, "group4")}

                    {/* Gap between decks */}
                    <div className={styles.shipStairsContainer} />

                    {/* Lower Deck - Groups 5-10 */}
                    {renderSeatGroup(pearlMapping.group5, "group5")}
                    {renderSeatGroup(pearlMapping.group6, "group6")}
                    {renderSeatGroup(pearlMapping.group7, "group7")}
                    {renderSeatGroup(pearlMapping.group8, "group8")}
                    {renderSeatGroup(pearlMapping.group9, "group9")}
                    {renderSeatGroup(pearlMapping.group10, "group10")}

                    {/* Front label */}
                    <div className={styles.frontContainer}>
                        <span>Front</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
