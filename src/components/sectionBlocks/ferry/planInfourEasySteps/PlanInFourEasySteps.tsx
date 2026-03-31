import { DescriptionText, SectionTitle } from "@/components/atoms";

import React from "react";
import styles from "./PlanInFourEasySteps.module.css";
import { Column, Row, Section } from "@/components/layout";
import { Step } from "@/components/atoms";
import Image from "next/image";
import stepsWave from "@public/graphics/stepsWave.svg";
import { PlanInFourEasyStepsContent } from "./PlanInFourEasySteps.types";

export const PlanInFourEasySteps = ({
  content,
}: {
  content: PlanInFourEasyStepsContent;
}) => {
  return (
    <Section
      className={styles.planInFourEasyStepsSection}
      id="plan-in-four-easy-steps"
      aria-labelledby="plan-in-four-easy-steps-title"
      fullBleed
    >
      <Image
        src={stepsWave}
        alt="steps wave"
        fill
        className={styles.stepsWave}
      />
      <Column
        fullWidth
        gap="var(--space-10)"
        className={styles.contentContainer}
        responsive
        responsiveGap="var(--space-4)"
        responsiveAlignItems="start"
      >
        <Row
          fullWidth
          justifyContent="between"
          className={styles.titleContainer}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <SectionTitle
            specialWord={content.specialWord}
            text={content.title}
            id="plan-in-four-easy-steps-title"
          />
          <DescriptionText
            text={content.description}
            align="right"
            className={styles.description}
          />
        </Row>
        <Row fullWidth className={styles.stepsContainer}>
          <div className={styles.stepsWrapper}>
            <div className={styles.steps}>
              {content.steps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  position={index % 2 === 0 ? "top" : "bottom"}
                />
              ))}
            </div>
          </div>
        </Row>
      </Column>
    </Section>
  );
};