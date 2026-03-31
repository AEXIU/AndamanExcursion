import { CollectionConfig } from "payload";
import { revalidationHooks } from "../../../utils/revalidation";

const Packages: CollectionConfig = {
  slug: "packages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "period", "price", "featured"],
    group: "Packages",
  },
  access: {
    read: () => true, // Public read access
  },
  fields: [
    // Core Package Information
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description:
          "URL-friendly version of the title. This is automatically generated from the package title and cannot be edited directly. If you need to change it, update the title field above.",
        // components: {
        //   afterInput: [
        //     {
        //       path: "/path/to/SlugInfoComponent", // You'll need to create this component
        //     },
        //   ],
        // },
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from title if slug is empty or if title has changed
            if (data?.title) {
              const newSlug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, "") // Remove special characters
                .replace(/\s+/g, "-") // Replace spaces with hyphens
                .replace(/-+/g, "-") // Replace multiple hyphens with single
                .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

              return newSlug;
            }
            return value;
          },
        ],
      },
    },
    {
      name: "coreInfo",
      type: "group",
      admin: {
        description: "Core details of the package",
      },
      fields: [
        {
          name: "category",
          type: "relationship",
          relationTo: "package-categories",
          required: true,
          admin: {
            description: "Select the package category",
          },
          // Filter to only show active categories
          filterOptions: {
            "displaySettings.isActive": {
              equals: true,
            },
          },
        },
        {
          name: "period",
          type: "relationship",
          relationTo: "package-periods",
          required: true,
          admin: {
            description: "Select the package period",
          },
        },
        {
          name: "locations",
          type: "relationship",
          relationTo: "locations",
          hasMany: true, // Enable multiple selections
          required: true,
          minRows: 1, // At least one location required
          maxRows: 10, // Optional: limit maximum locations
          admin: {
            description: "Select the package locations (multiple allowed)",
          },
        },
      ],
    },
    // Descriptions
    {
      name: "descriptions",
      type: "group",
      admin: {
        description: "Descriptions for the package",
      },
      fields: [
        {
          name: "description",
          type: "textarea",
          required: true,
        },
        {
          name: "shortDescription",
          type: "text",
          admin: {
            description: "Brief description for cards and listings",
          },
        },
      ],
    },
    // Pricing
    {
      name: "pricing",
      type: "group",
      admin: {
        description: "Pricing details",
      },
      fields: [
        {
          name: "price",
          type: "number",
          required: true,
          admin: {
            description: "Price in your currency",
          },
        },
        {
          name: "originalPrice",
          type: "number",
          admin: {
            description: "Original price (for showing discounts)",
          },
        },
      ],
    },
    // Media
    {
      name: "media",
      type: "group",
      admin: {
        description: "Images for the package",
      },
      fields: [
        {
          name: "images",
          type: "array",
          required: true,
          minRows: 1,
          maxRows: 10,
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
          ],
        },
      ],
    },
    // Package Details
    {
      name: "packageDetails",
      type: "group",
      required: true,
      admin: {
        description: "Detailed package information",
      },
      fields: [
        {
          name: "highlights",
          type: "array",
          required: true,
          fields: [
            {
              name: "highlight",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "inclusions",
          type: "array",
          required: true,
          fields: [
            {
              name: "inclusion",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "exclusions",
          type: "array",
          required: true,
          fields: [
            {
              name: "exclusion",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "itinerary",
          type: "array",
          required: true,
          fields: [
            {
              name: "day",
              type: "number",
              required: true,
            },
            {
              name: "title",
              type: "text",
              required: true,
            },
            {
              name: "description",
              type: "textarea",
            },
            {
              name: "activities",
              type: "array",
              fields: [
                {
                  name: "activity",
                  type: "text",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: "notes",
          type: "array",
          fields: [
            {
              name: "note",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
    // Featured Settings (Sidebar)
    {
      name: "featuredSettings",
      type: "group",
      admin: {
        description: "Settings for featuring the package",
        position: "sidebar",
      },
      fields: [
        {
          name: "featured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Show in top 3 packages on homepage",
          },
        },
        {
          name: "featuredOrder",
          type: "number",
          admin: {
            description: "Order for featured packages (1-3)",
            condition: (data) => data.featuredSettings?.featured,
          },
        },
      ],
    },
    // Publication Settings (Sidebar)
    {
      name: "publishingSettings",
      type: "group",
      label: "Publishing Settings",
      admin: {
        description: "Control page visibility and publishing",
        position: "sidebar",
      },
      fields: [
        {
          name: "status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Archived", value: "archived" },
          ],
          defaultValue: "draft",
          admin: {
            description: "Publishing status of this page",
          },
        },
        {
          name: "publishedAt",
          type: "date",
          admin: {
            description: "When this page was published",
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                // Auto-set published date when status changes to published
                if (
                  !value &&
                  data?.publishingSettings?.status === "published"
                ) {
                  return new Date();
                }
                return value;
              },
            ],
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      // Trigger revalidation for package changes
      revalidationHooks.packages,
    ],
    afterDelete: [
      // Trigger revalidation when packages are deleted
      revalidationHooks.packages,
    ],
  },
};

export default Packages;
