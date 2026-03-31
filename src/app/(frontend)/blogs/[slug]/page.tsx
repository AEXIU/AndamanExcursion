import { RichText } from "@payloadcms/richtext-lexical/react";

import { notFound } from "next/navigation";
import styles from "./page.module.css";
import { Metadata } from "next";
import { getImageUrl } from "@/utils/getImageUrl";
import { pageDataService } from "@/services/payload";
import MediaContainer from "@/components/atoms/MediaContainer/MediaContainer";
import { SectionTitle } from "@/components/atoms";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  console.log(`🔍 [BlogPage] Attempting to load blog with slug: "${slug}"`);

  // Use the new pageDataService method
  const pageData = await pageDataService.getBlogPageData(slug);

  console.log(`🔍 [BlogPage] pageData result:`, {
    hasPageData: !!pageData,
    hasBlog: !!pageData?.blog,
    blogTitle: pageData?.blog?.title,
    blogStatus: pageData?.blog?.status,
    hasContent: !!pageData?.blog?.content,
  });

  if (!pageData || !pageData.blog?.content) {
    console.log(
      `❌ [BlogPage] Blog not found or no content for slug: "${slug}"`
    );
    notFound();
  }

  const { blog } = pageData;

  if (blog.status !== "published") {
    console.log(
      `❌ [BlogPage] Blog "${slug}" is not published (status: ${blog.status})`
    );
    notFound();
  }

  console.log(`✅ [BlogPage] Successfully loaded blog: "${blog.title}"`);

  return (
    <main className={styles.main}>
      <article>
        <header>
          <div className={styles.hero}>
            <MediaContainer
              src={getImageUrl(blog.featuredImage)}
              alt={blog.title}
              className={styles.heroImage}
            />
          </div>
          <h2 className={styles.quote}>
            {blog.quote || "Consider this is the quote"}
          </h2>
          <div className={styles.authorInfo}>
            <span>By {blog.author}</span>
            <span>•</span>
            <time>{new Date(blog.publishedDate).toLocaleDateString()}</time>
          </div>
          <SectionTitle
            text={blog.title}
            headingLevel="h1"
            specialWord={blog.title}
            className={styles.title}
          />
        </header>
        <div>
          <RichText data={blog.content} />
        </div>
      </article>
    </main>
  );
}

// Generate static params for all specials pages
export async function generateStaticParams() {
  try {
    return await pageDataService.getBlogStaticParams();
  } catch (error) {
    console.error("Error generating static params for blogs:", error);
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

  const pageData = await pageDataService.getBlogPageData(slug);

  if (!pageData || pageData.blog?.status !== "published") {
    return {
      title: "Page Not Found | Andaman Excursion",
      description: "The page you're looking for doesn't exist.",
    };
  }

  const { blog } = pageData;

  // Use SEO plugin data (meta field) or fallback to page data
  const seoTitle = blog.title || "Andaman Excursion";
  const seoDescription = blog.description || "Special experiences in Andaman";
  const seoImageUrl = getImageUrl(blog.featuredImage);

  const canonicalUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
  }/blogs${slug}`; // slug already includes a / prefix

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
              alt: blog.title || seoTitle,
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
