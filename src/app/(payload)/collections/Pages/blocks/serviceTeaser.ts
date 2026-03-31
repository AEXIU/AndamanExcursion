import { Block } from "payload";

export const serviceTeaserBlock: Block = {
  slug: "serviceTeaser",
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
      name: "description",
      type: "textarea",
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
  ],
};
