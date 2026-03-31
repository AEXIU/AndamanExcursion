// blocks/dynamicCategoryPackages.ts
import { Block } from "payload";

export const dynamicCategoryPackagesBlock: Block = {
  slug: "dynamicCategoryPackages",
  labels: {
    singular: "Dynamic Category Packages Block",
    plural: "Dynamic Category Packages Blocks",
  },
  fields: [
    {
      name: "selectorTitle",
      type: "text",
      label: "Selector Section Title",
      admin: {
        description:
          "Leave empty to auto-generate from category (e.g., 'Scuba Diving Packages')",
      },
    },
    {
      name: "showPackageSelector",
      type: "checkbox",
      label: "Show Package Selector",
      defaultValue: true,
    },
    {
      name: "noPackagesMessage",
      type: "group",
      label: "No Packages Message",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Title",
          defaultValue: "No packages available",
        },
        {
          name: "message",
          type: "textarea",
          label: "Message",
          defaultValue:
            "We're currently updating our packages for this category. Please check back soon!",
        },
        {
          name: "showContactButton",
          type: "checkbox",
          label: "Show Contact Button",
          defaultValue: true,
        },
      ],
    },
    {
      name: "displayOptions",
      type: "group",
      label: "Display Options",
      fields: [
        {
          name: "packagesPerRow",
          type: "select",
          label: "Packages Per Row",
          defaultValue: "1",
          options: [
            { label: "1 per row", value: "1" },
            { label: "2 per row", value: "2" },
            { label: "3 per row", value: "3" },
          ],
        },
        {
          name: "showPackageDetails",
          type: "group",
          label: "Show Package Details",
          fields: [
            {
              name: "showPrice",
              type: "checkbox",
              label: "Show Price",
              defaultValue: true,
            },
            {
              name: "showDuration",
              type: "checkbox",
              label: "Show Duration",
              defaultValue: true,
            },
            {
              name: "showLocations",
              type: "checkbox",
              label: "Show Locations",
              defaultValue: true,
            },
          ],
        },
      ],
    },
  ],
};
