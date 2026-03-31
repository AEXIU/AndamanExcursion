import { CollectionConfig } from "payload";
import { contentBlocks } from "./blocks";
import { revalidationHooks } from "../../../../utils/revalidation";

export const pageTypeOptions = [
  { label: "Home", value: "home" },
  { label: "Activities", value: "activities" },
  { label: "Fishing", value: "fishing" },
  { label: "Live Volcanos", value: "live-volcanos" },
  { label: "Specials", value: "specials" },
  { label: "Packages", value: "packages" },
  { label: "Experiences", value: "destinations" },
  { label: "Ferry", value: "ferry" },
  { label: "Boat", value: "boat" },
  { label: "Plan Your Trip", value: "plan-your-trip" },
  { label: "About", value: "about" },
  { label: "Blogs", value: "blogs" },
  { label: "Contact", value: "contact" },
  { label: "Terms & Conditions", value: "terms-conditions" },
  { label: "Privacy Policy", value: "privacy-policy" },
  { label: "Refund Policy", value: "refund-policy" },
  { label: "FAQs", value: "faqs" },
];

const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "pageType", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  fields: [
    // === BASIC INFORMATION ===
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Main title of the page",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      admin: {
        description:
          "URL path for this page (auto-generated from title, but can be customized)",
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from title if not provided
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
                .replace(/\s+/g, "-") // Replace spaces with hyphens
                .replace(/-+/g, "-") // Replace multiple hyphens with single
                .trim();
            }
            return value;
          },
        ],
      },
    },
    {
      name: "basicInfo",
      type: "group",
      label: "Basic Information",
      admin: {
        description: "Essential page details",
        position: "sidebar",
      },
      fields: [
        {
          name: "pageType",
          type: "select",
          required: true,
          options: pageTypeOptions,
          defaultValue: "home",
          admin: {
            description: "Type of page this is",
          },
        },
      ],
    },

    // === DESTINATION-SPECIFIC FIELDS ===
    {
      name: "destinationInfo",
      type: "group",
      label: "Destination Settings",
      admin: {
        condition: (data) => data.basicInfo?.pageType === "destinations",
        description:
          "Configure this destination page. Main destinations appear as bold categories in navigation, sub-destinations appear as indented items underneath their parent.",
        position: "sidebar",
      },
      fields: [
        {
          name: "destinationType",
          type: "select",
          required: true,
          options: [
            { label: "Experiences Index (Overview Page)", value: "index" },
            { label: "Main Destination Category", value: "main" },
            { label: "Sub-Destination (Beach/Attraction)", value: "sub" },
          ],
          admin: {
            description: "Is this a main category or a sub-destination?",
          },
        },
        // Fields for INDEX destinations (overview/landing page)
        {
          name: "indexSettings",
          type: "group",
          label: "Index Page Settings",
          admin: {
            condition: (data, siblingData) =>
              siblingData?.destinationType === "index",
            description: "Settings for the main destinations overview page",
          },
          fields: [
            {
              name: "showAllDestinations",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description:
                  "Automatically include all published main destinations",
              },
            },
            {
              name: "featuredDestinations",
              type: "relationship",
              relationTo: "pages",
              hasMany: true,
              filterOptions: {
                "basicInfo.pageType": { equals: "destinations" },
                "destinationInfo.destinationType": { equals: "main" },
              },
              admin: {
                description:
                  "Select specific destinations to feature (optional - overrides automatic inclusion)",
              },
            },
            {
              name: "destinationOrder",
              type: "array",
              admin: {
                description:
                  "Custom ordering for destinations (drag to reorder)",
              },
              fields: [
                {
                  name: "destination",
                  type: "relationship",
                  relationTo: "pages",
                  filterOptions: {
                    "basicInfo.pageType": { equals: "destinations" },
                    "destinationInfo.destinationType": { equals: "main" },
                  },
                },
                {
                  name: "displayOrder",
                  type: "number",
                  admin: {
                    description: "Lower numbers appear first",
                  },
                },
              ],
            },
          ],
        },
        // Fields for MAIN destinations (Port Blair, Havelock, etc.)
        {
          name: "mainCategorySlug",
          type: "text",
          required: true,
          admin: {
            condition: (data, siblingData) =>
              siblingData?.destinationType === "main",
            description:
              "URL slug for this main category (auto-generated from page title, but can be customized)",
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                // Auto-generate mainCategorySlug from title if not provided and this is a main destination
                if (
                  !value &&
                  data?.title &&
                  data?.destinationInfo?.destinationType === "main"
                ) {
                  return data.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
                    .replace(/\s+/g, "-") // Replace spaces with hyphens
                    .replace(/-+/g, "-") // Replace multiple hyphens with single
                    .trim();
                }
                return value;
              },
            ],
          },
        },
        // Fields for SUB destinations (specific locations)
        {
          name: "parentMainCategory",
          type: "relationship",
          relationTo: "pages",
          required: true,
          filterOptions: ({ relationTo, data }) => {
            return {
              "basicInfo.pageType": { equals: "destinations" },
              "destinationInfo.destinationType": { equals: "main" },
              id: { not_equals: data.id }, // Prevent self-reference
            };
          },
          admin: {
            condition: (data, siblingData) =>
              siblingData?.destinationType === "sub",
            description:
              "Select the main destination category this belongs to (Port Blair, Havelock, etc.)",
          },
        },
        {
          name: "subcategorySlug",
          type: "text",
          required: true,
          admin: {
            condition: (data, siblingData) =>
              siblingData?.destinationType === "sub",
            description:
              "URL slug for this sub-destination (auto-generated from page title, but can be customized)",
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                // Auto-generate subcategorySlug from title if not provided and this is a sub destination
                if (
                  !value &&
                  data?.title &&
                  data?.destinationInfo?.destinationType === "sub"
                ) {
                  return data.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
                    .replace(/\s+/g, "-") // Replace spaces with hyphens
                    .replace(/-+/g, "-") // Replace multiple hyphens with single
                    .trim();
                }
                return value;
              },
            ],
          },
        },
        {
          name: "subcategoryType",
          type: "select",
          options: [
            { label: "Beach", value: "beach" },
            { label: "Island", value: "island" },
            { label: "Attraction", value: "attraction" },
            { label: "Museum", value: "museum" },
            { label: "Point/Viewpoint", value: "point" },
            { label: "Sports Complex", value: "sports" },
            { label: "Cave", value: "cave" },
            { label: "Waterfall", value: "waterfall" },
            { label: "Other", value: "other" },
          ],
          admin: {
            condition: (data, siblingData) =>
              siblingData?.destinationType === "sub",
            description: "What type of destination is this?",
          },
        },
        // Navigation Integration Fields
        {
          name: "navigationSettings",
          type: "group",
          label: "Navigation Settings",
          admin: {
            description:
              "Control how this destination appears in the header navigation dropdown. Destinations are automatically included in navigation - you can control visibility and order here.",
          },
          fields: [
            {
              name: "showInNavigation",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description:
                  "Display this destination in the header navigation",
              },
            },
            {
              name: "navigationOrder",
              type: "number",
              defaultValue: 0,
              admin: {
                description:
                  "Order in navigation dropdown (lower numbers first)",
              },
            },
            {
              name: "navigationLabel",
              type: "text",
              admin: {
                description:
                  "Custom label for navigation (defaults to page title)",
              },
            },
          ],
        },
      ],
    },

    // === PAGE CONTENT ===
    {
      name: "pageContent",
      type: "group",
      label: "Page Content",
      admin: {
        description: "Main content blocks for this page",
      },
      fields: [
        {
          name: "content",
          type: "blocks",
          blocks: contentBlocks,
          label: "Content Blocks",
          admin: {
            description: "Add and arrange content blocks for this page",
          },
        },
      ],
    },

    // === PUBLISHING & STATUS ===
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
          defaultValue: "published",
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
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Guard against undefined data
        if (!data) return;

        // Validation for destination pages
        if (
          data.basicInfo?.pageType === "destinations" &&
          data.destinationInfo
        ) {
          const {
            destinationType,
            mainCategorySlug,
            subcategorySlug,
            parentMainCategory,
          } = data.destinationInfo;

          // Validate main category slug format
          if (destinationType === "main") {
            if (!mainCategorySlug) {
              throw new Error(
                "Main Category Slug is required for main destinations"
              );
            }
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(mainCategorySlug)) {
              throw new Error(
                "Main Category Slug must be lowercase, alphanumeric, and use hyphens for spaces"
              );
            }
          }

          // Validate subcategory slug format
          if (destinationType === "sub") {
            if (!subcategorySlug) {
              throw new Error(
                "Subcategory Slug is required for sub-destinations"
              );
            }
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subcategorySlug)) {
              throw new Error(
                "Subcategory Slug must be lowercase, alphanumeric, and use hyphens for spaces"
              );
            }
            if (!parentMainCategory) {
              throw new Error(
                "Parent Main Category is required for sub-destinations"
              );
            }
          }

          // Sync main slug field with mainCategorySlug for consistency
          if (destinationType === "main" && mainCategorySlug) {
            data.slug = mainCategorySlug;
          } else if (destinationType === "sub" && subcategorySlug) {
            // For sub-destinations, use the subcategory slug as the main slug
            data.slug = subcategorySlug;
          }
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Log navigation updates for cache clearing
        if (doc.basicInfo?.pageType === "destinations") {
          console.log(`Destination page ${operation}d: ${doc.title}`, {
            destinationType: doc.destinationInfo?.destinationType,
            mainCategorySlug: doc.destinationInfo?.mainCategorySlug,
            subcategorySlug: doc.destinationInfo?.subcategorySlug,
          });
        }

        // Trigger revalidation for page changes
        await revalidationHooks.pages({ doc, operation, req });
      },
    ],
    afterDelete: [
      // Trigger revalidation when pages are deleted
      revalidationHooks.pages,
    ],
  },
};

export default Pages;
