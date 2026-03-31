import { createSlugHook } from "@/utils/generateSlug";
import { CollectionConfig } from "payload";

const ActivityCategories: CollectionConfig = {
  slug: "activity-categories",
  admin: {
    useAsTitle: "name", // Must be top-level field
    defaultColumns: ["name", "parentCategory", "isActive", "sortOrder"],
    group: "Activities",
    listSearchableFields: ["name", "description"],
    pagination: {
      defaultLimit: 25,
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    // === TOP-LEVEL FIELDS (for admin functionality) ===
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "e.g., 'Scuba Diving', 'Water Sports', 'Adventure'",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL-friendly version (auto-generated from name)",
        readOnly: true,
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: {
        description: "Brief description of this activity category",
        rows: 3,
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      index: true,
      admin: {
        description: "Uncheck to hide this category from public view",
        position: "sidebar",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      index: true,
      admin: {
        description: "Display order (0 = first, higher numbers = later)",
        step: 1,
        position: "sidebar",
      },
    },
    {
      name: "parentCategory",
      type: "relationship",
      relationTo: "activity-categories",
      admin: {
        description: "Select parent category for hierarchical organization",
        position: "sidebar",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "Image representing this category (recommended: square format, min 64x64px)",
      },
    },
  ],
  hooks: {
    beforeChange: [
      // Auto-generate slug using utility function
      createSlugHook("name", "slug", { maxLength: 60 }),
    ],
    beforeValidate: [
      ({ data, originalDoc, operation }) => {
        // Prevent circular parent-child relationships
        // Only check this during updates when we have an existing document ID
        if (
          operation === "update" &&
          originalDoc?.id &&
          data?.parentCategory === originalDoc.id
        ) {
          throw new Error("A category cannot be its own parent");
        }
        return data;
      },
    ],
  },
};

export default ActivityCategories;
