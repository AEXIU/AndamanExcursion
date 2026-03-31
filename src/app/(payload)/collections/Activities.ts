import { CollectionConfig } from "payload";
import { revalidationHooks } from "../../../utils/revalidation";

const Activities: CollectionConfig = {
  slug: "activities",
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "category",
      "location",
      "basePrice",
      "isFeatured",
    ],
    group: "Activities",
  },
  access: {
    read: () => true,
  },
  fields: [
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
      index: true,
      admin: {
        description: "URL-friendly version of the title",
        readOnly: true,
      },
    },
    {
      name: "coreInfo",
      type: "group",
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
        {
          name: "category",
          type: "relationship",
          required: true,
          relationTo: "activity-categories",
          hasMany: true,
          index: true,
        },
        {
          name: "location",
          type: "relationship",
          required: true,
          relationTo: "locations",
          hasMany: true,
          index: true,
        },
        {
          name: "defaultTimeSlots",
          type: "relationship",
          relationTo: "activity-time-slots",
          hasMany: true,
          admin: {
            description: "Available time slots for this activity",
          },
        },
        {
          name: "basePrice",
          type: "number",
          required: true,
          admin: {
            description: "Base price per person",
          },
        },
        {
          name: "discountedPrice",
          type: "number",
          admin: {
            description: "Discounted price per person (optional)",
          },
        },
        {
          name: "duration",
          type: "text",
          required: true,
          admin: {
            description: "e.g., '2 hours', '1 day'",
          },
        },
      ],
    },
    {
      name: "media",
      type: "group",
      fields: [
        {
          name: "featuredImage",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "gallery",
          type: "array",
          fields: [
            {
              name: "media",
              type: "upload",
              relationTo: "media",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "activityOptions",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "optionTitle",
          type: "text",
          required: true,
          admin: {
            description:
              "e.g., 'Shore Diving for Beginners', 'Boat Scuba Diving'",
          },
        },
        {
          name: "optionDescription",
          type: "textarea",
          required: true,
        },
        {
          name: "price",
          type: "number",
          required: true,
          admin: {
            description: "Price for this specific option",
          },
        },
        {
          name: "discountedPrice",
          type: "number",
          admin: {
            description: "Discounted price for this option (optional)",
          },
        },
        {
          name: "duration",
          type: "text",
          admin: {
            description:
              "Duration specific to this option (if different from base)",
          },
        },
        {
          name: "maxCapacity",
          type: "number",
          admin: {
            description:
              "Max capacity for this option (if different from base)",
          },
        },
        {
          name: "icon",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Optional icon for the amenity",
          },
        },
        {
          name: "isActive",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    {
      name: "status",
      type: "group",
      admin: {
        description: "Status and visibility settings",
        position: "sidebar",
      },
      fields: [
        {
          name: "isActive",
          type: "checkbox",
          defaultValue: true,
          index: true,
        },
        {
          name: "isFeatured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Show this activity in featured sections",
          },
        },
        {
          name: "priority",
          type: "number",
          defaultValue: 0,
          index: true,
          admin: {
            description: "Higher numbers appear first in listings",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        }
        return data;
      },
    ],
    afterChange: [
      // Trigger revalidation for activity changes
      revalidationHooks.activities,
    ],
    afterDelete: [
      // Trigger revalidation when activities are deleted
      revalidationHooks.activities,
    ],
  },
};

export default Activities;
