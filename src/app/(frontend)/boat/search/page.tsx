// src/app/(frontend)/boat/search/page.tsx
import React from "react";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";
import { boatRouteApi, locationApi } from "@/services/api";
import { BoatSearchClient } from "./BoatSearchClient";

type SearchPageProps = {
  params: Promise<{ slug?: string }>;
  searchParams: Promise<{
    fromLocation?: string;
    toLocation?: string;
    date?: string;
    time?: string;
    adults?: string;
    children?: string;
  }>;
};

// Server component - handles metadata generation
export default async function BoatSearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const resolvedSearchParams = await searchParams;

  // Pass search params to client component
  return <BoatSearchClient initialSearchParams={resolvedSearchParams} />;
}

// Generate metadata for boat search results
export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    // Get search parameters
    const fromLocation = resolvedSearchParams.fromLocation;
    const toLocation = resolvedSearchParams.toLocation;
    const date = resolvedSearchParams.date;
    const adults = parseInt(resolvedSearchParams.adults || "1", 10);
    const children = parseInt(resolvedSearchParams.children || "0", 10);
    const totalPassengers = adults + children;

    // Fetch location and route data for better titles
    let fromLocationName = "Andaman";
    let toLocationName = "";
    let routeData = null;

    try {
      // Get from location name
      if (fromLocation) {
        const locations = await locationApi.getForFerries();
        const location = locations.find((loc) => loc.slug === fromLocation);
        fromLocationName = location?.name || fromLocationName;
      }

      // Get route data if toLocation is provided
      if (toLocation) {
        routeData = await boatRouteApi.getById(toLocation);
        toLocationName = routeData?.toLocation || "";
      }
    } catch (error) {
      console.log("Error fetching location data for metadata:", error);
    }

    // Build dynamic title based on search parameters
    let title = "Boat Trip Search Results | Andaman Excursion";
    if (fromLocationName && toLocationName) {
      title = `${fromLocationName} to ${toLocationName} Ferry | Andaman Excursion`;
    } else if (fromLocationName) {
      title = `Ferry from ${fromLocationName} | Andaman Excursion`;
    }

    // Build dynamic description
    let description =
      "Find and book the best boat trips and ferry services in Andaman Islands.";
    if (fromLocationName && toLocationName) {
      description = `Book ferry tickets from ${fromLocationName} to ${toLocationName}. `;
      if (date) {
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        description += `Departure on ${formattedDate}. `;
      }
      description += `Starting from ₹${
        routeData?.fare || "XXX"
      } per person for ${totalPassengers} passenger${
        totalPassengers > 1 ? "s" : ""
      }.`;
    }

    // Get featured image - could be from route data or default boat image
    let imageUrl = null;
    if (routeData?.featuredImage) {
      imageUrl = getImageUrl(routeData.featuredImage);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    let canonicalUrl = `${baseUrl.replace(/\/$/, "")}/boat/search`;

    // Add key search parameters to canonical for better SEO
    if (fromLocation && toLocation) {
      canonicalUrl += `?fromLocation=${fromLocation}&toLocation=${toLocation}`;

      // Only add date if it's not today (to avoid too many date variations)
      if (date && date !== new Date().toISOString().split("T")[0]) {
        canonicalUrl += `&date=${date}`;
      }
    }

    // Build keywords dynamically
    const keywords = [
      "Andaman ferry booking",
      "boat trip search",
      fromLocationName && `${fromLocationName} ferry`,
      toLocationName && `${toLocationName} boat`,
      "island hopping",
      "Andaman boat booking",
      "ferry tickets",
      "boat trip results",
    ]
      .filter(Boolean)
      .join(", ");

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "Andaman Excursion",
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: `${fromLocationName} to ${toLocationName} Ferry`,
              },
            ]
          : undefined,
        type: "website",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      other: {
        "og:type": "website",
        "og:section": "Travel Search",
        ...(routeData?.fare && {
          "product:price:amount": routeData.fare.toString(),
          "product:price:currency": "INR",
        }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata for boat search page:", error);
    return {
      title: "Boat Trip Search | Andaman Excursion",
      description:
        "Find and book the best boat trips and ferry services in Andaman Islands.",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

// search page's expected behaviour is to be dynamic, added this export to resolve build error
export const dynamic = "force-dynamic";
