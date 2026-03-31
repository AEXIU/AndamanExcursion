import { Block } from "payload";

export const largeCardBlock: Block = {
  slug: "largeCard",
  fields: [
    {
      name: "subtitle",
      type: "text",
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "imageAlt",
      type: "text",
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
