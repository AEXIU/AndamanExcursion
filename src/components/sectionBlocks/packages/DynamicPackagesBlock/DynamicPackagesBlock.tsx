// components/sectionBlocks/packages/DynamicPackagesBlock/DynamicPackagesBlock.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Section, Column } from "@/components/layout";
import { PackageSelector } from "@/components/molecules/PackageSelector/PackageSelector";
import { PackageCard } from "@/components/molecules/Cards/PackageCard/PackageCard";
import {
  DescriptionText,
  SectionTitle,
} from "@/components/atoms";
import { useClientSearchParams } from "@/hooks/useClientSearchParams";

interface DynamicPackagesBlockProps {
  id?: string;
  content: {
    title?: string;
    description?: string;
    specialWord?: string;
    showPackageSelector?: boolean;
    selectorTitle?: string;
    categoryFilter?: {
      useCustomSelection?: boolean;
      selectedCategories?: any[];
      sortBy?: string;
    };
    styling?: {
      backgroundColor?: string;
      spacing?: string;
    };
    // Injected server-side data
    packageOptions: any[];
    periodOptions: any[];
    packageCategoriesContent: any[];
  };
}

export const DynamicPackagesBlock: React.FC<DynamicPackagesBlockProps> = ({
  id,
  content: {
    title = "Our Packages",
    description = "Crafted Just For You!",
    specialWord = "Packages",
    showPackageSelector = true,
    selectorTitle = "Choosen Package",
    categoryFilter,
    styling,
    packageOptions,
    periodOptions,
    packageCategoriesContent,
  },
}) => {
  const { searchParams, SearchParamsLoader, getParam } =
    useClientSearchParams();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  // Filter and sort categories based on CMS settings
  const getFilteredCategories = (categories: any[]) => {
    let filtered = categories;

    // Apply custom selection if enabled
    if (
      categoryFilter?.useCustomSelection &&
      categoryFilter?.selectedCategories?.length &&
      categoryFilter?.selectedCategories?.length > 0
    ) {
      const selectedIds = categoryFilter.selectedCategories.map((cat) =>
        typeof cat === "string" ? cat : cat.id
      );
      filtered = categories.filter((cat) => selectedIds.includes(cat.id));
    }

    // Apply sorting
    if (categoryFilter?.sortBy) {
      switch (categoryFilter.sortBy) {
        case "title":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "createdAt_desc":
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "createdAt_asc":
          filtered.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        // 'custom' uses the order from CMS or existing order
      }
    }

    return filtered;
  };

  const [filteredCategories, setFilteredCategories] = useState(() =>
    getFilteredCategories(packageCategoriesContent)
  );

  // Sync with URL params
  useEffect(() => {
    const period = getParam("period") || "all";
    setSelectedPeriod(period);
  }, [searchParams, getParam]);

  // Filter categories based on period (if needed)
  useEffect(() => {
    let categories = packageCategoriesContent;

    if (selectedPeriod === "all") {
      categories = packageCategoriesContent;
    } else {
      // You might want to implement category filtering by period here
      // For now, we'll show all categories regardless of period
      categories = packageCategoriesContent;
    }

    // Apply CMS filters and sorting
    setFilteredCategories(getFilteredCategories(categories));
  }, [selectedPeriod, packageCategoriesContent, categoryFilter]);

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);

    // Update URL
    const params = new URLSearchParams(searchParams || "");
    if (periodId === "all") {
      params.delete("period");
    } else {
      params.set("period", periodId);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/packages?${queryString}` : "/packages";
    router.push(newUrl, { scroll: false });
  };

  // Generate CSS classes based on styling options
  const getSectionClasses = () => {
    const classes = [];

    if (styling?.backgroundColor && styling.backgroundColor !== "default") {
      classes.push(`bg-${styling.backgroundColor}`);
    }

    if (styling?.spacing && styling.spacing !== "default") {
      classes.push(`spacing-${styling.spacing}`);
    }

    return classes.join(" ");
  };

  return (
    <>
      <SearchParamsLoader />

      {/* Package Selector Section */}
      {showPackageSelector && (
        <Section
          id={id ? `${id}-selector` : undefined}
          className={getSectionClasses()}
        >
          <Column
            gap={3}
            justifyContent="start"
            alignItems="start"
            fullWidth
            style={{ minHeight: "150px" }}
          >
            <SectionTitle headingLevel="h1" text={selectorTitle} />
            <PackageSelector
              packageOptions={packageOptions}
              periodOptions={periodOptions}
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              showPackageSelector={true}
            />
          </Column>
        </Section>
      )}

      {/* Packages Grid Section */}
      <Section id={id} className={getSectionClasses()}>
        <Column
          gap={7}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <Column
            gap={3}
            alignItems="start"
            justifyContent="start"
            responsive
            responsiveGap="var(--space-4)"
          >
            <SectionTitle text={title} specialWord={specialWord} />
            <DescriptionText text={description} />
          </Column>

          <Column>
            {filteredCategories.map((category) => (
              <PackageCard
                key={category.id}
                title={category.title}
                description={category.description}
                media={category.media}
                href={`/packages/${category.slug}${
                  selectedPeriod !== "all" ? `?period=${selectedPeriod}` : ""
                }`}
              />
            ))}
          </Column>
        </Column>
      </Section>
    </>
  );
};
