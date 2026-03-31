import React from "react";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { notFound, redirect } from "next/navigation";

import styles from "./page.module.css";
import { pageService } from "@/services/payload";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";

interface PageProps {
  params: Promise<{ main: string }>;
}

export default async function MainDestinationPage({ params }: PageProps) {
  // Await params before using its properties
  const { main: mainCategorySlug } = await params;

  // First try to find a main destination page by mainCategorySlug
  let page = await pageService.getMainDestinationBySlug(mainCategorySlug);

  // If not found, check for legacy single-slug destinations and redirect
  if (!page) {
    // Try to find by the old slug method for backward compatibility
    const legacyPage = await pageService.getBySlug(mainCategorySlug);

    if (
      legacyPage &&
      legacyPage.basicInfo?.pageType === "destinations" &&
      legacyPage.destinationInfo
    ) {
      const {
        destinationType,
        mainCategorySlug: newMainSlug,
        subcategorySlug,
        parentMainCategory,
      } = legacyPage.destinationInfo;

      if (
        destinationType === "main" &&
        newMainSlug &&
        newMainSlug !== mainCategorySlug
      ) {
        // Redirect to new main category URL
        redirect(`/destinations/${newMainSlug}`);
      } else if (
        destinationType === "sub" &&
        subcategorySlug &&
        parentMainCategory
      ) {
        // Get the main category slug for redirection
        let parentSlug = null;
        if (
          typeof parentMainCategory === "object" &&
          parentMainCategory.destinationInfo?.mainCategorySlug
        ) {
          parentSlug = parentMainCategory.destinationInfo.mainCategorySlug;
        } else if (typeof parentMainCategory === "string") {
          const parentPage = await pageService.getById(parentMainCategory);
          parentSlug = parentPage?.destinationInfo?.mainCategorySlug;
        }

        if (parentSlug) {
          redirect(`/destinations/${parentSlug}/${subcategorySlug}`);
        }
      }

      // If it's a legacy destination but doesn't have new structure, render it
      page = legacyPage;
    }
  }

  if (!page) {
    return notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={page.pageContent?.content} />
    </main>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { main: mainCategorySlug } = await params;
    const page = await pageService.getMainDestinationBySlug(mainCategorySlug);

    if (!page || page.publishingSettings?.status !== "published") {
      return {
        title: "Destination Not Found | Andaman Excursion",
        description: "The destination you're looking for doesn't exist.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Use SEO plugin data (meta field) or fallback to page data
    const seoTitle =
      page.meta?.title ||
      (page.title
        ? `${page.title} | Experiences | Andaman Excursion`
        : "Experiences | Andaman Excursion");

    const seoDescription =
      page.meta?.description ||
      `Discover ${page.title} in the Andaman Islands. Explore pristine beaches, crystal clear waters, and unforgettable experiences in this beautiful destination.`;

    const seoImageUrl = getImageUrl(page.meta?.image);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/destinations/${mainCategorySlug}`;

    // Build dynamic keywords based on destination name
    const destinationName = page.title || mainCategorySlug;
    const keywords = `${destinationName}, ${destinationName} Andaman, Andaman destinations, ${destinationName} tourism, ${destinationName} travel, Andaman Islands, beach destinations`;

    return {
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
      ),
      title: seoTitle,
      description: seoDescription,
      keywords: typeof keywords === "string" ? keywords : [],
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: canonicalUrl,
        siteName: "Andaman Excursion",
        images: seoImageUrl
          ? [
              {
                url: seoImageUrl,
                width: 1200,
                height: 630,
                alt: page.title || seoTitle,
              },
            ]
          : undefined,
        type: "website",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: seoImageUrl ? [seoImageUrl] : undefined,
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
        ...(page.createdAt && {
          "article:published_time": page.createdAt,
        }),
        "article:modified_time": page.updatedAt,
        "og:type": "place",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for main destination page:", error);
    return {
      title: "Destination | Andaman Excursion",
      description: "Explore amazing destinations in the Andaman Islands",
    };
  }
}
