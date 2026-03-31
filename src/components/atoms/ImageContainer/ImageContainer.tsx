import MediaContainer from "../MediaContainer/MediaContainer";
import { ImageContainerProps } from "./ImageContainer.types";

// Simple wrapper for image-only use cases (As both are doing the same thing essentially)
export const ImageContainer = (props: ImageContainerProps) => {
  return <MediaContainer {...props} />;
};