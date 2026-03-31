import { Block } from "payload";

export const journeySectionBlock: Block = {
  slug: "journeySection",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      defaultValue: "Our Journey",
    },
    {
      name: "subtitle",
      type: "text",
    },
    {
      name: "milestones",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "year",
          type: "text",
          required: true,
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
};
