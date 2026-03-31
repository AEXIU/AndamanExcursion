import { createSlugHook } from "@/utils/generateSlug";
import { CollectionConfig } from "payload";

const BoatRoutes: CollectionConfig = {
  slug: "boat-routes",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "fromLocation", "toLocation", "fare", "isActive"],
    group: "Boats",
    listSearchableFields: ["name", "description"],
    pagination: {
      defaultLimit: 25,
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    // === TOP-LEVEL FIELDS ===
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description:
          "e.g., 'Port Blair to Ross Island', 'Havelock to Elephant Beach'",
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
      admin: {
        description: "Brief description of this boat route",
        rows: 3,
      },
    },

    // === ROUTE DETAILS ===
    {
      name: "fromLocation",
      type: "relationship",
      relationTo: "locations",
      required: true,
      admin: {
        description: "Starting point of the boat route",
      },
    },
    {
      name: "toLocation",
      type: "text",
      required: true,
      admin: {
        description: "Destination(s) - can be multiple islands",
      },
    },
    {
      name: "fare",
      type: "number",
      required: true,
      admin: {
        description: "Round trip fare per person in INR",
      },
    },
    {
      name: "duration",
      type: "text",
      admin: {
        description: "Minimum time allowed to spend at destination",
      },
    },

    // === TIMING ===
    {
      name: "availableTimings",
      type: "array",
      required: true,
      minRows: 1,
      admin: {
        description: "Available departure times for this route",
      },
      fields: [
        {
          name: "departureTime",
          type: "text",
          required: true,
          admin: {
            description: "Departure time in HH:MM format (e.g., 09:00)",
          },
        },
        {
          name: "displayTime",
          type: "text",
          admin: {
            description: "Formatted time for display (e.g., 9:00 AM)",
          },
        },
      ],
    },

    // === STATUS ===
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      index: true,
      admin: {
        description: "Uncheck to hide this route from public view",
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

    // === METADATA ===
    {
      name: "metadata",
      type: "group",
      admin: {
        description: "Additional route information",
      },
      fields: [
        {
          name: "isRoundTrip",
          type: "checkbox",
          defaultValue: true,
          admin: {
            description: "Is this a round trip route?",
          },
        },
        {
          name: "capacity",
          type: "number",
          admin: {
            description: "Maximum passengers per trip",
          },
        },
        {
          name: "highlights",
          type: "array",
          admin: {
            description: "Key highlights of this route",
          },
          fields: [
            {
              name: "highlight",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },

    // === IMAGES ===
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Main image for this boat route",
        position: "sidebar",
      },
    },
    {
      name: "gallery",
      type: "array",
      admin: {
        description: "Additional images for this route",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "caption",
          type: "text",
          admin: {
            description: "Optional caption for the image",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      createSlugHook("name", "slug"),
      ({ data }) => {
        // Auto-generate name from route if not provided
        if (!data.name && data.fromLocation && data.toLocation) {
          data.name = `${data.fromLocation} to ${data.toLocation}`;
        }
        return data;
      },
    ],
  },
};

export default BoatRoutes;
