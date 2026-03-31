// globals/Navigation.ts
import { GlobalConfig } from "payload";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation",
  admin: {
    group: "Site Settings",
  },
  fields: [
    {
      name: "mainNavigation",
      type: "array",
      label: "Main Navigation Items",
      admin: {
        description: "Configure the main header navigation menu",
      },
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            { label: "Simple Link", value: "simple" },
            { label: "Activities Dropdown", value: "activities" },
            { label: "Packages Dropdown", value: "packages" },
            { label: "Specials Dropdown", value: "specials" },
            { label: "Experiences Dropdown", value: "destinations" },
            { label: "Custom Dropdown", value: "custom" },
          ],
          admin: {
            description: "Type of navigation item",
          },
        },
        {
          name: "label",
          type: "text",
          required: true,
          admin: {
            description: "Display text for the navigation item",
          },
        },
        {
          name: "href",
          type: "text",
          required: true,
          admin: {
            description: "URL for the main link (e.g., /activities, /packages)",
          },
        },
        {
          name: "isClickable",
          type: "checkbox",
          defaultValue: true,
          admin: {
            description: "Whether the parent item should be clickable",
          },
        },
        {
          name: "unique",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Apply unique styling (e.g., CTA button)",
          },
        },
        // Activity Categories Relationship
        {
          name: "activityCategories",
          type: "relationship",
          relationTo: "activity-categories",
          hasMany: true,
          admin: {
            condition: (data, siblingData) =>
              siblingData?.type === "activities",
            description: "Select activity categories to show in dropdown",
          },
          filterOptions: {
            isActive: { equals: true },
          },
        },
        // Package Categories Relationship
        {
          name: "packageCategories",
          type: "relationship",
          relationTo: "package-categories",
          hasMany: true,
          admin: {
            condition: (data, siblingData) => siblingData?.type === "packages",
            description: "Select package categories to show in dropdown",
          },
          filterOptions: {
            "displaySettings.isActive": { equals: true },
          },
        },
        // Destinations Configuration (Optional - Auto-populated from Pages)
        {
          name: "destinationConfig",
          type: "array",
          admin: {
            condition: (data, siblingData) =>
              siblingData?.type === "destinations",
            description:
              "OPTIONAL: Manual override for destination navigation. Leave empty to auto-populate from destination pages in the Pages collection.",
          },
          fields: [
            {
              name: "mainCategory",
              type: "text",
              required: true,
              admin: {
                description:
                  "Main destination category (e.g., Port Blair, Havelock, Neil Island)",
              },
            },
            {
              name: "mainCategorySlug",
              type: "text",
              required: true,
              admin: {
                description:
                  "URL slug for the main category (e.g., port-blair, havelock, neil-island)",
              },
            },
            {
              name: "subcategories",
              type: "array",
              admin: {
                description:
                  "Subcategories/specific locations within this main category",
              },
              fields: [
                {
                  name: "name",
                  type: "text",
                  required: true,
                  admin: {
                    description: "Name of the subcategory/location",
                  },
                },
                {
                  name: "slug",
                  type: "text",
                  required: true,
                  admin: {
                    description: "URL slug for the subcategory",
                  },
                },
                {
                  name: "isActive",
                  type: "checkbox",
                  defaultValue: true,
                  admin: {
                    description: "Show this subcategory in navigation",
                  },
                },
              ],
            },
            {
              name: "isActive",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Show this main category in navigation",
              },
            },
            {
              name: "order",
              type: "number",
              defaultValue: 0,
              admin: {
                description: "Display order for this main category",
              },
            },
          ],
        },
        // // Specials Categories Relationship (assuming you have this collection)
        // {
        //   name: "specialCategories",
        //   type: "relationship",
        //   relationTo: "special-categories", // Update with your actual collection slug
        //   hasMany: true,
        //   admin: {
        //     condition: (data, siblingData) => siblingData?.type === "specials",
        //     description: "Select special categories to show in dropdown",
        //   },
        //   filterOptions: {
        //     isActive: { equals: true },
        //   },
        // },
        // Custom Dropdown Items (fallback for manually managed items)
        {
          name: "customItems",
          type: "array",
          admin: {
            condition: (data, siblingData) => siblingData?.type === "custom",
            description: "Custom dropdown items (use for destinations, etc.)",
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
            },
            {
              name: "href",
              type: "text",
              required: true,
            },
            {
              name: "isActive",
              type: "checkbox",
              defaultValue: true,
            },
          ],
        },
        // Display Settings
        {
          name: "displaySettings",
          type: "group",
          admin: {
            position: "sidebar",
          },
          fields: [
            {
              name: "order",
              type: "number",
              defaultValue: 0,
              admin: {
                description: "Display order in navigation",
              },
            },
            {
              name: "isActive",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Show this item in navigation",
              },
            },
            {
              name: "maxDropdownItems",
              type: "number",
              defaultValue: 10,
              admin: {
                condition: (data, siblingData) =>
                  [
                    "activities",
                    "packages",
                    "specials",
                    "destinations",
                  ].includes(siblingData?.type),
                description: "Maximum number of items to show in dropdown",
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // Optional: Clear navigation cache when updated
        // Implement your cache clearing logic here
        console.log("Navigation updated, clearing cache...");
      },
    ],
  },
};

export default Navigation;
