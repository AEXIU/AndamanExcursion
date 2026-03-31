import { Block } from "payload";

export const experienceBlock: Block = {
  slug: "experience",
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
          relationTo: "icons",
          required: true,
        },
      ],
    },
  ],
};
