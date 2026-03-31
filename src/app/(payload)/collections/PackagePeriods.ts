import { CollectionConfig } from "payload";

const PackagePeriods: CollectionConfig = {
  slug: "package-periods",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "value", "order", "isActive"],
    group: "Packages",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Display name (e.g., '3 Days 2 Nights')",
      },
    },
    {
      name: "value",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Internal value (e.g., '3-2')",
      },
    },
    {
      name: "shortTitle",
      type: "text",
      admin: {
        description: "Short display name (e.g., '3D 2N')",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Display order in selectors",
        position: "sidebar",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Whether this period is active in the selector",
        position: "sidebar",
      },
    },
  ],
};

export default PackagePeriods;
