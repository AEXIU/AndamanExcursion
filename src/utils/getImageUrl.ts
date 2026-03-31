// Helper function to extract image URL
export function getImageUrl(image: any): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (typeof image === "object" && image.url) return image.url;
  return undefined;
}
