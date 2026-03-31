import React from "react";
import * as Tabs from "@radix-ui/react-tabs";

import type { PayloadPackage } from "./PackageDetailTabs.types";

import styles from "./PackageDetailTabs.module.css";
import { OverviewTab } from "./tabs/OverviewTab/OverviewTab";
import { ItineraryTab } from "./tabs/ItineraryTab/ItineraryTab";
import { WhatsCoveredTab } from "./tabs/WhatsCoveredTab/WhatsCoveredTab";

export const PackageDetailTabs: React.FC<{ packageData: PayloadPackage }> = ({
  packageData,
}) => {
  // Extract itinerary from packageData
  const itinerary = packageData.packageDetails?.itinerary;

  // Extract includes/excludes from packageData
  const includes = packageData.packageDetails?.inclusions;
  const excludes = packageData.packageDetails?.exclusions;
  const notes = packageData.packageDetails?.notes;

  return (
    <Tabs.Root
      className={styles.tabsRoot}
      defaultValue="overview"
      orientation="vertical"
    >
      <Tabs.List className={styles.tabsList} aria-label="Package details">
        <Tabs.Trigger
          className={styles.tabsTrigger}
          value="overview"
          aria-controls="overview-tab"
        >
          Overview
        </Tabs.Trigger>
        <Tabs.Trigger
          className={styles.tabsTrigger}
          value="itinerary"
          aria-controls="itinerary-tab"
          disabled={!itinerary || itinerary.length === 0}
        >
          Itinerary
        </Tabs.Trigger>
        <Tabs.Trigger
          className={styles.tabsTrigger}
          value="whats-covered"
          aria-controls="whats-covered-tab"
          disabled={
            (!includes || includes.length === 0) &&
            (!excludes || excludes.length === 0)
          }
        >
          What's Covered
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content
        className={styles.tabsContent}
        value="overview"
        id="overview-tab"
        role="tabpanel"
        aria-labelledby="overview"
      >
        <OverviewTab packageData={packageData} />
      </Tabs.Content>

      <Tabs.Content
        className={styles.tabsContent}
        value="itinerary"
        id="itinerary-tab"
        role="tabpanel"
        aria-labelledby="itinerary"
      >
        <ItineraryTab itinerary={itinerary} />
      </Tabs.Content>

      <Tabs.Content
        className={styles.tabsContent}
        value="whats-covered"
        id="whats-covered-tab"
        role="tabpanel"
        aria-labelledby="whats-covered"
      >
        <WhatsCoveredTab
          includes={includes}
          excludes={excludes}
          notes={notes}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};
