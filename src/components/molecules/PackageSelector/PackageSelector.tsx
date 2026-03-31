"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./PackageSelector.module.css";
import { useClientSearchParams } from "@/hooks/useClientSearchParams";

interface Option {
  id: string;
  label: string;
}

interface PackageSelectorProps {
  packageOptions: Option[];
  periodOptions: Option[];
  selectedPackage?: string;
  selectedPeriod?: string;
  onPeriodChange?: (periodId: string) => void;
  showPackageSelector?: boolean;
  className?: string;
}

export const PackageSelector = ({
  packageOptions,
  periodOptions,
  selectedPackage,
  selectedPeriod = "all",
  onPeriodChange,
  showPackageSelector = true,
  className = "",
}: PackageSelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { searchParams, SearchParamsLoader, getParam } =
    useClientSearchParams();

  // Auto-detect current package from URL
  const pathParts = pathname.split("/");
  const currentPackageSlug = pathParts[pathParts.length - 1];
  const isPackagesIndex = pathname === "/packages";
  const isPackageCategory =
    pathname.startsWith("/packages/") && !isPackagesIndex;

  const currentPackage = packageOptions.find(
    (p) => p.id === currentPackageSlug || p.id === selectedPackage
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown immediately on scroll
  useEffect(() => {
    if (isDropdownOpen) {
      const handleScroll = () => setIsDropdownOpen(false);
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [isDropdownOpen]);

  const handlePackageChange = (packageId: string) => {
    setIsDropdownOpen(false);

    // Build URL with current period if it exists
    const currentPeriod = getParam("period") || selectedPeriod;
    const periodParam =
      currentPeriod && currentPeriod !== "all"
        ? `?period=${currentPeriod}`
        : "";

    // Navigate to the selected package category
    router.push(`/packages/${packageId}${periodParam}`);
  };

  const handlePeriodNavigation = (direction: "prev" | "next") => {
    const currentIndex = periodOptions.findIndex(
      (p) => p.id === selectedPeriod
    );
    if (currentIndex === -1) return;

    const newIndex =
      direction === "prev"
        ? (currentIndex - 1 + periodOptions.length) % periodOptions.length
        : (currentIndex + 1) % periodOptions.length;

    const newPeriodId = periodOptions[newIndex].id;

    // Handle period change based on context
    if (onPeriodChange) {
      // If we have a custom handler (like in category pages), use it
      onPeriodChange(newPeriodId);
    } else {
      // Otherwise, update the URL
      const params = new URLSearchParams(searchParams || "");
      if (newPeriodId === "all") {
        params.delete("period");
      } else {
        params.set("period", newPeriodId);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl);
    }
  };

  // Determine labels
  const selectedPeriodLabel =
    periodOptions.find((p) => p.id === selectedPeriod)?.label ||
    "All Durations";

  const selectedPackageLabel = (() => {
    if (isPackagesIndex) {
      return "All Packages";
    }
    if (selectedPackage) {
      return (
        packageOptions.find((p) => p.id === selectedPackage)?.label ||
        "Select Package"
      );
    }
    return currentPackage?.label || "Select Package";
  })();

  return (
    <div className={`${styles.packageSelector} ${className}`}>
      <SearchParamsLoader />
      <div className={styles.selectorContainer}>
        {/* Package Selector */}
        {showPackageSelector && packageOptions.length > 0 && (
          <div
            className={styles.selectorGroup}
            style={{ position: "relative" }}
          >
            <span className={styles.selectorLabel}>Package</span>
            <div
              className={styles.selectWrapper}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              ref={triggerRef}
            >
              <div className={styles.packageSelect}>{selectedPackageLabel}</div>
              <div className={styles.selectArrow}>
                <ChevronDown size={18} />
              </div>
            </div>

            {isDropdownOpen && (
              <div
                className={styles.selectContent}
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  zIndex: 20000,
                  marginTop: "4px",
                }}
              >
                {/* Add "All Packages" option */}
                <div
                  className={`${styles.selectItem} ${isPackagesIndex ? styles.selected : ""
                    }`}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    const currentPeriod = getParam("period") || selectedPeriod;
                    const periodParam =
                      currentPeriod && currentPeriod !== "all"
                        ? `?period=${currentPeriod}`
                        : "";
                    router.push(`/packages${periodParam}`);
                  }}
                >
                  All Packages
                </div>

                {packageOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`${styles.selectItem} ${option.id === (selectedPackage || currentPackageSlug)
                        ? styles.selected
                        : ""
                      }`}
                    onClick={() => handlePackageChange(option.id)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Period Selector */}
        <div className={styles.selectorGroup}>
          <label className={styles.selectorLabel}>Period</label>
          <div className={styles.periodSelector}>
            <button
              className={styles.arrowButton}
              onClick={() => handlePeriodNavigation("prev")}
              aria-label="Previous period"
              type="button"
              disabled={periodOptions.length <= 1}
            >
              <ChevronLeft size={18} />
            </button>

            <span className={styles.periodDisplay}>{selectedPeriodLabel}</span>

            <button
              className={styles.arrowButton}
              onClick={() => handlePeriodNavigation("next")}
              aria-label="Next period"
              type="button"
              disabled={periodOptions.length <= 1}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
