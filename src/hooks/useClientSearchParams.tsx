"use client";

import { useSearchParams as useNextSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";

// This component loads the search params within a Suspense boundary
const SearchParamsLoader = ({
  setSearchParams,
}: {
  setSearchParams: (params: URLSearchParams) => void;
}) => {
  const searchParams = useNextSearchParams();

  useEffect(() => {
    if (searchParams) {
      setSearchParams(searchParams);
    }
    // Deliberately omitting setSearchParams from dependencies as it's unlikely to change
    // and including it causes infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
};

// This hook safely handles useSearchParams without causing Suspense issues
export function useClientSearchParams() {
  // Create a state that will hold the search params
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null
  );

  // Memoize the setSearchParams function to prevent it from causing re-renders
  const stableSetSearchParams = useCallback((params: URLSearchParams) => {
    // Only update if the params are different to avoid unnecessary re-renders
    setSearchParams((current) => {
      if (!current || current.toString() !== params.toString()) {
        return params;
      }
      return current;
    });
  }, []);

  return {
    searchParams,
    SearchParamsLoader: () => (
      <Suspense fallback={null}>
        <SearchParamsLoader setSearchParams={stableSetSearchParams} />
      </Suspense>
    ),
    // Helper getter method, similar to the original useSearchParams().get()
    getParam: (param: string) => searchParams?.get(param) ?? null,
  };
}
