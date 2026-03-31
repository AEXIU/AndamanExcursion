import { CollectionConfig } from "payload";

const Locations: CollectionConfig = {
  slug: "locations",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type", "isActive"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "e.g., 'Port Blair', 'Havelock Island', 'Neil Island'",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Ferry Port", value: "ferry_port" },
        { label: "Activity Location", value: "activity_location" },
        { label: "Boat Departure Point", value: "boat_departure" },
        { label: "Package Destination", value: "package_destination" },
        { label: "Hotel/Resort", value: "accommodation" },
        { label: "Tourist Attraction", value: "attraction" },
        { label: "General", value: "general" },
      ],
      admin: {
        description: "What type of location is this?",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Brief description of the location",
      },
    },
    {
      name: "media",
      type: "group",
      fields: [
        {
          name: "featuredImage",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "gallery",
          type: "array",
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "alt",
              type: "text",
              required: true,
            },
            {
              name: "caption",
              type: "text",
            },
          ],
        },
      ],
    },
    {
      name: "isActive",
      type: "checkbox",
      admin: {
        position: "sidebar",
      },
      defaultValue: true,
      index: true,
    },
    {
      name: "priority",
      type: "number",
      admin: {
        position: "sidebar",
        description: "Priority for sorting (higher numbers appear first)",
      },
      defaultValue: 0,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        }
        return data;
      },
    ],
  },
};

export default Locations;
