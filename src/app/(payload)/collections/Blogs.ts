import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const Blogs: CollectionConfig = {
  slug: "blogs",
  labels: {
    singular: "Blog",
    plural: "Blogs",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "publishedDate", "status"],
    group: "Content",
  },
  access: {
    read: () => true, // Public read access
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "The main title of the blog post",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly version of the title",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            }
            return value;
          },
        ],
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "Main image for the blog post",
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      maxLength: 300,
      admin: {
        description: "Brief description or excerpt (max 300 characters)",
      },
    },
    {
      name: "quote",
      type: "textarea",
      required: true,
      maxLength: 300,
      admin: {
        description:
          "Quote - will be displayed at the top of the blog post (max 300 characters)",
      },
    },
    {
      name: "author",
      type: "text",
      required: true,
      defaultValue: "Andaman Excursion Team",
      admin: {
        description: "Author of the blog post",
      },
    },
    {
      name: "publishedDate",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: "Date when the blog was published",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => defaultFeatures,
      }),
      admin: {
        description: "Main content of the blog post",
      },
    },
    {
      name: "tags",
      type: "array",
      maxRows: 10,
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
      admin: {
        description: "Tags for categorizing the blog post",
      },
    },
    {
      name: "readingTime",
      type: "number",
      admin: {
        description: "Estimated reading time in minutes",
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.content) {
              // Rough calculation: 200 words per minute
              const wordCount = JSON.stringify(data.content).split(
                /\s+/
              ).length;
              return Math.ceil(wordCount / 200);
            }
            return 5; // Default reading time
          },
        ],
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        {
          label: "Draft",
          value: "draft",
        },
        {
          label: "Published",
          value: "published",
        },
        {
          label: "Archived",
          value: "archived",
        },
      ],
      admin: {
        description: "Publication status of the blog post",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Mark as featured blog post",
      },
    },
  ],
  // SEO plugin will be added at the payload config level
  timestamps: true,
  versions: {
    drafts: true,
  },
};

export default Blogs;
