import React from "react";
import { Row, Section } from "@/components/layout";
import { StatCard } from "@/components/molecules/Cards";
import styles from "./TrustStats.module.css";
import { SectionTitle } from "@/components/atoms";
import { TrustStatsProps } from "./TrustStats.types";
import DecorativeCurlyArrow from "@/components/atoms/DecorativeCurlyArrow/DecorativeCurlyArrow";

export const TrustStats = ({ content }: TrustStatsProps) => {
  const { title, stats } = content;

  return (
    <Section
      className={styles.trustStatsSection}
      aria-labelledby="trust-stats-title"
      id="trust-stats"
      fullBleed
    >
      <Row
        fullWidth
        justifyContent="between"
        alignItems="center"
        wrap
        className={styles.mainRow}
      >
        <SectionTitle
          specialWord={title.specialWord}
          text={title.text}
          id="trust-stats-title"
        />
        <DecorativeCurlyArrow top="20%" left="30%" />

        <Row
          gap="var(--space-2)"
          justifyContent="between"
          alignItems="center"
          wrap
          className={styles.statsContainer}
        >
          {stats.map((stat, index) => (
            <React.Fragment key={`stat-${index}`}>
              <StatCard
                value={stat.value}
                description={stat.description}
                icon={stat.icon as "users" | "ferry" | "island"}
              />
              {index !== stats.length - 1 && (
                <div className={styles.divider} aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </Row>
      </Row>
    </Section>
  );
};
