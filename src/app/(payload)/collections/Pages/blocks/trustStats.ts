import { Block } from "payload";

export const trustStatsBlock: Block = {
  slug: "trustStats",
  fields: [
    {
      name: "title",
      type: "group",
      fields: [
        {
          name: "text",
          type: "text",
        },
        {
          name: "specialWord",
          type: "text",
        },
      ],
    },
    {
      name: "stats",
      type: "array",
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "text",
          required: true,
        },
        {
          name: "icon",
          type: "text",
          admin: {
            description: "Icon identifier - one of (users, ferry, island)",
          },
        },
      ],
    },
  ],
};