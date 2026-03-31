import { Block } from "payload";

export const planInFourEasyStepsBlock: Block = {
  slug: "planInFourEasySteps",
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
      name: "steps",
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
