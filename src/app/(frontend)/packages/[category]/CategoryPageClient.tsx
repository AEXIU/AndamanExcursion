"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Section, Column } from "@/components/layout";
import { PackageSelector } from "@/components/molecules/PackageSelector/PackageSelector";
import { SectionTitle } from "@/components/atoms";
import styles from "../page.module.css";
import { FeaturePackageCard } from "@/components/molecules/Cards";
import { useClientSearchParams } from "@/hooks/useClientSearchParams";
import NoPackagesCard from "./NoPackagesCard";

interface CategoryPageClientProps {
  category: any;
  packages: any[];
  periodOptions: any[];
  packageOptions: any[];
  initialPeriod: string;
}

export function CategoryPageClient({
  category,
  packages,
  periodOptions,
  packageOptions,
  initialPeriod,
}: CategoryPageClientProps) {
  const router = useRouter();
  const { searchParams, SearchParamsLoader, getParam } =
    useClientSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  // Sync with URL params
  useEffect(() => {
    const period = getParam("period") || "all";
    setSelectedPeriod(period);
  }, [searchParams, getParam]);

  // Filter packages based on selected period
  const filteredPackages = useMemo(() => {
    if (selectedPeriod === "all") {
      return packages;
    }

    return packages.filter((pkg) => {
      // Assuming the package has a period field that matches the period value
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
    const params = new URLSearchParams(searchParams || "");
    if (periodId === "all") {
      params.delete("period");
    } else {
      params.set("period", periodId);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `/packages/${category.slug}?${queryString}`
      : `/packages/${category.slug}`;

    // Push the URL with scroll: false to prevent page jump
    router.push(newUrl, { scroll: false });
  };

  return (
    <main className={styles.main}>
      <SearchParamsLoader />
      {/* Package Selector Section */}
      <Section>
        <Column
          gap={3}
          justifyContent="start"
          alignItems="start"
          fullWidth
          className={styles.packageSelectorWrapper}
          style={{ minHeight: "150px" }}
        >
          <SectionTitle
            text={`${category.title} Packages`}
            specialWord={category.title}
          />
          <PackageSelector
            packageOptions={packageOptions}
            periodOptions={periodOptions}
            selectedPackage={category.slug}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            showPackageSelector={true}
          />
        </Column>
      </Section>
      {/* Packages Grid */}
      <Section>
        <Column gap={4} fullWidth responsive responsiveGap="var(--space-3)">
          {filteredPackages.length > 0 ? (
            <>
              {filteredPackages.map((pkg) => (
                <FeaturePackageCard
                  key={pkg.id}
                  title={pkg.title}
                  description={
                    pkg.descriptions?.shortDescription ||
                    pkg.descriptions?.description
                  }
                  image={pkg.media?.images?.[0]?.image?.url || ""}
                  href={`/packages/${category.slug}/${pkg.slug}`}
                  price={pkg.pricing?.price}
                  originalPrice={pkg.pricing?.originalPrice}
                  duration={
                    pkg.coreInfo?.period?.shortTitle ||
                    pkg.coreInfo?.period?.title
                  }
                  locations={pkg.coreInfo?.locations || []}
                />
              ))}
            </>
          ) : (
            <NoPackagesCard className={styles.noPackages} />
          )}
        </Column>
      </Section>
    </main>
  );
}
