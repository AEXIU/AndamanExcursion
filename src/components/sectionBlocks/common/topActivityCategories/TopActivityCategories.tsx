import { DescriptionText, SectionTitle } from "@/components/atoms";
import { Column, Grid, Section } from "@/components/layout";
import { SmallCard } from "@/components/molecules/Cards";
import React from "react";
import { Media } from "@payload-types";
import { TopActivityCategoriesProps } from "./TopActivityCategoriesProps.types";

export const TopActivityCategories = ({
  content,
}: TopActivityCategoriesProps) => {
  return (
    <Section id="activityCategories" noPadding>
      <Column
        gap={3}
        alignItems="start"
        justifyContent="start"
        fullWidth
        responsive
        responsiveGap="var(--space-4)"
        responsiveAlignItems="start"
      >
        <SectionTitle
          text={content.title}
          specialWord={content.specialWord}
          id="activity-category-title"
          headingLevel="h1"
        />
        <DescriptionText text={content.description} />
        <Grid
          columns={{ desktop: 3, tablet: 2, mobile: 1 }}
          gap={3}
          role="grid"
          ariaLabel="Available water activities"
        >
          {content.activityCategories.map((activity) => {
            return (
              <SmallCard
                key={activity.slug}
                image={activity.image as Media}
                title={activity.name}
                description={activity.description}
                href={`/activities/search?activityType=${activity.slug}`}
              />
            );
          })}
        </Grid>
      </Column>
    </Section>
  );
};
