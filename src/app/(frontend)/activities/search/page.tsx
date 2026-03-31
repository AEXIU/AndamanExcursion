// src/app/activities/search/page.tsx (Server Component)
import React, { Suspense } from "react";
import { Metadata } from "next";
import { getCachedPayload } from "@/services/payload/base/client";
import { getImageUrl } from "@/utils/getImageUrl";
import ActivitiesSearchPageRQ from "./page-client";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    activityType?: string;
    location?: string;
    date?: string;
    time?: string;
    adults?: string;
    children?: string;
    infants?: string;
  }>;
};

// Server component that handles metadata
export default function ActivitiesSearchPage({
  searchParams,
}: SearchPageProps) {
  return <ActivitiesSearchPageRQ />;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  try {
    const params = await searchParams;
    const {
      activityType,
      location,
      date,
      adults = "2",
      children = "0",
      infants = "0",
    } = params;

    let title = "Activity Search Results | Andaman Excursion";
    let description =
      "Find and book exciting activities in the Andaman Islands";
    let keywords = "andaman activities, booking, water sports, adventure";

    // Get category details for better SEO using Payload Local API
    let categoryData = null;
    if (activityType) {
      try {
        const payload = await getCachedPayload();
        const result = await payload.find({
          collection: "activity-categories",
          where: { slug: { equals: activityType } },
          limit: 1,
        });
        categoryData = result.docs[0] || null;
      } catch (error) {
        console.error("Error fetching category for metadata:", error);
      }
    }

    // Build dynamic title and description
    if (categoryData) {
      const locationText = location
        ? ` in ${location.replace("-", " ")}`
        : " in Andaman Islands";
      title = `${categoryData.name} Activities${locationText} | Andaman Excursion`;
      description = `Book ${categoryData.name.toLowerCase()} activities${locationText}. ${
        categoryData.description || "Amazing experiences await you."
      }`;
      keywords = `${categoryData.name}, ${keywords}`;
    }

    // Add passenger info to description if available
    const totalPassengers =
      parseInt(adults) + parseInt(children) + parseInt(infants);
    if (totalPassengers > 0) {
      description += ` Perfect for ${totalPassengers} ${
        totalPassengers === 1 ? "person" : "people"
      }.`;
    }

    // Add date info if available
    if (date) {
      try {
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        description += ` Available for ${formattedDate}.`;
      } catch (error) {
        // Invalid date, skip adding date info
      }
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    const currentUrl = new URL("/activities/search", baseUrl);

    // Preserve search params in canonical URL for SEO
    Object.entries(params).forEach(([key, value]) => {
      if (value) currentUrl.searchParams.set(key, value);
    });

    let imageUrl = null;
    if (categoryData?.image) {
      imageUrl = getImageUrl(categoryData.image);
    }

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: currentUrl.toString(),
        siteName: "Andaman Excursion",
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : undefined,
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: currentUrl.toString(),
      },
    };
  } catch (error) {
    console.error("Error generating metadata for activities search:", error);
    return {
      title: "Activity Search Results | Andaman Excursion",
      description: "Find and book exciting activities in the Andaman Islands",
    };
  }
}
