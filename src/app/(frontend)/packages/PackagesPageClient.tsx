"use client";

import React from "react";
import { useClientSearchParams } from "@/hooks/useClientSearchParams";

export function PackagesPageClient() {
  const { SearchParamsLoader } = useClientSearchParams();

  // This component now only handles the SearchParamsLoader
  // All other logic has been moved to DynamicPackagesBlock

  return <SearchParamsLoader />;
}
