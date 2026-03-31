import React from "react";
import { TripPlanningForm } from "./components/TripPlanningForm";
import { Container } from "@/components/layout";
import { pageService } from "@/services/payload";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import styles from "./page.module.css";

export default async function TripPlanningPage() {
  // Get page data from CMS
  let tripPlanningPage = null;

  try {
    // Try to get the trip planning page from CMS
    tripPlanningPage = await pageService.getBySlug("plan-your-trip");
  } catch (error) {
    console.error("Error fetching trip planning page:", error);
  }

  // If no page found, render with just the form
  if (!tripPlanningPage) {
    return (
      <Container noPadding className={styles.container}>
        <TripPlanningForm />
      </Container>
    );
  }

  // Prepare blocks for rendering
  const pageBlocks = tripPlanningPage?.pageContent?.content || [];

  return (
    <Container noPadding className={styles.container}>
      <TripPlanningForm />

      {pageBlocks.length > 0 && <BlockRenderer blocks={pageBlocks as any} />}
    </Container>
  );
}

// Generate metadata from CMS
export async function generateMetadata() {
  try {
    const tripPlanningPage = await pageService.getBySlug("trip-planning");

    if (!tripPlanningPage) {
      return {
        title: "Plan Your Trip | Andaman Excursion",
        description:
          "Plan your perfect Andaman adventure with our trip planning tools.",
      };
    }

    return {
      title:
        tripPlanningPage.meta?.title || "Plan Your Trip | Andaman Excursion",
      description:
        tripPlanningPage.meta?.description ||
        "Plan your perfect Andaman adventure with our trip planning tools.",
      // keywords: tripPlanningPage.meta?.keywords,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Plan Your Trip | Andaman Excursion",
      description:
        "Plan your perfect Andaman adventure with our trip planning tools.",
    };
  }
}
