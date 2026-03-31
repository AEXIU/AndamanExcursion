// app/packages/[category]/page.tsx
import {
  pageService,
  pageDataService,
  packageCategoryService,
} from "@/services/payload";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import styles from "@/app/(frontend)/packages/page.module.css";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const { period } = await searchParams;
  const initialPeriod = period || "all";

  // Get the generic category template page
  const page = await pageService.getBySlug("packages-category-template");
  if (
    !page ||
    !page.pageContent?.content ||
    page.publishingSettings?.status !== "published"
  ) {
    console.error("Generic category template page not found or not published");
    notFound();
  }

  // Fetch category data and package options
  const [data, allCategories] = await Promise.all([
    pageDataService.getCategoryPageData(categorySlug, initialPeriod),
    packageCategoryService.getAll(),
  ]);

  if (!data) {
    notFound();
  }

  // Format package options
  const packageOptions = allCategories.map((category) => ({
    id: category.slug,
    label: category.title?.replace(" Packages", "") || category.title,
  }));

  // Inject dynamic data into blocks
  const enrichedBlocks = page.pageContent.content.map((block) => {
    if (block.blockType === "dynamicCategoryPackages") {
      return {
        ...block,
        // Inject all the dynamic data
        category: data.category,
        packages: data.packages,
        periodOptions: data.periodOptions,
        packageOptions,
        initialPeriod,
      };
    }
    return block;
  });

  return (
    <div className={styles.main}>
      <BlockRenderer blocks={enrichedBlocks as any} />
    </div>
  );
}

// Generate static params for better performance
export async function generateStaticParams() {
  try {
    const categories = await packageCategoryService.getAll();
    return categories.map((category) => ({
      category: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Enhanced metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  try {
    const { category: categorySlug } = await params;
    const data = await pageDataService.getCategoryPageData(categorySlug);

    if (!data || !data.category) {
      return {
        title: "Category Not Found | Andaman Excursion",
        description: "The requested category does not exist.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const category = data.category;
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com";
    const canonicalUrl = `${baseUrl.replace(
      /\/$/,
      ""
    )}/packages/${categorySlug}`;

    // Extract SEO data with fallbacks
    const title =
      // category.seo?.metaTitle ||
      category.meta?.title ||
      `${category.title?.replace(
        " Packages",
        ""
      )} Packages | Andaman Excursion`;

    const description =
      // category.seo?.metaDescription ||
      category.meta?.description ||
      category.categoryDetails?.description ||
      `Browse our ${category.title} collection and discover amazing packages in the Andaman Islands.`;

    // Get category image
    let imageUrl = null;
    if (category.media?.heroImage) {
      imageUrl = getImageUrl(category.media.heroImage);
    } else if (category.media?.cardImages?.[0]?.image) {
      imageUrl = getImageUrl(category.media.cardImages[0].image);
      // } else if (category.seo?.metaImage) {
      //   imageUrl = getImageUrl(category.seo.metaImage);
    } else if (category.meta?.image) {
      imageUrl = getImageUrl(category.meta.image);
    }

    // Build keywords
    const keywords =
      // category.seo?.keywords ||
      // category.meta?.keywords ||
      [
        category.title,
        "Andaman Islands",
        "packages",
        "travel",
        "tourism",
        "vacation",
        "tour packages",
      ].join(", ");

    return {
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
      ),
      title,
      description,
      keywords: typeof keywords === "string" ? keywords : [],
      // : keywords?.join(", "),
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
                alt: category.title,
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
        index: category.displaySettings?.isActive !== false,
        follow: category.displaySettings?.isActive !== false,
        googleBot: {
          index: category.displaySettings?.isActive !== false,
          follow: category.displaySettings?.isActive !== false,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      other: {
        ...(category.createdAt && {
          "article:published_time": category.createdAt,
        }),
        ...(category.updatedAt && {
          "article:modified_time": category.updatedAt,
        }),
        ...(data.packages.length && {
          "product:availability":
            data.packages.length > 0 ? "in_stock" : "out_of_stock",
          "product:category": category.title,
        }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Packages | Andaman Excursion",
      description: "Discover amazing packages with Andaman Excursion",
    };
  }
}
