import { revalidationHooks } from "@/utils/revalidation";
import { CollectionConfig } from "payload";

const Icons: CollectionConfig = {
  slug: "icons",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  upload: {
    // No image processing - upload SVGs as-is
    disableLocalStorage: true,
    // Only accept SVG files
    mimeTypes: ["image/svg+xml"],
    // No image sizes needed for SVGs
    imageSizes: [],
    // Admin thumbnail
    adminThumbnail: ({ doc }): string | null => {
      if (
        doc.url &&
        typeof doc.url === "string" &&
        doc.url.includes("ufs.sh")
      ) {
        return doc.url;
      }
      if (doc.uploadthingKey && typeof doc.uploadthingKey === "string") {
        const UPLOADTHING_APP_ID =
          process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID || "zu0uz82q68";
        return `https://${UPLOADTHING_APP_ID}.ufs.sh/f/${doc.uploadthingKey}`;
      }

      // Fallback
      return (doc.url as string) || null;
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Descriptive name for the icon",
      },
    },
    {
      name: "alt",
      type: "text",
      required: true,
      defaultValue: "decorative icon",
      admin: {
        description:
          "Alternative text for accessibility (describes the icon's purpose or meaning)",
      },
    },
    {
      name: "uploadthingKey",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "uploadthingUrl",
      type: "text",
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
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
          console.log(`✅ Icon uploaded successfully:`, {
            id: doc.id,
            name: doc.name,
            filename: doc.filename,
            url: doc.url,
            uploadthingKey: doc.uploadthingKey,
            uploadthingUrl: doc.uploadthingUrl,
            alt: doc.alt,
            operation: operation,
            hasValidKey: keyMatch && keyMatch[1] !== ".",
          });

          // Log warning if key is invalid
          if (!keyMatch || keyMatch[1] === ".") {
            console.warn(`⚠️ Invalid UploadThing key detected for icon:`, {
              url: doc.url,
              extractedKey: keyMatch ? keyMatch[1] : "no match",
              filename: doc.filename,
            });
          }
        }

        // Trigger revalidation for icon changes (if needed)
        await revalidationHooks.media({ doc, operation, req: null });
      },
    ],
    afterDelete: [
      // Trigger revalidation when icons are deleted
      revalidationHooks.media,
    ],
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "alt", "filename", "updatedAt"],
    description:
      "Upload SVG icons for use throughout the site. Only SVG format is accepted. Icons are stored in UploadThing CDN.",
    // Preview function for consistency
    preview: (doc): string | null => {
      if (
        doc.url &&
        typeof doc.url === "string" &&
        doc.url.includes("ufs.sh")
      ) {
        return doc.url;
      }

      if (doc.uploadthingKey && typeof doc.uploadthingKey === "string") {
        const UPLOADTHING_APP_ID =
          process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID || "zu0uz82q68";
        return `https://${UPLOADTHING_APP_ID}.ufs.sh/f/${doc.uploadthingKey}`;
      }

      return (doc.url as string) || null;
    },
  },
};

export default Icons;
