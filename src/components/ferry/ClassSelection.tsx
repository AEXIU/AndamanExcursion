import React from "react";
import { FerryClass } from "@/types/FerryBookingSession.types";
import { Users, CheckCircle } from "lucide-react";
import { getAmenityIcon } from "@/utils/amenityIconMapping";
import styles from "./ClassSelection.module.css";
import { SectionTitle } from "../atoms";

interface ClassSelectionProps {
  classes: FerryClass[];
  selectedClass: FerryClass | null;
  onClassSelect: (classData: FerryClass) => void;
}

export const ClassSelection: React.FC<ClassSelectionProps> = ({
  classes,
  selectedClass,
  onClassSelect,
}) => {
  return (
    <section className={styles.section}>
      <SectionTitle
        text="Choose your class"
        specialWord="class"
        headingLevel="h2"
        titleTextClasses={styles.sectionTitle}
        className={styles.sectionTitleContainer}
      />

      <div className={styles.classGrid}>
        {classes.map((ferryClass) => (
          <div
            key={ferryClass.id}
            className={`${styles.classCard} ${
              selectedClass?.id === ferryClass.id ? styles.selected : ""
            }`}
            onClick={() => onClassSelect(ferryClass)}
          >
            <div className={styles.classCardHeader}>
              <div className={styles.classInfo}>
                <h3 className={styles.className}>{ferryClass.name}</h3>
                <div className={styles.seatsInfo}>
                  <Users size={14} />
                  <span>{ferryClass.availableSeats} seats available</span>
                </div>
              </div>
              <div className={styles.classPricing}>
                <div className={styles.classPrice}>₹{ferryClass.price}</div>
                <div className={styles.priceLabel}>per person</div>
              </div>
            </div>

            {ferryClass.amenities && ferryClass.amenities.length > 0 && (
              <div className={styles.amenitiesContainer}>
                {ferryClass.amenities.map((amenity, i) => {
                  const amenityMapping = getAmenityIcon(amenity);
                  const IconComponent = amenityMapping.icon;
                  return (
                    <div key={i} className={styles.amenityItem}>
                      <IconComponent
                        size={14}
                        className={amenityMapping.color}
                      />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClassSelection;
