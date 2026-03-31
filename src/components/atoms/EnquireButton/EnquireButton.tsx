"use client";

import { useMemo } from "react";
import { Button } from "@/components/atoms";
import {
  transformPackageToEnquiryData,
  createEnquiryURL,
} from "@/utils/enquiry.utils";
import { PayloadPackage } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader.types";

interface EnquireButtonProps {
  packageData: PayloadPackage;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Client component that creates an enquiry URL with package data
 * Wraps the standard Button component with dynamic URL generation
 */
export function EnquireButton({
  packageData,
  className,
  children = "Enquire",
}: EnquireButtonProps) {
  const enquiryURL = useMemo(() => {
    try {
      const enquiryData = transformPackageToEnquiryData(packageData);
      return createEnquiryURL(enquiryData);
    } catch (error) {
      console.error("Failed to create enquiry URL:", error);
      return "/contact"; // fallback to basic contact page
    }
  }, [packageData]);

  return (
    <Button showArrow href={enquiryURL} className={className}>
      {children}
    </Button>
  );
}
