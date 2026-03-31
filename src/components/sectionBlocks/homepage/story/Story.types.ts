import { Media } from "@payload-types";

export interface StoryProps {
  content: StoryContent;
}

export interface StoryContent {
  title: string;
  specialWord: string;
  description: string;
  media: Media;
  alt: string;
  mediaType: "video" | "image";
  poster?: Media | string;
}
