import React from "react";
import styles from "./page.module.css";
import { pageService } from "@/services/payload";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";

type PageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function LiveVolcanosPage({ params }: PageProps) {
  const page = await pageService.getBySlug("live-volcanos");

  if (!page) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={page.pageContent?.content} />
    </main>
  );
}

// Generate dynamic metadata using SEO plugin data
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "live-volcanos";

  const page = await pageService.getBySlug(slug);

  if (!page || page.publishingSettings?.status !== "published") {
    return {
      title: "Page Not Found | Andaman Excursion",
      description: "The page you're looking for doesn't exist.",
    };
  }

  // Use SEO plugin data (meta field) or fallback to page data
  const seoTitle = page.meta?.title || page.title || "Andaman Excursion";
  const seoDescription =
    page.meta?.description || "Witness India's Only Active Volcano";
  const seoImageUrl = getImageUrl(page.meta?.image);
  const canonicalUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
  }${slug === "home" ? "" : `${slug}`}`;

  return {
    title: seoTitle,
    description: seoDescription,
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
  };
}
