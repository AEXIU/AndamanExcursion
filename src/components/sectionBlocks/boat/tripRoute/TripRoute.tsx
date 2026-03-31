import React from "react";
import { Section } from "@/components/layout";
import Image from "next/image";
import andamanMap from "@public/graphics/andaman-map.svg";
import styles from "./TripRoute.module.css";

interface RoutePoint {
    name: string;
    order: number;
}

export interface TripRouteContent {
    title: string;
    specialWord?: string;
    description?: string;
    routePoints?: RoutePoint[];
}

interface TripRouteProps {
    id?: string;
    content: TripRouteContent;
}

export const TripRoute: React.FC<TripRouteProps> = ({ id, content }) => {
    const { title, specialWord, description } = content;

    // Split title to highlight special word if present
    const renderTitle = () => {
        if (!specialWord) return title;

        const parts = title.split(specialWord);
        if (parts.length === 1) {
            return (
                <>
                    {title} <span className={styles.specialWord}>{specialWord}</span>
                </>
            );
        }

        return (
            <>
                {parts[0]}
                <span className={styles.specialWord}>{specialWord}</span>
                {parts[1]}
            </>
        );
    };

    return (
        <Section
            id={id || "trip-route"}
            className={styles.section}
            aria-labelledby="trip-route-title"
        >
            <div className={styles.content}>
                {description && <p className={styles.description}>{description}</p>}

                <div className={styles.mapContainer}>
                    <Image
                        src={andamanMap}
                        alt="Andaman Islands trip route map showing boat routes between Port Blair, Ross Island, Havelock Island, and Neil Island"
                        className={styles.mapImage}
                        priority={false}
                    />
                </div>
            </div>
        </Section>
    );
};
