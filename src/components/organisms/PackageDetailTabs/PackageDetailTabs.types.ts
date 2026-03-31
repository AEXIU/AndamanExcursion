// Updated type definitions for better type safety

import { Package } from "@payload-types";

export interface WhatsCoveredTabProps {
  includes: Array<{ inclusion: string }> | string[] | undefined | null;
  excludes: Array<{ exclusion: string }> | string[] | undefined | null;
  notes: Array<{ note: string }> | string[] | undefined | null;
}

// Helper type for array items that can be either string or object
type ArrayItem<T> = T extends Array<infer U> ? U : never;

// Type guards for better type safety
export const isStringArray = (arr: unknown[]): arr is string[] => {
  return arr.every((item) => typeof item === "string");
};

export const isObjectArray = <T>(arr: unknown[], key: keyof T): arr is T[] => {
  return arr.every(
    (item) => typeof item === "object" && item !== null && key in item
  );
};

// Use the auto-generated Package type from PayloadCMS
export type PayloadPackage = Package & {
  // Add any additional processed fields if needed
  images?: Array<{
    url: string;
    alt: any;
    caption?: any;
  }>;
};
