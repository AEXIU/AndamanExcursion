import { Block } from "payload";

export const storyBlock: Block = {
  slug: "story",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "specialWord",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "Upload a video file; should be a .mp4 file; size should be less than 10MB",
      },
    },
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Alt text for the video",
      },
    },
  ],
};
