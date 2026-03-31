import React from "react";
import { Button } from "@/components/atoms";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { ArrowLeft, Clock, Calendar, MapPin, Ship } from "lucide-react";
import styles from "./FerryHeader.module.css";

interface FerryHeaderProps {
  ferry: UnifiedFerryResult;
  onBack: () => void;
}

export const FerryHeader: React.FC<FerryHeaderProps> = ({ ferry, onBack }) => {
  return (
    <header className={styles.pageHeader}>
      <Button
        variant="secondary"
        onClick={onBack}
        className={styles.backButton}
      >
        <ArrowLeft size={16} />
        Back to Results
      </Button>

      <div className={styles.ferryHeaderInfo}>
        <div className={styles.ferryTitle}>
          <Ship className={styles.ferryIcon} size={24} />
          <h1>{ferry.ferryName}</h1>
          <span className={styles.operatorBadge}>{ferry.operator}</span>
        </div>

        <div className={styles.journeyDetails}>
          <div className={styles.journeyItem}>
            <MapPin size={16} />
            <span>
              {ferry.route.from.name} → {ferry.route.to.name}
            </span>
          </div>
          <div className={styles.journeyItem}>
            <Clock size={16} />
            <span>
              {ferry.schedule.departureTime} - {ferry.schedule.arrivalTime}
            </span>
          </div>
          <div className={styles.journeyItem}>
            <Calendar size={16} />
            <span>{ferry.schedule.date}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FerryHeader;
