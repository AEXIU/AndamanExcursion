import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { pageService } from "@/services/payload";
import { getImageUrl } from "@/utils/getImageUrl";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function Home({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "boat";

  const page = await pageService.getBySlug(slug);

  if (!page || !page.pageContent?.content) {
    notFound();
  }

  if (page.publishingSettings?.status !== "published") {
    notFound();
  }

  return (
    <>
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          margin: "-1px",
          padding: 0,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          border: 0,
        }}
      >
        Island hopping starts here
      </h1>
      <BlockRenderer blocks={page.pageContent.content} />
    </>
  );
}

// Generate static params for boat pages
export async function generateStaticParams() {
  try {
    // Since there are only 3 boat routes and no categories,
    // we'll generate static params for the main boat pages
    const staticParams = [];

    // Add the main boat page (if this is the index boat page)
    staticParams.push({ slug: undefined }); // This handles /boat

    // Add the boat search page
    staticParams.push({ slug: "search" });

    // You could also add specific boat route pages if needed
    // For example, if you want individual route pages:
    // const boatRoutes = await boatRouteService.getAll(); // You'll need to create this service
    // for (const route of boatRoutes) {
    //   staticParams.push({ slug: route.slug });
    // }

    return staticParams;
  } catch (error) {
    console.error("Error generating static params for boat pages:", error);
    return [{ slug: undefined }]; // Fallback to main boat page
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || "boat";
    const page = await pageService.getBySlug(slug);

    if (!page) {
      return {
        title: "Page Not Found | Andaman Excursion",
        description: "The requested page does not exist.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Extract SEO data from page structure
    const title =
      // page.seo?.metaTitle ||
      page.meta?.title || `${page.title} | Andaman Excursion`;

    const description =
      // page.seo?.metaDescription ||
      page.meta?.description ||
      // page description ||
      "Experience the best boat trips and ferry services in Andaman Islands. Book your island hopping adventure today.";

    // Get image from page media or SEO settings
    let imageUrl = null;
    // if (page.seo?.metaImage) {
    //   imageUrl = getImageUrl(page.seo.metaImage);
    if (page.meta?.image) {
      imageUrl = getImageUrl(page.meta.image);
      // } else if (page.featuredImage) {
      //   imageUrl = getImageUrl(page.featuredImage);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    const canonicalUrl = `${baseUrl.replace(/\/$/, "")}/${
      slug === "boat" ? "boat" : slug
    }`;

    // Build keywords from page data and boat-specific terms
    const keywords =
      // page.seo?.keywords ||
      // page.meta?.keywords ||
      [
        "Andaman boat trips",
        "ferry services",
        "island hopping",
        "Port Blair ferry",
        "Havelock ferry",
        "Ross Island boat",
        "Andaman excursion",
        "boat booking",
        "ferry booking",
        "Andaman travel",
      ].join(", ");

    return {
      title,
      description,
      keywords: typeof keywords === "string" ? keywords : [],
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
                alt: page.title || "Andaman Boat Trips",
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
        index: page.publishingSettings?.status === "published",
        follow: page.publishingSettings?.status === "published",
        googleBot: {
          index: page.publishingSettings?.status === "published",
          follow: page.publishingSettings?.status === "published",
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      // Add structured data for better SEO
      other: {
        ...(page.publishingSettings?.publishedAt && {
          "article:published_time": page.publishingSettings.publishedAt,
        }),
        ...(page.updatedAt && {
          "article:modified_time": page.updatedAt,
        }),
        // Add boat-specific structured data
        "og:type": "website",
        "og:section": "Travel",
      },
    };
  } catch (error) {
    console.error("Error generating metadata for boat page:", error);
    return {
      title: "Boat Trips | Andaman Excursion",
      description:
        "Experience the best boat trips and ferry services in Andaman Islands. Book your island hopping adventure today.",
    };
  }
}
