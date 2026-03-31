import { Block } from "payload";

export const packageCarouselBlock: Block = {
  slug: "packageCarousel",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "slides",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "price",
          type: "text",
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
        // New optional CTA fields
        {
          name: "ctaLabel",
          type: "text",
          label: "CTA Button Text",
          admin: {
            description:
              "Optional: Custom text for the action button (defaults to 'View More')",
          },
        },
        {
          name: "ctaLink",
          type: "text",
          label: "CTA Link",
          admin: {
            description:
              "Optional: Custom link for the action button (defaults to '/packages/{slide-id}')",
          },
        },
      ],
    },
  ],
};
