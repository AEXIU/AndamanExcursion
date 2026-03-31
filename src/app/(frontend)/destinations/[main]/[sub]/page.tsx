import React from "react";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { pageService } from "@/services/payload";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";

interface PageProps {
  params: Promise<{ main: string; sub: string }>;
}

// This is the sub destination page at /destinations/[main]/[sub]
export default async function SubDestinationPage({ params }: PageProps) {
  // Await params before using its properties
  const { main: mainCategorySlug, sub: subcategorySlug } = await params;

  // Try to find a sub-destination page by mainCategorySlug and subcategorySlug
  const page = await pageService.getSubDestinationBySlug(
    mainCategorySlug,
    subcategorySlug
  );

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
    const { main: mainCategorySlug, sub: subcategorySlug } = await params;

    const page = await pageService.getSubDestinationBySlug(
      mainCategorySlug,
      subcategorySlug
    );

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

    // Get parent destination for context
    let parentDestination = null;
    try {
      parentDestination = await pageService.getMainDestinationBySlug(mainCategorySlug);
    } catch (error) {
      console.log("Could not fetch parent destination for metadata context");
    }

    // Use SEO plugin data (meta field) or fallback to page data
    const seoTitle =
      page.meta?.title ||
      page.title ||
      `${page.title} | ${parentDestination?.title || mainCategorySlug} | Andaman Excursion`;

    const seoDescription =
      page.meta?.description ||
      `Discover ${page.title} in ${parentDestination?.title || mainCategorySlug}, Andaman Islands. Explore pristine beaches, crystal clear waters, and unforgettable experiences in this beautiful destination.`;

    const seoImageUrl = getImageUrl(page.meta?.image);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/destinations/${mainCategorySlug}/${subcategorySlug}`;

    // Build dynamic keywords based on destination names
    const destinationName = page.title || subcategorySlug;
    const parentName = parentDestination?.title || mainCategorySlug;
    const keywords = `${destinationName}, ${destinationName} ${parentName}, ${parentName} destinations, ${destinationName} Andaman, Andaman destinations, ${destinationName} tourism, ${destinationName} travel, Andaman Islands, beach destinations`;

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
    console.error("Error generating metadata for sub destination page:", error);
    return {
      title: "Destination | Andaman Excursion",
      description: "Explore amazing destinations in the Andaman Islands",
    };
  }
}
