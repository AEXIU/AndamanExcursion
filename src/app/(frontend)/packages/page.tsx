import React from "react";
import { pageService, pageDataService } from "@/services/payload";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { PackagesPageClient } from "./PackagesPageClient";
import styles from "./page.module.css";
import { getImageUrl } from "@/utils/getImageUrl";
import { Metadata } from "next";

export default async function PackagesPage() {
  // Get page content from Payload CMS
  const page = await pageService.getBySlug("packages");

  // Check if the page exists and is published
  if (
    !page ||
    !page.pageContent?.content ||
    page.publishingSettings?.status !== "published"
  ) {
    notFound();
  }

  // Server-side data fetching for dynamic packages section
  const { packageOptions, periodOptions, packageCategoriesContent } =
    await pageDataService.getPackagesPageData();

  // Find the dynamic packages block and inject the data
  const enrichedBlocks = page.pageContent.content.map((block) => {
    if (block.blockType === "dynamicPackages") {
      return {
        ...block,
        // Inject the fetched data into the block content
        packageOptions,
        periodOptions,
        packageCategoriesContent,
      };
    }
    return block;
  });

  return (
    <div className={styles.main}>
      {/* Render static content blocks */}
      <BlockRenderer blocks={enrichedBlocks} />
      {/* Client-side component for URL param handling */}
      <PackagesPageClient />
    </div>
  );
}

// Fixed generate dynamic metadata
export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageService.getBySlug("packages");

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
      // page.seo?.metaTitle ||
      page.meta?.title ||
      page.title ||
      "Curated Packages Just for you! | Andaman Excursion";

    const seoDescription =
      // page.seo?.metaDescription ||
      page.meta?.description ||
      "Discover amazing travel packages for the Andaman Islands. Find your perfect vacation with our curated selection of tours and experiences.";

    const seoImageUrl = getImageUrl(page.meta?.image);

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/packages`;

    const keywords =
      // page.seo?.keywords ||
      // page.meta?.keywords ||
      "Andaman packages, travel packages, Andaman tours, vacation packages, island tours, Andaman excursion";

    return {
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
      ),
      title: seoTitle,
      description: seoDescription,
      keywords: typeof keywords === "string" ? keywords : [],
      // keywords?.join(", "),
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
    console.error("Error generating metadata for packages page:", error);
    return {
      title: "Packages | Andaman Excursion",
      description: "Discover amazing travel packages for the Andaman Islands",
    };
  }
}
