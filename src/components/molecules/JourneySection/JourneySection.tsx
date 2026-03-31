"use client";
import React, { useRef, useEffect, useCallback, useState } from 'react';
import Image from "next/image";
import { SectionTitle } from "@/components/atoms";
import { Container } from "@/components/layout";
import styles from "./JourneySection.module.css";

interface Milestone {
  id?: string;
  year: string;
  title: string;
  description: string;
}

interface JourneySectionContent {
  title?: string;
  subtitle?: string;
  milestones: Milestone[];
}

interface JourneySectionProps {
  content: JourneySectionContent;
}

export function JourneySection({ content }: JourneySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const boatRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  // Track active index in ref (sync reads) + state (React renders for dot visibility)
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const milestones = content?.milestones ?? [];
  const n = milestones.length;
  const lineWidth = n > 1 ? (n - 1) * 400 : 0;

  // ── Boat position logic ──
  const updateBoatPosition = useCallback(() => {
    const wrapper = scrollRef.current;
    const boat = boatRef.current;
    const firstItem = firstItemRef.current;
    if (!wrapper || !boat || !firstItem || n === 0) return;

    const firstDotContentX = firstItem.offsetLeft + 28.5;

    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    const progress = maxScroll > 0 ? wrapper.scrollLeft / maxScroll : 0;
    const newIdx = Math.min(n - 1, Math.round(progress * (n - 1)));

    if (newIdx !== activeIndexRef.current) {
      activeIndexRef.current = newIdx;
      setActiveIndex(newIdx);
      boat.style.left = `${firstDotContentX + newIdx * 400 - 28.5}px`;
    }
  }, [n]);

  useEffect(() => {
    const wrapper = scrollRef.current;
    if (!wrapper) return;

    // After layout: set the initial boat position on milestone 0
    const rafId = requestAnimationFrame(() => {
      if (boatRef.current && firstItemRef.current) {
        const firstDotContentX = firstItemRef.current.offsetLeft + 28.5;
        boatRef.current.style.left = `${firstDotContentX - 28.5}px`;
      }
    });

    // ── Wheel handler with scroll trapping ──
    // Uses { passive: false } so we can call preventDefault() to trap ALL page scrolling.
    // cardInner has overflow:hidden in CSS — we manually scroll it via JS.
    const handleWheel = (e: WheelEvent) => {
      if (!wrapper) return;

      const delta = e.deltaY;
      if (delta === 0) return;

      // Always prevent page scroll when cursor is in the Journey section
      e.preventDefault();

      // Check if cursor is over a card with overflowing text
      const target = e.target as HTMLElement;
      const cardInner = target.closest('[data-card-scroll]') as HTMLElement | null;

      if (cardInner) {
        const isScrollable = cardInner.scrollHeight > cardInner.clientHeight + 1;

        if (isScrollable) {
          const atTop = cardInner.scrollTop <= 1 && delta < 0;
          const atBottom = cardInner.scrollTop + cardInner.clientHeight >= cardInner.scrollHeight - 1 && delta > 0;

          // If the card can still scroll in the wheel direction, scroll it
          if (!atTop && !atBottom) {
            cardInner.scrollTop += delta;
            return;
          }
        }
      }

      // Otherwise scroll the section horizontally
      wrapper.scrollLeft += delta;
    };

    wrapper.addEventListener('scroll', updateBoatPosition, { passive: true });
    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (boatRef.current && firstItemRef.current) {
        const firstDotContentX = firstItemRef.current.offsetLeft + 28.5;
        boatRef.current.style.left = `${firstDotContentX + activeIndexRef.current * 400 - 28.5}px`;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      wrapper.removeEventListener('scroll', updateBoatPosition);
      wrapper.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateBoatPosition]);

  if (n === 0) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (scrollRef.current) {
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeftPos.current = scrollRef.current.scrollLeft;
    }
  };
  const handleMouseLeave = () => { isDragging.current = false; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeftPos.current - (x - startX.current) * 2;
  };

  return (
    <section className={styles.root} aria-label="Our Journey">
      <Container className={styles.header}>
        <SectionTitle text={content.title || "Our Journey"} specialWord="Journey" />
      </Container>

      <div
        className={styles.scrollWrapper}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className={styles.track}>
          {/*
            Boat is INSIDE the track so it scrolls with the content.
            Its `left` (in track content coords) only changes when activeIndex changes.
            CSS transition handles smooth animation between milestones.
          */}
          <div className={styles.movingBoat} ref={boatRef} aria-hidden="true">
            <Image src="/icons/misc/boat.svg" alt="" width={57} height={50} className={styles.shipImg} />
          </div>

          {milestones.map((m, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={`milestone-${i}`}
                ref={i === 0 ? firstItemRef : null}
                className={`${styles.item} ${i === 0 ? styles.itemFirst : ""}`}
              >
                {i === 0 && <div className={styles.dashedLine} style={{ width: lineWidth }} />}

                <div className={styles.yearRow}>
                  <span className={`${styles.year} ${isActive ? styles.yearActive : ""}`}>
                    {m.year}
                  </span>
                  {/* Dot fades when boat is on this milestone */}
                  <div className={`${styles.dotWrapper} ${isActive ? styles.dotHidden : ""}`} aria-hidden="true">
                    <div className={styles.dot} />
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardInner} data-card-scroll>
                    <h3 className={styles.cardTitle}>{m.title}</h3>
                    <p className={styles.cardDesc}>{m.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
