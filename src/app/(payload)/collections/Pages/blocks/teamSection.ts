import { Block } from "payload";

export const teamSectionBlock: Block = {
  slug: "teamSection",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      defaultValue: "Our Team",
    },
    {
      name: "specialWord",
      type: "text",
      defaultValue: "Team",
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "teamMembers",
      type: "array",
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "designation",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
        },
      ],
    },
  ],
};
