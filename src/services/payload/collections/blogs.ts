import { Blog } from "@payload-types";
import { getCachedPayload } from "../base/client";
import { queryCollection, queryBySlug, queryById } from "../base/queries";

/**
 * Blog Services
 * -------------
 * Handle all blog-related operations
 */

export const blogService = {
  // Get all published blogs
  async getAll(): Promise<Blog[]> {
    try {
      const result = await queryCollection<Blog>("blogs", {
        where: {
          status: { equals: "published" },
        },
        sort: "-publishedDate",
        depth: 2,
      });
      return result.docs;
    } catch (error) {
      console.error("Error getting blogs:", error);
      return [];
    }
  },

  // Get featured blogs
  async getFeatured(limit: number = 6): Promise<Blog[]> {
    try {
      const result = await queryCollection<Blog>("blogs", {
        where: {
          and: [
            { status: { equals: "published" } },
            { featured: { equals: true } },
          ],
        },
        sort: "-publishedDate",
        limit,
        depth: 2,
      });
      return result.docs;
    } catch (error) {
      console.error("Error getting featured blogs:", error);
      return [];
    }
  },

  // Get recent blogs
  async getRecent(limit: number = 5): Promise<Blog[]> {
    try {
      const result = await queryCollection<Blog>("blogs", {
        where: {
          status: { equals: "published" },
        },
        sort: "-publishedDate",
        limit,
        depth: 2,
      });
      return result.docs;
    } catch (error) {
      console.error("Error getting recent blogs:", error);
      return [];
    }
  },

  // Get blog by slug
  async getBySlug(slug: string): Promise<Blog | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "blogs",
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: "published" } },
          ],
        },
        limit: 1,
        depth: 2,
      });
      return (result.docs[0] as Blog) || null;
    } catch (error) {
      console.error(`Error fetching blog by slug ${slug}:`, error);
      return null;
    }
  },

  // Get blog by ID
  async getById(id: string): Promise<Blog | null> {
    try {
      const result = await queryById<Blog>("blogs", id, { depth: 2 });
      return result;
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error);
      return null;
    }
  },

  // Search blogs with filters
  async search(filters: {
    query?: string;
    tags?: string[];
    author?: string;
    limit?: number;
    page?: number;
    sortBy?: "recent" | "popular" | "oldest";
  }): Promise<{
    blogs: Blog[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const payload = await getCachedPayload();

      // Build where clause
      const conditions: any[] = [{ status: { equals: "published" } }];

      // Add text search
      if (filters.query) {
        conditions.push({
          or: [
            { title: { contains: filters.query } },
            { description: { contains: filters.query } },
          ],
        });
      }

      // Add tags filter
      if (filters.tags && filters.tags.length > 0) {
        conditions.push({
          "tags.tag": { in: filters.tags },
        });
      }

      // Add author filter
      if (filters.author) {
        conditions.push({
          author: { contains: filters.author },
        });
      }

      // Determine sort order
      let sortOrder = "-publishedDate"; // Default: recent
      if (filters.sortBy === "oldest") {
        sortOrder = "publishedDate";
      } else if (filters.sortBy === "popular") {
        sortOrder = "-featured,-publishedDate"; // Featured first, then by date
      }

      const result = await payload.find({
        collection: "blogs",
        where: { and: conditions },
        limit: filters.limit || 12,
        page: filters.page || 1,
        sort: sortOrder,
        depth: 2,
      });

      return {
        blogs: result.docs as Blog[],
        totalCount: result.totalDocs,
        hasMore: result.hasNextPage,
      };
    } catch (error) {
      console.error("Error searching blogs:", error);
      return { blogs: [], totalCount: 0, hasMore: false };
    }
  },

  // Get blogs by tag
  async getByTag(tag: string, limit: number = 10): Promise<Blog[]> {
    try {
      const result = await queryCollection<Blog>("blogs", {
        where: {
          and: [
            { status: { equals: "published" } },
            { "tags.tag": { equals: tag } },
          ],
        },
        sort: "-publishedDate",
        limit,
        depth: 2,
      });
      return result.docs;
    } catch (error) {
      console.error(`Error getting blogs by tag ${tag}:`, error);
      return [];
    }
  },

  // Get blogs by author
  async getByAuthor(author: string, limit: number = 10): Promise<Blog[]> {
    try {
      const result = await queryCollection<Blog>("blogs", {
        where: {
          and: [
            { status: { equals: "published" } },
            { author: { equals: author } },
          ],
        },
        sort: "-publishedDate",
        limit,
        depth: 2,
      });
      return result.docs;
    } catch (error) {
      console.error(`Error getting blogs by author ${author}:`, error);
      return [];
    }
  },

  // Get related blogs (by tags)
  async getRelated(
    blogId: string,
    tags: string[],
    limit: number = 3
  ): Promise<Blog[]> {
    try {
      const payload = await getCachedPayload();

      if (!tags || tags.length === 0) {
        return [];
      }

      const result = await payload.find({
        collection: "blogs",
        where: {
          and: [
            { id: { not_equals: blogId } }, // Exclude current blog
            { status: { equals: "published" } },
            { "tags.tag": { in: tags } }, // Match any of the tags
          ],
        },
        limit,
        sort: "-publishedDate",
        depth: 2,
      });

      return result.docs as Blog[];
    } catch (error) {
      console.error("Error getting related blogs:", error);
      return [];
    }
  },

  // Get blogs by multiple IDs
  async getByIds(ids: string[]): Promise<Blog[]> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "blogs",
        where: {
          and: [{ id: { in: ids } }, { status: { equals: "published" } }],
        },
        depth: 2,
      });
      return result.docs as Blog[];
    } catch (error) {
      console.error("Error getting blogs by IDs:", ids, error);
      return [];
    }
  },

  // Get all unique tags
  async getAllTags(): Promise<string[]> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "blogs",
        where: {
          status: { equals: "published" },
        },
        limit: 1000, // Get all blogs
        depth: 0, // Don't need deep population
      });

      // Extract and deduplicate tags
      const tagsSet = new Set<string>();
      result.docs.forEach((blog: any) => {
        if (blog.tags && Array.isArray(blog.tags)) {
          blog.tags.forEach((tagObj: any) => {
            if (tagObj.tag) {
              tagsSet.add(tagObj.tag);
            }
          });
        }
      });

      return Array.from(tagsSet).sort();
    } catch (error) {
      console.error("Error getting all tags:", error);
      return [];
    }
  },

  // Get all unique authors
  async getAllAuthors(): Promise<string[]> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "blogs",
        where: {
          status: { equals: "published" },
        },
        limit: 1000,
        depth: 0,
      });

      // Extract and deduplicate authors
      const authorsSet = new Set<string>();
      result.docs.forEach((blog: any) => {
        if (blog.author) {
          authorsSet.add(blog.author);
        }
      });

      return Array.from(authorsSet).sort();
    } catch (error) {
      console.error("Error getting all authors:", error);
      return [];
    }
  },

  // Get blog count
  async getCount(filters?: {
    status?: string;
    featured?: boolean;
  }): Promise<number> {
    try {
      const payload = await getCachedPayload();

      const conditions: any[] = [];

      if (filters?.status) {
        conditions.push({ status: { equals: filters.status } });
      } else {
        conditions.push({ status: { equals: "published" } });
      }

      if (filters?.featured !== undefined) {
        conditions.push({ featured: { equals: filters.featured } });
      }

      const result = await payload.count({
        collection: "blogs",
        where: conditions.length > 0 ? { and: conditions } : undefined,
      });

      return result.totalDocs;
    } catch (error) {
      console.error("Error getting blog count:", error);
      return 0;
    }
  },

  // Get paginated blogs with full control
  async getPaginated(options: {
    page?: number;
    limit?: number;
    status?: string;
    featured?: boolean;
    sort?: string;
  }): Promise<{
    blogs: Blog[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;

      const conditions: any[] = [];

      if (options.status) {
        conditions.push({ status: { equals: options.status } });
      } else {
        conditions.push({ status: { equals: "published" } });
      }

      if (options.featured !== undefined) {
        conditions.push({ featured: { equals: options.featured } });
      }

      const result = await queryCollection<Blog>("blogs", {
        where: conditions.length > 0 ? { and: conditions } : undefined,
        sort: options.sort || "-publishedDate",
        limit,
        page,
        depth: 2,
      });

      return {
        blogs: result.docs,
        totalPages: Math.ceil(result.totalDocs / limit),
        currentPage: page,
        totalCount: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      console.error("Error getting paginated blogs:", error);
      return {
        blogs: [],
        totalPages: 0,
        currentPage: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  },

  // Get blog page data with related blogs for detail page
  async getBlogPageData(slug: string): Promise<{
    blog: Blog;
    relatedBlogs: Blog[];
    breadcrumbs: Array<{ label: string; href: string }>;
  } | null> {
    try {
      const blog = await this.getBySlug(slug);

      if (!blog) return null;

      // Extract tags from the blog for finding related posts
      const blogTags =
        blog.tags?.map((tagObj: any) => tagObj.tag).filter(Boolean) || [];

      // Get related blogs based on tags
      const relatedBlogs = await this.getRelated(blog.id, blogTags, 3);

      return {
        blog,
        relatedBlogs,
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Blogs", href: "/blogs" },
          { label: blog.title, href: `/blogs/${blog.slug}` },
        ],
      };
    } catch (error) {
      console.error(`Error getting blog page data for slug ${slug}:`, error);
      return null;
    }
  },

  // Get static params for blog pages (for generateStaticParams)
  async getBlogStaticParams(): Promise<Array<{ slug: string }>> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "blogs",
        where: {
          status: { equals: "published" },
        },
        limit: 1000, // Adjust based on expected blog count
        select: {
          slug: true,
        },
      });

      return result.docs.map((blog: any) => ({
        slug: blog.slug,
      }));
    } catch (error) {
      console.error("Error getting blog static params:", error);
      return [];
    }
  },
};
