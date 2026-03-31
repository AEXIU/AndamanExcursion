import { Block } from "payload";

export const heroBlock: Block = {
  slug: "hero",
  fields: [
    {
      name: "title",
      type: "text",
      admin: {
        description: "Main title of the hero section (only on the home page)",
      },
    },
    {
      name: "subtitle",
      type: "text",
      admin: {
        description: "Subtitle of the hero section (only on the home page)",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Description of the hero section (only on the home page)",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "ctaText",
      type: "text",
    },
    {
      name: "ctaHref",
      type: "text",
    },
    {
      name: "initialTab",
      type: "select",
      options: ["activities", "ferry", "local-boat"],
      defaultValue: "ferry",
      admin: {
        description: "Initial tab of the booking form",
      },
    },
  ],
};
