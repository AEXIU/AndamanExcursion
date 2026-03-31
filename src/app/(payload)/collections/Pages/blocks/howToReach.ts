import { Block } from "payload";

export const howToReachBlock: Block = {
  slug: "howToReach",
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
        description: "Special word to highlight in the title",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Brief overview of reaching the destination",
      },
    },
    {
      name: "cards",
      type: "array",
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
          name: "icon",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
  ],
};
