// src/services/payload/base/client.ts
// This file is used to create a client for the payload database ( instantiation and connection )

import { getPayload } from "payload";
import { cache } from "react";
import config from "@/payload.config";

export const getCachedPayload = cache(async () => {
  try {
    return await getPayload({ config });
  } catch (error) {
    console.error("Error initializing Payload:", error);
    throw error;
  }
});
