import { z } from "zod";

// --- Auth Headers ---

export const AuthHeadersSchema = z.object({
  authorization: z.string().describe("Bearer token"),
  "content-type": z.literal("application/vnd.api+json").optional(),
});

// --- JSON:API Resource Schema ---

const JsonApiResource = <T extends z.ZodTypeAny>(
  type: string,
  attributesSchema: T
) =>
  z.object({
    type: z.literal(type),
    id: z.string(),
    attributes: attributesSchema,
    relationships: z.record(z.string(), z.any()).optional(),
  });

// --- JSON:API Document Wrappers ---

export const JsonApiDocument = <T extends z.ZodTypeAny>(
  type: string,
  attributesSchema: T
) =>
  z.object({
    data: JsonApiResource(type, attributesSchema),
  });

export const JsonApiCollection = <T extends z.ZodTypeAny>(
  type: string,
  attributesSchema: T
) =>
  z.object({
    data: z.array(JsonApiResource(type, attributesSchema)),
  });
