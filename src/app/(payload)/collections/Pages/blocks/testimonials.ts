import { Block } from "payload";

export const testimonialsBlock: Block = {
  slug: "testimonials",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "specialWord",
      type: "text",
      admin: {
        description: "Word to highlight in the title",
      },
    },
    {
      name: "subtitle",
      type: "textarea",
    },
    {
      name: "testimonials",
      type: "array",
      fields: [
        {
          name: "text",
          type: "textarea",
          required: true,
        },
        {
          name: "author",
          type: "text",
        },
        {
          name: "avatar",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "rotation",
          type: "number",
          required: true,
          admin: {
            description: "Rotation of the testimonial card in degrees",
          },
        },
      ]
    }
  ],
};