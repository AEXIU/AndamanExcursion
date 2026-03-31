import { Block } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const richTextBlock: Block = {
  slug: "richText",
  labels: {
    singular: "Rich Text Content",
    plural: "Rich Text Contents",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Section Title (Optional)",
      admin: {
        description: "Optional heading for this content section",
      },
    },
    {
      name: "content",
      type: "richText",
      label: "Content",
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => defaultFeatures,
      }),
      admin: {
        description: "Add your text content here - supports headings, paragraphs, lists, links, etc.",
      },
    },
  ],
};
