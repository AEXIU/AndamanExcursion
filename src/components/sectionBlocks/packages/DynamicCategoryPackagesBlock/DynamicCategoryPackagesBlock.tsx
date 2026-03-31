// components/sectionBlocks/packages/DynamicCategoryPackagesBlock/DynamicCategoryPackagesBlock.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Section, Column } from "@/components/layout";
import { PackageSelector } from "@/components/molecules/PackageSelector/PackageSelector";
import { SectionTitle } from "@/components/atoms";
import { FeaturePackageCard } from "@/components/molecules/Cards";
import { useClientSearchParams } from "@/hooks/useClientSearchParams";
import NoPackagesCard from "@/app/(frontend)/packages/[category]/NoPackagesCard";
import styles from "@/app/(frontend)/packages/page.module.css";

interface DynamicCategoryPackagesBlockProps {
  id?: string;
  content: {
    selectorTitle?: string;
    showPackageSelector?: boolean;
    noPackagesMessage?: {
      title?: string;
      message?: string;
      showContactButton?: boolean;
    };
    displayOptions?: {
      packagesPerRow?: string;
      showPackageDetails?: {
        showPrice?: boolean;
        showDuration?: boolean;
        showLocations?: boolean;
      };
    };
    // Injected server-side data
    category?: any;
    packages?: any[];
    periodOptions?: any[];
    packageOptions?: any[];
    initialPeriod?: string;
  };
}

export const DynamicCategoryPackagesBlock: React.FC<
  DynamicCategoryPackagesBlockProps
> = ({
  id,
  content: {
    selectorTitle,
    showPackageSelector = true,
    noPackagesMessage,
    displayOptions,
    category,
    packages = [],
    periodOptions = [],
    packageOptions = [],
    initialPeriod = "all",
  },
}) => {
  const router = useRouter();
  const params = useParams();
  const { searchParams, SearchParamsLoader, getParam } =
    useClientSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  // Sync with URL params
  useEffect(() => {
    const period = getParam("period") || initialPeriod;
    setSelectedPeriod(period);
  }, [searchParams, getParam, initialPeriod]);

  // Filter packages based on selected period
  const filteredPackages = useMemo(() => {
    if (selectedPeriod === "all") {
      return packages;
    }

    return packages.filter((pkg) => {
      return (
        pkg.coreInfo?.period?.value === selectedPeriod ||
        pkg.coreInfo?.period?.id === selectedPeriod ||
        pkg.period?.value === selectedPeriod ||
        pkg.period?.id === selectedPeriod
      );
    });
  }, [packages, selectedPeriod]);

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);

    // Update URL
    const urlParams = new URLSearchParams(searchParams || "");
    if (periodId === "all") {
      urlParams.delete("period");
    } else {
      urlParams.set("period", periodId);
    }

    const queryString = urlParams.toString();
    const newUrl = queryString
      ? `/packages/${params.category}?${queryString}`
      : `/packages/${params.category}`;

    router.push(newUrl, { scroll: false });
  };

  // Generate title
  const displayTitle =
    selectorTitle || (category ? `${category.title} Packages` : "Packages");
  const specialWord = selectorTitle ? undefined : category?.title;

  // Generate grid classes
  const getGridClasses = () => {
    const perRow = displayOptions?.packagesPerRow || "1";
    return `packages-grid-${perRow}`;
  };

  return (
    <>
      <SearchParamsLoader />

      {/* Package Selector Section */}
      {showPackageSelector && (
        <Section id={id ? `${id}-selector` : undefined}>
          <Column
            gap={3}
            justifyContent="start"
            alignItems="start"
            fullWidth
            style={{ minHeight: "150px" }}
          >
            <SectionTitle
              headingLevel="h1"
              text={displayTitle}
              specialWord={specialWord}
            />
            <PackageSelector
              packageOptions={packageOptions}
              periodOptions={periodOptions}
              selectedPackage={category?.slug}
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              showPackageSelector={true}
            />
          </Column>
        </Section>
      )}

      {/* Packages Grid */}
      <Section id={id}>
        <Column gap={4} fullWidth responsive responsiveGap="var(--space-3)">
          {filteredPackages.length > 0 ? (
            <div className={getGridClasses()}>
              {filteredPackages.map((pkg) => (
                <FeaturePackageCard
                  key={pkg.id}
                  title={pkg.title}
                  description={
                    pkg.descriptions?.shortDescription ||
                    pkg.descriptions?.description
                  }
                  image={pkg.media?.images?.[0]?.image?.url || ""}
                  href={`/packages/${category?.slug}/${pkg.slug}`}
                  price={
                    displayOptions?.showPackageDetails?.showPrice !== false
                      ? pkg.pricing?.price
                      : undefined
                  }
                  originalPrice={
                    displayOptions?.showPackageDetails?.showPrice !== false
                      ? pkg.pricing?.originalPrice
                      : undefined
                  }
                  duration={
                    displayOptions?.showPackageDetails?.showDuration !== false
                      ? pkg.coreInfo?.period?.shortTitle ||
                        pkg.coreInfo?.period?.title
                      : undefined
                  }
                  locations={
                    displayOptions?.showPackageDetails?.showLocations !== false
                      ? pkg.coreInfo?.locations || []
                      : []
                  }
                />
              ))}
            </div>
          ) : (
            <NoPackagesCard className={styles.noPackages} />
          )}
        </Column>
      </Section>
    </>
  );
};
