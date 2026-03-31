import { CollectionConfig } from "payload";

const PackageCategories: CollectionConfig = {
  slug: "package-categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "order", "isActive"],
    description: "Manage package category information displayed on the website",
    group: "Packages",
  },
  access: {
    read: () => true,
  },
  fields: [
    // Core Information
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          'Display title for the category (e.g., "Honeymoon Packages")',
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          'URL slug (auto-generated from title, e.g., "honeymoon-retreat")',
        readOnly: false, // Allow manual editing if needed
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from title if not provided or if title changed
            if ((!value || value === "") && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            }
            return value;
          },
        ],
      },
    },
    // Category Details
    {
      type: "group",
      name: "categoryDetails",
      fields: [
        {
          name: "description",
          type: "textarea",
          required: true,
          admin: {
            description: "Brief description shown on category cards",
          },
        },
        {
          name: "shortDescription",
          type: "text",
          admin: {
            description: "Shorter version for compact displays",
          },
        },
      ],
    },
    // Media
    {
      type: "group",
      name: "media",
      fields: [
        {
          name: "heroImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Main image for the category",
          },
        },
        {
          name: "cardImages",
          type: "array",
          maxRows: 3,
          admin: {
            description: "Images shown on category cards (max 3)",
          },
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            // {
            //   name: "alt",
            //   type: "text",
            //   required: true,
            // },
          ],
        },
      ],
    },
    // Display Settings (Sidebar)
    {
      type: "group",
      name: "displaySettings",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          name: "order",
          type: "number",
          required: true,
          defaultValue: 1,
          admin: {
            description: "Display order on the packages page",
          },
        },
        {
          name: "isActive",
          type: "checkbox",
          defaultValue: true,
          index: true,
          admin: {
            description: "Show this category on the website",
          },
        },
        {
          name: "isFeatured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Feature this category prominently",
          },
        },
        {
          name: "pageTitle",
          type: "text",
          admin: {
            description:
              'Custom page title for category page (e.g., "Honeymoon")',
          },
        },
        {
          name: "specialWord",
          type: "text",
          admin: {
            description: "Word to highlight in the page title",
          },
        },
      ],
    },
    // Content
    {
      type: "group",
      name: "content",
      fields: [
        {
          name: "highlights",
          type: "array",
          maxRows: 5,
          admin: {
            description: "Key highlights or features of this category",
          },
          fields: [
            {
              name: "highlight",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "popularDestinations",
          type: "array",
          maxRows: 8,
          admin: {
            description: "Popular destinations for this category",
          },
          fields: [
            {
              name: "destination",
              type: "text",
              required: true,
            },
            {
              name: "isPopular",
              type: "checkbox",
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Ensure systemCategoryId is always set based on slug
        if (data?.slug) {
          data.systemCategoryId = data.slug;
        }

        // Auto-generate pageTitle and specialWord if not provided
        if (!data?.displaySettings?.pageTitle && data?.title) {
          data.displaySettings = {
            ...data.displaySettings,
            pageTitle: data.title.replace(/\s+packages?/gi, "").trim(),
          };
        }

        if (
          !data?.displaySettings?.specialWord &&
          data?.displaySettings?.pageTitle
        ) {
          data.displaySettings = {
            ...data.displaySettings,
            specialWord: data.displaySettings.pageTitle,
          };
        }

        return data;
      },
    ],
    beforeValidate: [
      ({ data }) => {
        // Remove any legacy categoryId field from incoming data
        if (data?.categoryDetails?.categoryId) {
          delete data.categoryDetails.categoryId;
        }
        if (data?.categoryId) {
          delete data.categoryId;
        }
        return data;
      },
    ],
  },
};

export default PackageCategories;
