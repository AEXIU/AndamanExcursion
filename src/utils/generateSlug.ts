/**
 * Slug generation utilities for Payload CMS
 */

/**
 * Converts text to URL-friendly slug with performance optimizations
 * @param text - Input text to convert to slug
 * @param options - Configuration options
 * @returns URL-friendly slug string
 */
export const generateSlug = (
  text: string,
  options: {
    maxLength?: number;
    separator?: string;
    preserveCase?: boolean;
    removeStopWords?: boolean;
  } = {}
): string => {
  const {
    maxLength = 100,
    separator = "-",
    preserveCase = false,
    removeStopWords = false,
  } = options;

  if (!text || typeof text !== "string") return "";

  // Common English stop words (optional removal)
  const stopWords = removeStopWords
    ? new Set([
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
      ])
    : new Set();

  // Single pass transformation for better performance
  let slug = text
    .trim()
    // Convert to lowercase (unless preserveCase is true)
    .toLowerCase()
    // Remove accents and diacritics (é → e, ñ → n, etc.)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace spaces and special characters with separator
    .replace(/[^\w\s-]/g, "")
    // Replace multiple whitespace/separators with single separator
    .replace(/[\s_-]+/g, separator)
    // Remove leading/trailing separators
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "");

  // Remove stop words if requested
  if (removeStopWords && stopWords.size > 0) {
    slug = slug
      .split(separator)
      .filter((word) => !stopWords.has(word))
      .join(separator);
  }

  // Truncate if necessary (preserve word boundaries)
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    const lastSeparator = slug.lastIndexOf(separator);
    if (lastSeparator > maxLength * 0.8) {
      // Only trim if separator is reasonably close to end
      slug = slug.substring(0, lastSeparator);
    }
  }

  return slug || "untitled"; // Fallback for empty results
};

/**
 * Payload CMS hook factory for auto-generating slugs
 * @param sourceField - Field name to generate slug from (default: 'name')
 * @param targetField - Field name to store slug in (default: 'slug')
 * @param options - Slug generation options
 * @returns Payload beforeChange hook
 */
export const createSlugHook = (
  sourceField: string = "name",
  targetField: string = "slug",
  options: Parameters<typeof generateSlug>[1] = {}
) => {
  return ({ data }: { data: any }) => {
    // Only generate if source field exists and target field is empty
    if (data[sourceField] && !data[targetField]) {
      data[targetField] = generateSlug(data[sourceField], options);
    }
    return data;
  };
};

/**
 * Advanced slug generation with uniqueness checking
 * Use this when you need to ensure slug uniqueness across the collection
 */
export const createUniqueSlugHook = (
  sourceField: string = "name",
  targetField: string = "slug",
  options: Parameters<typeof generateSlug>[1] = {}
) => {
  return async ({ data, req, operation }: any) => {
    // Only generate for new documents or when source field changes
    if (!data[sourceField] || (operation === "update" && data[targetField])) {
      return data;
    }

    const baseSlug = generateSlug(data[sourceField], options);
    let finalSlug = baseSlug;
    let counter = 1;

    // Check for uniqueness (only if we have access to the payload instance)
    if (req?.payload) {
      const collection = req.payload.collections[req.collection.config.slug];

      while (true) {
        const existing = await collection.find({
          where: {
            [targetField]: { equals: finalSlug },
            ...(operation === "update" && data.id
              ? { id: { not_equals: data.id } }
              : {}),
          },
          limit: 1,
          depth: 0,
        });

        if (existing.docs.length === 0) break;

        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    data[targetField] = finalSlug;
    return data;
  };
};

/**
 * Batch slug generation utility for existing data
 * Useful for migrations or bulk updates
 */
export const batchGenerateSlugs = async (
  payload: any,
  collectionSlug: string,
  sourceField: string = "name",
  targetField: string = "slug",
  options: Parameters<typeof generateSlug>[1] = {}
) => {
  const collection = payload.collections[collectionSlug];
  const docs = await collection.find({ limit: 0, depth: 0 });

  const updates = docs.docs
    .filter((doc: any) => doc[sourceField] && !doc[targetField])
    .map((doc: any) => ({
      id: doc.id,
      [targetField]: generateSlug(doc[sourceField], options),
    }));

  // Batch update for better performance
  const promises = updates.map((update: any) =>
    collection.update({
      id: update.id,
      data: { [targetField]: update[targetField] },
    })
  );

  return Promise.all(promises);
};
