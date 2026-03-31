import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { activityCategoryService, pageService } from "@/services/payload";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";

type PageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function Activities({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "activities";

  const page = await pageService.getBySlug(slug);

  if (!page || !page.pageContent?.content) {
    notFound();
  }

  if (page.publishingSettings?.status !== "published") {
    notFound();
  }

  return <BlockRenderer blocks={page.pageContent.content} />;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await pageService.getBySlug("activities");
    const categories = await activityCategoryService.getActive();

    const categoryNames = categories.map((cat) => cat.name).join(", ");

    if (!page) {
      return {
        title: "Activities in Andaman Islands | Andaman Excursion",
        description:
          "Discover exciting water sports, adventure activities, and unique experiences in the Andaman Islands. Book your perfect activity today.",
      };
    }

    const seo = page.meta;
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";

    const title =
      seo?.title || "Activities in Andaman Islands | Andaman Excursion";
    const description =
      seo?.description ||
      `Discover exciting water sports, adventure activities, and unique experiences in the Andaman Islands. Categories include: ${categoryNames}.`;

    let imageUrl = null;
    if (seo?.image) {
      imageUrl = getImageUrl(seo.image);
    }

    const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/activities`;

    return {
      title,
      description,
      keywords:
        // seo?.keywords ||
        "andaman activities, water sports, scuba diving, adventure, tourism, andaman islands",
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
        index: page.publishingSettings?.status === "published",
        follow: page.publishingSettings?.status === "published",
        googleBot: {
          index: page.publishingSettings?.status === "published",
          follow: page.publishingSettings?.status === "published",
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: canonicalUrl,
      },
      other: {
        ...(page.publishingSettings?.publishedAt && {
          "article:published_time": page.publishingSettings.publishedAt,
        }),
        ...(page.updatedAt && {
          "article:modified_time": page.updatedAt,
        }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata for activities page:", error);
    return {
      title: "Activities in Andaman Islands | Andaman Excursion",
      description:
        "Discover exciting water sports, adventure activities, and unique experiences in the Andaman Islands.",
    };
  }
}
