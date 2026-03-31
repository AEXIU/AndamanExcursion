import React from "react";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { pageService } from "@/services/payload";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";

// This is the index page at /destinations
export default async function DestinationsIndexPage() {
  // Try to find the destinations index page
  const page = await pageService.getDestinationsIndex();

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
export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageService.getDestinationsIndex();

    if (!page || page.publishingSettings?.status !== "published") {
      return {
        title: "Page Not Found | Andaman Excursion",
        description: "The page you're looking for doesn't exist.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Use SEO plugin data (meta field) or fallback to page data
    const seoTitle =
      page.meta?.title ||
      page.title ||
      "Destinations in Andaman Islands | Andaman Excursion";

    const seoDescription =
      page.meta?.description ||
      "Explore amazing destinations in the Andaman Islands. Discover pristine beaches, crystal clear waters, and unforgettable experiences across the islands.";

    const seoImageUrl = getImageUrl(page.meta?.image);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/destinations`;

    const keywords =
      "Andaman destinations, Andaman Islands, travel destinations, island destinations, Andaman tourism, beach destinations, tropical islands";

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
      },
    };
  } catch (error) {
    console.error("Error generating metadata for destinations page:", error);
    // Default minimal metadata
    return {
      title: "Experiences in Andaman Islands | Andaman Excursion",
      description: "Explore amazing destinations in the Andaman Islands",
    };
  }
}
