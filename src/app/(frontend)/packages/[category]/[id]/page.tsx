import React from "react";
import { Section, Column, Row } from "@/components/layout";
import { EnquireButton } from "@/components/atoms";
import { pageService, pageDataService } from "@/services/payload";
import { notFound } from "next/navigation";
import styles from "../../page.module.css";
import { PackageDetailTabs } from "@/components/organisms";
import { PackageDetailHeader } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader";
import { PayloadPackage } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader.types";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";
import { packageCategoryService, packageService } from "@/services/payload";

interface PackageDetailPageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const { category, id } = await params;

  // Get package data from API
  const result = await pageDataService.getPackageDetailPageData(category, id);

  if (!result || !result.packageData) {
    notFound();
  }

  // Get the original package data object - this contains all Payload CMS fields
  const packageData = result.packageData as PayloadPackage;

  // Get the package page from CMS for additional blocks
  let packagePage = null;
  try {
    // Try to get package-specific page, fallback to generic template
    packagePage =
      (await pageService.getBySlug(`package-${id}`)) ||
      (await pageService.getBySlug("package-detail-template"));
  } catch (error) {
    console.error("Error fetching package page:", error);
  }

  // Prepare enriched blocks if page content exists
  const enrichedBlocks = packagePage?.pageContent?.content
    ? packagePage.pageContent.content.map((block) => {
        // Inject package data into blocks that might need it
        return {
          ...block,
          packageData, // Make package data available to all blocks
        };
      })
    : [];

  return (
    <main className={styles.main}>
      <Section className={styles.packageDetailSection}>
        <Column
          fullWidth
          gap={5}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <PackageDetailHeader packageData={packageData} />
          {/* Package Detail Tabs */}
          <PackageDetailTabs packageData={packageData} />
          <Row gap={3} responsive responsiveGap="var(--space-4)">
            {/* <InlineLink href="/customise">Customise this package</InlineLink> */}
            <EnquireButton packageData={packageData}>Enquire</EnquireButton>
          </Row>
        </Column>
      </Section>
      {/* Render additional CMS blocks if they exist */}
      {enrichedBlocks.length > 0 && (
        <BlockRenderer blocks={enrichedBlocks as any} />
      )}
    </main>
  );
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    // Get all categories first
    const categories = await packageCategoryService.getAll();
    const staticParams = [];

    // For each category, get all packages
    for (const category of categories) {
      try {
        const packages = await packageService.getAll({
          categorySlug: category.slug,
          limit: 1000, // Set a high limit to get all packages
        });

        // Add each package to static params
        for (const pkg of packages) {
          // packageService.getAll already filters for published content via getPublishedQuery
          staticParams.push({
            category: category.slug,
            id: pkg.slug, // Using slug as ID based on your URL structure
          });
        }
      } catch (error) {
        console.error(
          `Error fetching packages for category ${category.slug}:`,
          error
        );
        // Continue with other categories even if one fails
        continue;
      }
    }

    return staticParams;
  } catch (error) {
    console.error("Error generating static params:", error);
    // Return empty array to prevent build failure
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}): Promise<Metadata> {
  try {
    const { category, id } = await params;
    const result = await pageDataService.getPackageDetailPageData(category, id);

    if (!result || !result.packageData) {
      return {
        title: "Package Not Found | Andaman Excursion",
        description: "The requested package does not exist.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const packageData = result.packageData as PayloadPackage;

    // Extract SEO data from package structure
    const title =
      // packageData.seo?.metaTitle ||
      packageData.meta?.title || `${packageData.title} | Andaman Excursion`;

    const description =
      // packageData.seo?.metaDescription ||
      packageData.meta?.description ||
      packageData.descriptions?.shortDescription ||
      packageData.descriptions?.description ||
      `Experience ${packageData.title} with Andaman Excursion. Book your dream vacation today.`;

    // Get image from package media
    let imageUrl = null;
    if (packageData.media?.images && packageData.media.images.length > 0) {
      const firstImage = packageData.media.images[0];
      imageUrl = getImageUrl(firstImage.image);
      // } else if (packageData.seo?.metaImage) {
      //   imageUrl = getImageUrl(packageData.seo.metaImage);
    } else if (packageData.meta?.image) {
      imageUrl = getImageUrl(packageData.meta.image);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    const canonicalUrl = `${baseUrl.replace(
      /\/$/,
      ""
    )}/packages/${category}/${id}`;

    // Build keywords from package data
    const keywords =
      // packageData.seo?.keywords ||
      // packageData.meta?.keywords ||
      [
        packageData.title,
        "Andaman",
        category.replace("-", " "),
        "tour package",
        "vacation",
        "travel",
        ...(packageData.coreInfo?.locations || []).map((loc: any) =>
          typeof loc === "object" ? loc.name : loc
        ),
        typeof packageData.coreInfo?.period === "string"
          ? packageData.coreInfo?.period
          : packageData.coreInfo?.period.title,
      ]
        .filter(Boolean)
        .join(", ");

    return {
      title,
      description,
      keywords: typeof keywords === "string" ? keywords : [],
      // keywords?.join(", "),
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
                alt: packageData.title,
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
        index: packageData.publishingSettings?.status === "published",
        follow: packageData.publishingSettings?.status === "published",
        googleBot: {
          index: packageData.publishingSettings?.status === "published",
          follow: packageData.publishingSettings?.status === "published",
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      // Add structured data for better SEO
      other: {
        ...(packageData.publishingSettings?.publishedAt && {
          "article:published_time": packageData.publishingSettings.publishedAt,
        }),
        ...(packageData.updatedAt && {
          "article:modified_time": packageData.updatedAt,
        }),
        ...(packageData.pricing?.price && {
          "product:price:amount": packageData.pricing.price.toString(),
          "product:price:currency": "INR", // Adjust based on your currency
        }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Package | Andaman Excursion",
      description: "Discover amazing packages with Andaman Excursion",
    };
  }
}
