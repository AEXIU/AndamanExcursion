import { CollectionConfig } from "payload";
import { revalidationHooks } from "../../../utils/revalidation";

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  upload: {
    // CORRECTED: Single adminThumbnail configuration - remove duplicates
    adminThumbnail: ({ doc }): string | null => {
      // Priority 1: Use the thumbnail size URL if available
      // if (doc.sizes?.thumbnail?.url) {
      //   return doc.sizes.thumbnail.url as string;
      // }

      // // Priority 2: Construct from thumbnail key
      // if (doc.sizes?.thumbnail?._key) {
      //   return `https://utfs.io/f/${doc.sizes.thumbnail._key}`;
      // }

      // Priority 3: Use main image URL (should be UploadThing URL)
      if (
        doc.url &&
        typeof doc.url === "string" &&
        doc.url.includes("utfs.io")
      ) {
        return doc.url;
      }

      // Priority 4: Construct from stored UploadThing key
      if (doc.uploadthingKey && typeof doc.uploadthingKey === "string") {
        return `https://utfs.io/f/${doc.uploadthingKey}`;
      }

      // Fallback
      return (doc.url as string) || null;
    },
    // Image sizes for processing
    imageSizes: [
      {
        name: "thumbnail",
        width: 150,
        height: 150,
        position: "centre",
        formatOptions: {
          format: "webp",
          options: { quality: 75, effort: 6 },
        },
      },
      {
        name: "small",
        width: 400,
        height: undefined,
        position: "centre",
        formatOptions: {
          format: "webp",
          options: { quality: 80, effort: 6 },
        },
      },
      {
        name: "medium",
        width: 768,
        height: undefined,
        position: "centre",
        formatOptions: {
          format: "webp",
          options: { quality: 85, effort: 6 },
        },
      },
      {
        name: "large",
        width: 1200,
        height: undefined,
        position: "centre",
        formatOptions: {
          format: "webp",
          options: { quality: 85, effort: 6 },
        },
      },
    ],

    // Accepted file types
    mimeTypes: ["image/*", "video/mp4", "video/webm", "video/ogg"],

    // Default format options for original images
    formatOptions: {
      format: "webp",
      options: {
        quality: 85,
        effort: 6,
      },
    },

    // Resize options for original images
    resizeOptions: {
      width: 2000,
      height: 2000,
      fit: "inside",
      withoutEnlargement: true,
    },
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Alternative text for accessibility",
      },
    },
    {
      name: "caption",
      type: "text",
      admin: {
        description: "Optional caption for the media",
      },
    },
    // Store the UploadThing file key for direct access
    {
      name: "uploadthingKey",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    // Store the UploadThing file URL for direct access
    {
      name: "uploadthingUrl",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "videoSettings",
      type: "group",
      admin: {
        condition: (data) => {
          return data.mimeType?.startsWith("video/");
        },
        description: "Settings specific to video files",
      },
      fields: [
        {
          name: "autoplay",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Auto-play video when loaded",
          },
        },
        {
          name: "loop",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Loop video continuously",
          },
        },
        {
          name: "muted",
          type: "checkbox",
          defaultValue: true,
          admin: {
            description: "Start video muted",
          },
        },
        {
          name: "controls",
          type: "checkbox",
          defaultValue: true,
          admin: {
            description: "Show video controls",
          },
        },
        {
          name: "poster",
          type: "upload",
          relationTo: "media",
          admin: {
            condition: (data, siblingData) => {
              return siblingData.mimeType?.startsWith("image/");
            },
            description: "Poster image for video",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Auto-detect media type
        if (req.file?.mimetype) {
          data.mediaType = req.file.mimetype.startsWith("image/")
            ? "image"
            : req.file.mimetype.startsWith("video/")
            ? "video"
            : "other";
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Only process on create operations (new uploads)
        if (operation === "create" && doc.url && typeof doc.url === "string") {
          // Store the full URL
          doc.uploadthingUrl = doc.url;

          // Extract and store the key from UploadThing URL
          const keyMatch = doc.url.match(/\/f\/([^/?#]+)/);
          if (keyMatch && keyMatch[1] !== ".") {
            doc.uploadthingKey = keyMatch[1];
          }

          // Enhanced logging for debugging
          console.log(`✅ Media uploaded successfully:`, {
            id: doc.id,
            filename: doc.filename,
            url: doc.url,
            mimeType: doc.mimeType,
            uploadthingKey: doc.uploadthingKey,
            uploadthingUrl: doc.uploadthingUrl,
            sizes: doc.sizes ? Object.keys(doc.sizes) : [],
            filesize: doc.filesize,
            operation: operation,
            // Check if URL has valid key
            hasValidKey: keyMatch && keyMatch[1] !== ".",
          });

          // Log warning if key is invalid
          if (!keyMatch || keyMatch[1] === ".") {
            console.warn(`⚠️ Invalid UploadThing key detected:`, {
              url: doc.url,
              extractedKey: keyMatch ? keyMatch[1] : "no match",
              filename: doc.filename,
            });
          }
        }

        // Trigger revalidation for media changes
        await revalidationHooks.media({ doc, operation, req });
      },
    ],
    afterDelete: [
      // Trigger revalidation when media is deleted
      revalidationHooks.media,
    ],
  },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "mimeType", "updatedAt"],
    // Remove custom preview - let Payload handle it
    preview: (doc): string | null => {
      // Return the adminThumbnail result for consistency
      // if (doc.sizes?.thumbnail?.url) {
      //   return doc.sizes.thumbnail.url as string;
      // }

      // if (doc.sizes?.thumbnail?._key) {
      //   return `https://utfs.io/f/${doc.sizes.thumbnail._key}`;
      // }

      return (doc.url as string) || null;
    },
  },
};

export default Media;
