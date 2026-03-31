// blocks/dynamicPackages.ts
import { Block } from "payload";

export const dynamicPackagesBlock: Block = {
  slug: "dynamicPackages",
  labels: {
    singular: "Dynamic Packages Block",
    plural: "Dynamic Packages Blocks",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Section Title",
      defaultValue: "Our Packages",
      required: true,
    },
    {
      name: "specialWord",
      type: "text",
      label: "Special Word (for styling)",
      defaultValue: "Packages",
      admin: {
        description: "This word will be styled differently in the title",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Section Description",
      defaultValue: "Crafted Just For You!",
    },
    {
      name: "showPackageSelector",
      type: "checkbox",
      label: "Show Package Selector",
      defaultValue: true,
      admin: {
        description:
          "Toggle to show/hide the package and period selector above the packages grid",
      },
    },
    {
      name: "selectorTitle",
      type: "text",
      label: "Selector Section Title",
      defaultValue: "Chosen Package",
      admin: {
        condition: (data, siblingData) =>
          siblingData?.showPackageSelector === true,
        description: "Title for the package selector section",
      },
    },
    // Optional: Allow content editors to override which categories to show
    {
      name: "categoryFilter",
      type: "group",
      label: "Category Filter Options",
      admin: {
        description:
          "Leave empty to show all categories, or select specific ones to display",
      },
      fields: [
        {
          name: "useCustomSelection",
          type: "checkbox",
          label: "Use Custom Category Selection",
          defaultValue: false,
        },
        {
          name: "selectedCategories",
          type: "relationship",
          relationTo: "package-categories", // Adjust this to match your package categories collection slug
          hasMany: true,
          label: "Select Categories",
          admin: {
            condition: (data, siblingData) =>
              siblingData?.useCustomSelection === true,
            description:
              "Select which package categories to display. If none selected, all will be shown.",
          },
        },
        {
          name: "sortBy",
          type: "select",
          label: "Sort Categories By",
          defaultValue: "title",
          options: [
            {
              label: "Title (A-Z)",
              value: "title",
            },
            {
              label: "Created Date (Newest First)",
              value: "createdAt_desc",
            },
            {
              label: "Created Date (Oldest First)",
              value: "createdAt_asc",
            },
            {
              label: "Custom Order",
              value: "custom",
            },
          ],
        },
      ],
    },
  ],
};
