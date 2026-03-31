import { Block } from "payload";

export const triviaBlock: Block = {
  slug: "trivia",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "text",
      type: "textarea",
      required: true,
    },
    {
      name: "highlightedPhrases",
      type: "array",
      fields: [
        {
          name: "phrase",
          type: "text",
        },
      ],
    },
  ],
};
