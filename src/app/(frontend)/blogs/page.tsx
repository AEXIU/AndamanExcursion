import { Metadata } from "next";
import { pageDataService } from "@/services/payload";
import styles from "./page.module.css";
import { DescriptionText, SectionTitle } from "@/components/atoms";

import placeholderImage from "@images/homepage/andamanCalling/image.png";
import { BlogCard } from "@/components/molecules/Cards";
import MediaContainer from "@/components/atoms/MediaContainer/MediaContainer";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    author?: string;
    sort?: "recent" | "popular" | "oldest";
  }>;
};

export default async function BlogsListingPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const tag = resolvedParams.tag;
  const author = resolvedParams.author;
  const sortBy = resolvedParams.sort || "recent";

  // Get blog listing data
  const pageData = await pageDataService.getBlogListingPageData({
    page,
    limit: 6,
    tags: tag ? [tag] : undefined,
    author: author !== "all" ? author : undefined,
    sortBy,
  });

  const { blogs, pagination } = pageData;

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <MediaContainer
          src={placeholderImage.src}
          className={styles.heroImage}
          alt="Boat Hero Image"
        />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Exploring the Hidden Beauty of Havelock
          </h1>
        </div>
      </section>

      {/* Blog Grid */}
      <section className={styles.blogGrid}>
        <SectionTitle
          text="Recent Blog Posts"
          headingLevel="h1"
          specialWord="Blog Posts"
        />
        <DescriptionText
          className={styles.description}
          text="From snorkeling in coral gardens to jet skiing across blue horizons your adventure begins here."
        />
        <div className={styles.container}>
          {blogs.length > 0 ? (
            <>
              <div className={styles.grid}>
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    title={blog.title}
                    description={blog.description}
                    category={blog.tags?.[0]}
                    date={new Date(blog.publishedDate).toLocaleDateString(
                      "en-US",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                    image={{
                      src: blog.image,
                      alt: blog.title,
                    }}
                    href={blog.href}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                  {pagination.hasPrevPage && (
                    <a
                      href={`/blogs?page=${pagination.currentPage - 1}${
                        tag ? `&tag=${tag}` : ""
                      }${author ? `&author=${author}` : ""}${
                        sortBy !== "recent" ? `&sort=${sortBy}` : ""
                      }`}
                      className={styles.paginationButton}
                    >
                      Previous
                    </a>
                  )}

                  <span className={styles.paginationInfo}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  {pagination.hasNextPage && (
                    <a
                      href={`/blogs?page=${pagination.currentPage + 1}${
                        tag ? `&tag=${tag}` : ""
                      }${author ? `&author=${author}` : ""}${
                        sortBy !== "recent" ? `&sort=${sortBy}` : ""
                      }`}
                      className={styles.paginationButton}
                    >
                      Next
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3>No blogs found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Travel Blog | Andaman Excursion",
  description:
    "Read our latest travel tips, destination guides, and stories from the beautiful Andaman Islands. Discover hidden gems and plan your perfect trip.",
  openGraph: {
    title: "Travel Blog | Andaman Excursion",
    description:
      "Read our latest travel tips, destination guides, and stories from the beautiful Andaman Islands.",
    url: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
    }/blogs`,
    siteName: "Andaman Excursion",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Blog | Andaman Excursion",
    description:
      "Read our latest travel tips, destination guides, and stories from the beautiful Andaman Islands.",
  },
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://andamanexcursion.com"
    }/blogs`,
  },
};
