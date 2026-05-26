import { z } from "zod";
import { AuthHeadersSchema, ORPCInput } from "../../lib/common.schema";
import { ReadableStream } from "stream/web";

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
