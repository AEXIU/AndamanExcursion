import {
  activityCategoryService,
  activityService,
} from "../collections/activities";
import { locationService } from "../collections/locations";
import {
  packageCategoryService,
  packagePeriodService,
  packageService,
} from "../collections/packages";
import { extractImageUrl, getPublishedQuery } from "../base/utils";
import { getCachedPayload } from "../base/client";
import { blogService } from "../collections/blogs";

/**
 * Page Data Service
 * -----------------
 * Combines data from multiple services to create page-ready data structures
 */

export const pageDataService = {
  /**
   * Get data needed for packages listing page
   */
  async getPackagesPageData() {
    try {
      const [categories, periods, featuredPackages] = await Promise.all([
        packageCategoryService.getAll(),
        packagePeriodService.getAll(),
        packageService.getFeatured(3),
      ]);

      return {
        packageOptions: categories.map((category) => ({
          id: category.slug,
          label: category.title?.replace(" Packages", "") || category.title,
        })),

        periodOptions: [
          { id: "all", label: "All Durations" },
          ...periods.map((period) => ({
            id: period.value,
            label: period.shortTitle || period.title,
          })),
        ],

        packageCategoriesContent: categories.map((category: any) => {
          // Ensure we have a valid media object structure for PackageCard
          const media: {
            heroImage: { image: any; alt: string } | null;
            cardImages: Array<{ image: any; alt: string }>;
          } = {
            heroImage: null,
            cardImages: [],
          };

          // Process heroImage if available
          if (category.media?.heroImage) {
            media.heroImage = {
              image: category.media.heroImage.url || category.media.heroImage,
              alt:
                category.media.heroImage.alt || `${category.title} hero image`,
            };
          }

          // Process cardImages if available
          if (
            category.media?.cardImages &&
            Array.isArray(category.media.cardImages)
          ) {
            media.cardImages = category.media.cardImages.map((img: any) => {
              // Handle different image structures
              const imageValue = img.image?.url
                ? img.image.url
                : typeof img.image === "string"
                ? img.image
                : img.image?.id || img.image;

              return {
                image: imageValue,
                alt: img.alt || `${category.title} image`,
              };
            });
          }
          // If no cardImages but we have a heroImage, use that
          else if (media.heroImage) {
            media.cardImages = [
              {
                image: media.heroImage.image,
                alt: media.heroImage.alt,
              },
            ];
          }
          // Fallback to ensure we always have at least one cardImage
          if (!media.cardImages.length) {
            media.cardImages = [
              {
                image: "/images/placeholder.png",
                alt: `${category.title} image`,
              },
            ];
          }

          return {
            id: category.id,
            slug: category.slug,
            title: category.title,
            description: category.categoryDetails?.description || "",
            media: media,
            href: `/packages/${category.slug}`,
          };
        }),

        featuredPackages: featuredPackages.map((pkg: any) => {
          // Extract valid image URL from package media
          let imageUrl = "/images/placeholder.png";

          // Handle case where we have a media.images array
          if (pkg.media?.images && pkg.media.images.length > 0) {
            const firstImage = pkg.media.images[0].image;
            imageUrl = extractImageUrl(firstImage);
          }
          // Handle case where we have a media.heroImage directly
          else if (pkg.media?.heroImage) {
            imageUrl = extractImageUrl(pkg.media.heroImage);
          }

          // Extract location name safely
          let locationName = "Andaman"; // Default fallback
          if (pkg.coreInfo?.location) {
            // If location is populated (object with name)
            if (
              typeof pkg.coreInfo.location === "object" &&
              pkg.coreInfo.location.name
            ) {
              locationName = pkg.coreInfo.location.name;
            }
            // If location is just an ID string, we might need to handle it differently
            // For now, keep the default fallback
          }

          return {
            id: pkg.id,
            slug: pkg.slug,
            title: pkg.title,
            description:
              pkg.descriptions?.shortDescription ||
              pkg.descriptions?.description,
            image: imageUrl,
            price: pkg.pricing?.price,
            duration:
              typeof pkg.coreInfo?.period === "string"
                ? pkg.coreInfo.period
                : pkg.coreInfo?.period?.shortTitle ||
                  pkg.coreInfo?.period?.title ||
                  "",
            location: locationName,
          };
        }),
      };
    } catch (error) {
      console.error("Error getting packages page data:", error);
      return {
        packageOptions: [],
        periodOptions: [{ id: "all", label: "All Durations" }],
        packageCategoriesContent: [],
        featuredPackages: [],
      };
    }
  },

  /**
   * Get data needed for a specific category page
   */
  async getCategoryPageData(categorySlug: string, period?: string) {
    try {
      const [category, periods, packages] = await Promise.all([
        packageCategoryService.getBySlug(categorySlug),
        packagePeriodService.getAll(),
        packageService.getAll({ categorySlug, period }),
      ]);

      if (!category) return null;

      // Process packages to ensure images are handled correctly
      const processedPackages = packages.map((pkg: any) => {
        let imageUrl = "/images/placeholder.png";

        // Extract image URL
        if (pkg.media?.images && pkg.media.images.length > 0) {
          imageUrl = extractImageUrl(pkg.media.images[0].image);
        } else if (pkg.media?.heroImage) {
          imageUrl = extractImageUrl(pkg.media.heroImage);
        }

        return {
          ...pkg,
          processedImage: imageUrl,
        };
      });

      return {
        category,
        packages: processedPackages,
        periodOptions: [
          { id: "all", label: "All Durations" },
          ...periods.map((p) => ({
            id: p.value,
            label: p.shortTitle || p.title,
          })),
        ],
      };
    } catch (error) {
      console.error("Error getting category page data:", error);
      return null;
    }
  },

  /**
   * Get data needed for a specific package detail page
   */
  async getPackageDetailPageData(categorySlug: string, packageSlug: string) {
    try {
      const [packageData, relatedPackages] = await Promise.all([
        packageService.getBySlug(packageSlug, categorySlug),
        packageService.getAll({ categorySlug, limit: 3 }),
      ]);

      if (!packageData) return null;

      // Filter out the current package from related packages
      const filteredRelated = relatedPackages
        .filter((pkg) => pkg.id !== packageData.id)
        .slice(0, 2); // Take only 2 related packages

      // Process package data to ensure all fields are properly formatted
      const processedPackageData = {
        ...packageData,
        // Process images
        images: Array.isArray(packageData.media?.images)
          ? packageData.media.images.map((img: any) => ({
              url: extractImageUrl(img.image),
              alt: img.alt || packageData.title,
              caption: img.caption,
            }))
          : [
              {
                url: "/images/placeholder.png",
                alt: packageData.title,
              },
            ],
      };

      // Process related packages
      const processedRelatedPackages = filteredRelated.map((pkg: any) => {
        let imageUrl = "/images/placeholder.png";

        // Extract image URL
        if (pkg.media?.images && pkg.media.images.length > 0) {
          imageUrl = extractImageUrl(pkg.media.images[0].image);
        } else if (pkg.media?.heroImage) {
          imageUrl = extractImageUrl(pkg.media.heroImage);
        }

        return {
          id: pkg.id,
          slug: pkg.slug,
          title: pkg.title,
          description:
            pkg.descriptions?.shortDescription || pkg.descriptions?.description,
          image: imageUrl,
          price: pkg.pricing?.price,
          duration:
            typeof pkg.coreInfo?.period === "string"
              ? pkg.coreInfo.period
              : pkg.coreInfo?.period?.shortTitle ||
                pkg.coreInfo?.period?.title ||
                "",
          location: pkg.coreInfo?.location || "Andaman",
          href: `/packages/${categorySlug}/${pkg.slug}`,
        };
      });

      return {
        packageData: processedPackageData,
        relatedPackages: processedRelatedPackages,
      };
    } catch (error) {
      console.error("Error getting package detail page data:", error);
      return null;
    }
  },

  /**
   * Get specific special page data by slug
   */
  async getSpecialPageData(slug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: getPublishedQuery("pages", [
          { "basicInfo.pageType": { equals: "specials" } },
          { slug: { equals: slug } },
        ]),
        limit: 1,
        depth: 2,
      });

      const special = docs[0];
      if (!special) return null;

      // Get related specials (other specials excluding current one)
      const { docs: relatedDocs } = await payload.find({
        collection: "pages",
        where: getPublishedQuery("pages", [
          { "basicInfo.pageType": { equals: "specials" } },
          { id: { not_equals: special.id } },
        ]),
        limit: 2,
        depth: 1,
      });

      return {
        special: {
          ...special,
          // Process any images or media if needed
          // heroImage: extractImageUrl(special.pageContent?.content),
          seoImage: extractImageUrl(special.meta?.image),
        },
        relatedSpecials: relatedDocs.map((related: any) => ({
          id: related.id,
          slug: related.slug,
          title: related.title,
          description: related.meta?.description || "",
          image: extractImageUrl(related.meta?.image),
          href: `/specials/${related.slug}`,
        })),
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Specials", href: "/specials" },
          { label: special.title, href: `/specials/${special.slug}` },
        ],
      };
    } catch (error) {
      console.error(`Error getting special page data for slug ${slug}:`, error);
      return null;
    }
  },

  /**
   * Get static params for specials pages (for generateStaticParams)
   */
  async getSpecialsStaticParams() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: getPublishedQuery("pages", [
          { "basicInfo.pageType": { equals: "specials" } },
        ]),
        limit: 100, // Reasonable limit for specials pages
      });

      return docs.map((special: any) => ({
        slug: special.slug,
      }));
    } catch (error) {
      console.error("Error getting specials static params:", error);
      // Fallback to known slugs if database query fails
      return [
        { slug: "marriage" },
        { slug: "engagement" },
        { slug: "photoshoot" },
      ];
    }
  },

  /**
   * Get data needed for blog listing page
   */
  async getBlogListingPageData(
    filters: {
      page?: number;
      limit?: number;
      query?: string;
      tags?: string[];
      author?: string;
      sortBy?: "recent" | "popular" | "oldest";
    } = {}
  ) {
    try {
      const [paginatedResult, featuredBlogs, allTags, allAuthors] =
        await Promise.all([
          blogService.getPaginated({
            page: filters.page || 1,
            limit: filters.limit || 12,
            status: "published",
            sort:
              filters.sortBy === "oldest" ? "publishedDate" : "-publishedDate",
          }),
          blogService.getFeatured(3),
          blogService.getAllTags(),
          blogService.getAllAuthors(),
        ]);

      // Process blogs to ensure images are handled correctly
      const processedBlogs = paginatedResult.blogs.map((blog: any) => {
        const imageUrl = extractImageUrl(blog.featuredImage);

        return {
          id: blog.id,
          slug: blog.slug,
          title: blog.title,
          description: blog.description,
          author: blog.author,
          publishedDate: blog.publishedDate,
          readingTime: blog.readingTime,
          featured: blog.featured,
          tags: blog.tags?.map((t: any) => t.tag) || [],
          image: imageUrl,
          href: `/blogs/${blog.slug}`,
        };
      });

      // Process featured blogs
      const processedFeaturedBlogs = featuredBlogs.map((blog: any) => {
        const imageUrl = extractImageUrl(blog.featuredImage);

        return {
          id: blog.id,
          slug: blog.slug,
          title: blog.title,
          description: blog.description,
          author: blog.author,
          publishedDate: blog.publishedDate,
          readingTime: blog.readingTime,
          tags: blog.tags?.map((t: any) => t.tag) || [],
          image: imageUrl,
          href: `/blogs/${blog.slug}`,
        };
      });

      return {
        blogs: processedBlogs,
        featuredBlogs: processedFeaturedBlogs,
        pagination: {
          currentPage: paginatedResult.currentPage,
          totalPages: paginatedResult.totalPages,
          totalCount: paginatedResult.totalCount,
          hasNextPage: paginatedResult.hasNextPage,
          hasPrevPage: paginatedResult.hasPrevPage,
        },
        filters: {
          tagOptions: [
            { id: "all", label: "All Tags" },
            ...allTags.map((tag) => ({
              id: tag,
              label: tag,
            })),
          ],
          authorOptions: [
            { id: "all", label: "All Authors" },
            ...allAuthors.map((author) => ({
              id: author,
              label: author,
            })),
          ],
          sortOptions: [
            { id: "recent", label: "Most Recent" },
            { id: "popular", label: "Most Popular" },
            { id: "oldest", label: "Oldest First" },
          ],
        },
      };
    } catch (error) {
      console.error("Error getting blog listing page data:", error);
      return {
        blogs: [],
        featuredBlogs: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        filters: {
          tagOptions: [{ id: "all", label: "All Tags" }],
          authorOptions: [{ id: "all", label: "All Authors" }],
          sortOptions: [
            { id: "recent", label: "Most Recent" },
            { id: "popular", label: "Most Popular" },
            { id: "oldest", label: "Oldest First" },
          ],
        },
      };
    }
  },

  /**
   * Get data needed for blog detail page
   */
  async getBlogPageData(slug: string) {
    try {
      const blogData = await blogService.getBlogPageData(slug);

      if (!blogData) return null;

      const { blog, relatedBlogs, breadcrumbs } = blogData;

      // Process main blog image
      const blogImage = extractImageUrl(blog.featuredImage);

      // Process related blogs
      const processedRelatedBlogs = relatedBlogs.map((related: any) => {
        const imageUrl = extractImageUrl(related.featuredImage);

        return {
          id: related.id,
          slug: related.slug,
          title: related.title,
          description: related.description,
          author: related.author,
          publishedDate: related.publishedDate,
          readingTime: related.readingTime,
          tags: related.tags?.map((t: any) => t.tag) || [],
          image: imageUrl,
          href: `/blogs/${related.slug}`,
        };
      });

      return {
        blog: {
          ...blog,
          processedImage: blogImage,
          tags: blog.tags?.map((t: any) => t.tag) || [],
        },
        relatedBlogs: processedRelatedBlogs,
        breadcrumbs,
      };
    } catch (error) {
      console.error(`Error getting blog page data for slug ${slug}:`, error);
      return null;
    }
  },

  /**
   * Get static params for blog pages (for generateStaticParams)
   */
  async getBlogStaticParams() {
    try {
      return await blogService.getBlogStaticParams();
    } catch (error) {
      console.error("Error getting blog static params:", error);
      return [];
    }
  },

  /**
   * Search blogs with filters (for search functionality)
   */
  async searchBlogs(filters: {
    query?: string;
    tags?: string[];
    author?: string;
    limit?: number;
    page?: number;
    sortBy?: "recent" | "popular" | "oldest";
  }) {
    try {
      const searchResults = await blogService.search({
        query: filters.query,
        tags: filters.tags,
        author: filters.author,
        limit: filters.limit || 12,
        page: filters.page || 1,
        sortBy: filters.sortBy || "recent",
      });

      // Process blogs
      const processedBlogs = searchResults.blogs.map((blog: any) => {
        const imageUrl = extractImageUrl(blog.featuredImage);

        return {
          id: blog.id,
          slug: blog.slug,
          title: blog.title,
          description: blog.description,
          author: blog.author,
          publishedDate: blog.publishedDate,
          readingTime: blog.readingTime,
          featured: blog.featured,
          tags: blog.tags?.map((t: any) => t.tag) || [],
          image: imageUrl,
          href: `/blogs/${blog.slug}`,
        };
      });

      return {
        blogs: processedBlogs,
        totalCount: searchResults.totalCount,
        hasMore: searchResults.hasMore,
      };
    } catch (error) {
      console.error("Error searching blogs:", error);
      return {
        blogs: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  },
};
