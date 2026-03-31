import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { pageService } from "@/services/payload";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";

// ISR Configuration - Revalidate every 60 seconds
export const revalidate = 60;

export default async function RefundPolicy() {
  const slug = "refund-policy";

  const page = await pageService.getBySlug(slug);

  if (!page || !page.pageContent?.content) {
    notFound();
  }

  if (page.publishingSettings?.status !== "published") {
    notFound();
  }

  return <BlockRenderer blocks={page.pageContent.content} />;
}

// Generate dynamic metadata using SEO plugin data
export async function generateMetadata(): Promise<Metadata> {
  const slug = "refund-policy";

  const page = await pageService.getBySlug(slug);

  if (!page || page.publishingSettings?.status !== "published") {
    return {
      title: "Refund Policy | Andaman Excursion",
      description: "Read the refund policy for Andaman Excursion services.",
    };
  }

  // Use SEO plugin data (meta field) or fallback to page data
  const seoTitle = page.meta?.title || page.title || "Refund Policy | Andaman Excursion";
  const seoDescription =
    page.meta?.description || "Read the refund policy for Andaman Excursion services.";
  const seoImageUrl = getImageUrl(page.meta?.image);
  const canonicalUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
  }/refund-policy`;

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
