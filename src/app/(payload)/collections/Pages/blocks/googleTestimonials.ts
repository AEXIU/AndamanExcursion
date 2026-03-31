import { Block } from "payload";

export const googleTestimonialsBlock: Block = {
  slug: "googleTestimonials",
  labels: {
    singular: "Google Testimonials",
    plural: "Google Testimonials",
  },
  fields: [
    {
      name: "blockName",
      type: "text",
      required: false,
      admin: {
        description:
          "Optional name for identifying this block in the admin panel",
      },
    },
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Enable/disable this testimonials section",
      },
    },
    // Since you mentioned this uses scraped data and doesn't need Payload data,
    // we'll keep the fields minimal. You could add override fields if needed.
    {
      name: "customTitle",
      type: "text",
      required: false,
      admin: {
        description: "Optional custom title (leave empty to use default)",
      },
    },
    {
      name: "customSubtitle",
      type: "text",
      required: false,
      admin: {
        description: "Optional custom subtitle (leave empty to use default)",
      },
    },
  ],
  admin: {
    group: "Content Blocks",
  },
};
