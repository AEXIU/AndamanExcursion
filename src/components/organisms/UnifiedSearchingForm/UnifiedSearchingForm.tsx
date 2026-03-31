"use client";
import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import styles from "./UnifiedSearchingForm.module.css";
// import { TAB_CONFIG } from "./config/formConfig";
// import type { BookingFormProps } from "./BookingForm.types";
import { ActivitySearchFormRQ } from "./components/ActivitySearchFormRQ";
import { FerrySearchForm } from "./components/FerrySearchForm";
import { BoatSearchForm } from "./components/BoatSearchForm";
import { Activity, TimeSlot } from "@payload-types";

interface UnifiedSearchingFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
  initialTab?: "ferry" | "local-boat" | "activities";
  hideTabs?: boolean;
  enableReactiveSearch?: boolean;
  showManualSearch?: boolean;
}

interface TabConfig {
  id: string;
  label: string;
  type: "transport" | "activity";
  locations?: Location[];
  activities?: Activity[];
  timeSlots: TimeSlot[];
}

const TAB_CONFIG: TabConfig[] = [
  {
    id: "ferry",
    label: "Ferry",
    type: "transport",
    timeSlots: [],
  },
  {
    id: "local-boat",
    label: "Local Boat",
    type: "transport",
    timeSlots: [],
  },
  {
    id: "activities",
    label: "Activities",
    type: "activity",
    timeSlots: [],
  },
];

export function UnifiedSearchingForm({
  className,
  variant = "default",
  initialTab = "ferry",
  hideTabs = false,
  enableReactiveSearch = false,
  showManualSearch = true,
}: UnifiedSearchingFormProps) {
  const [selectedTab, setSelectedTab] = useState<string>(initialTab);
  const [isTabClicked, setIsTabClicked] = useState<boolean>(false);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    setIsTabClicked(true);
  };

  // For embedded variant or when hideTabs is true, render just the form content based on selected tab
  if (variant === "embedded" || hideTabs) {
    return (
      <div
        className={`${styles.unifiedSearchingForm} ${styles[variant]} ${
          className || ""
        }`}
      >
        {initialTab === "ferry" && (
          <FerrySearchForm
            enableReactiveSearch={enableReactiveSearch}
            variant={variant}
            showManualSearch={showManualSearch}
          />
        )}
        {initialTab === "local-boat" && <BoatSearchForm variant={variant} />}
        {initialTab === "activities" && (
          <ActivitySearchFormRQ variant={variant} />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.unifiedSearchingForm} ${styles[variant]} ${
        className || ""
      }`}
    >
      <Tabs.Root
        className={styles.tabsRoot}
        value={isTabClicked ? selectedTab : undefined}
        onValueChange={handleTabChange}
      >
        <Tabs.List
          className={`${styles.tabsList} ${!isTabClicked ? styles.tabsListCollapsed : ''}`}
          aria-label="Book your travel"
        >
          {TAB_CONFIG.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              className={styles.tabsTrigger}
              value={tab.id}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {isTabClicked && (
          <>
            <Tabs.Content className={styles.tabsContent} value="ferry">
              <FerrySearchForm
                enableReactiveSearch={enableReactiveSearch}
                variant={variant}
                showManualSearch={showManualSearch}
              />
            </Tabs.Content>

            <Tabs.Content className={styles.tabsContent} value="local-boat">
              <BoatSearchForm variant={variant} />
            </Tabs.Content>

            <Tabs.Content className={styles.tabsContent} value="activities">
              <ActivitySearchFormRQ variant={variant} />
            </Tabs.Content>
          </>
        )}
      </Tabs.Root>
    </div>
  );
}
