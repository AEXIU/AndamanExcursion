import { Block } from "payload";

export const trustedFerriesBlock: Block = {
  slug: "trustedFerries",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      defaultValue: "Our Most Trusted Ferries",
    },
    {
      name: "specialWord",
      type: "text",
      defaultValue: "Trusted Ferries",
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "ferries",
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
          name: "imageAlt",
          type: "text",
          required: true,
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "price",
          type: "text",
          required: true,
        },
        {
          name: "rating",
          type: "number",
          min: 0,
          max: 5,
          required: true,
        },
        {
          name: "href",
          type: "text",
          required: true,
        },
      ],
    },
  ],
};
