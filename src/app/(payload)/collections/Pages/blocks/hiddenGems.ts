import { Block } from "payload";

export const hiddenGemsBlock: Block = {
  slug: "hiddenGems",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "specialWord",
      type: "text",
    },
    {
      name: "description",
      type: "textarea",
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
      name: "images",
      type: "array",
      label: "Island Images",
      minRows: 3,
      maxRows: 3,
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
          label: "Alt Text",
          required: true,
          admin: {
            description:
              "Alt text for the image in this context (e.g. 'Island 1', 'Island 2', 'Island 3')",
          },
        },
      ],
    },
  ],
};
