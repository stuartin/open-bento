import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - State Version
// ============================================================

// NONE

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Upload File ---

export const CreateUploadInput = ORPCInput({
  body: z.instanceof(ReadableStream),
  query: z.object({
    token: z.string()
  }),
  headers: AuthHeadersSchema,
});
