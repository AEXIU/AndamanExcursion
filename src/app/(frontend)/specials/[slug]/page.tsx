import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";

import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";
import { pageDataService } from "@/services/payload";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SpecialsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Use the new pageDataService method
  const pageData = await pageDataService.getSpecialPageData(slug);

  if (!pageData || !pageData.special?.pageContent?.content) {
    notFound();
  }

  const { special } = pageData;

  if (special.publishingSettings?.status !== "published") {
    notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={special.pageContent?.content} />
    </main>
  );
}

// Generate static params for all specials pages
export async function generateStaticParams() {
  try {
    return await pageDataService.getSpecialsStaticParams();
  } catch (error) {
    console.error("Error generating static params for specials:", error);
    // Fallback to known slugs if database query fails
    return [
      { slug: "marriage" },
      { slug: "engagement" },
      { slug: "photoshoot" },
    ];
  }
}

// Generate dynamic metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const pageData = await pageDataService.getSpecialPageData(slug);

  if (
    !pageData ||
    pageData.special?.publishingSettings?.status !== "published"
  ) {
    return {
      title: "Page Not Found | Andaman Excursion",
      description: "The page you're looking for doesn't exist.",
    };
  }

  const { special } = pageData;

  // Use SEO plugin data (meta field) or fallback to page data
  const seoTitle = special.meta?.title || special.title || "Andaman Excursion";
  const seoDescription =
    special.meta?.description || "Special experiences in Andaman";
  const seoImageUrl = getImageUrl(special.meta?.image);

  const canonicalUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
  }/specials${slug}`; // slug already includes a / prefix

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
              alt: special.title || seoTitle,
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
