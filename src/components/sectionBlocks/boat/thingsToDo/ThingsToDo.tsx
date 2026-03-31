import React from "react";
import { Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { Media } from "@payload-types";
import Image from "next/image";
import { getImageUrl } from "@/utils/getImageUrl";
import styles from "./ThingsToDo.module.css";

interface ThingsToDoImage {
    image: Media | string;
    alt: string;
}

export interface ThingsToDoContent {
    title: string;
    specialWord: string;
    images: ThingsToDoImage[];
}

interface ThingsToDoProps {
    id?: string;
    content: ThingsToDoContent;
}

export const ThingsToDo: React.FC<ThingsToDoProps> = ({ id, content }) => {
    const { title, specialWord, images } = content;

    if (!images || images.length < 3) return null;

    const getImgSrc = (img: ThingsToDoImage) => {
        if (typeof img.image === "string") return img.image;
        return getImageUrl(img.image) || "";
    };

    // Build full title text that includes the special word
    const fullTitle = `${title} ${specialWord}`;

    return (
        <Section
            id={id || "things-to-do"}
            className={styles.section}
            aria-labelledby="things-to-do-title"
        >

            <div className={styles.content}>
                <div className={styles.collageGrid}>
                    {/* Left - portrait image */}
                    <div className={styles.imageLeft}>
                        <Image
                            src={getImgSrc(images[0])}
                            alt={images[0].alt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 992px) 50vw, 30vw"
                            className={styles.image}
                        />
                    </div>

                    {/* Center - title + landscape image */}
                    <div className={styles.centerColumn}>
                        <div className={styles.titleWrapper}>
                            <SectionTitle
                                text={fullTitle}
                                specialWord={specialWord}
                                id="things-to-do-title"
                                className={styles.sectionTitle}
                                specialWordStyles={styles.specialWordBlock}
                            />
                        </div>
                        <div className={styles.imageCenter}>
                            <Image
                                src={getImgSrc(images[1])}
                                alt={images[1].alt}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 992px) 100vw, 40vw"
                                className={styles.image}
                            />
                        </div>
                    </div>

                    {/* Right - portrait image */}
                    <div className={styles.imageRight}>
                        <Image
                            src={getImgSrc(images[2])}
                            alt={images[2].alt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 992px) 50vw, 30vw"
                            className={styles.image}
                        />
                    </div>
                </div>
            </div>
        </Section>
    );
};
