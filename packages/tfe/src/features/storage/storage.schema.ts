import { z } from "zod";
import { AuthHeadersSchema, ORPCInput, ORPCOutput } from "../../lib/common.schema";

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

// --- Download File ---

export const CreateDownloadInput = ORPCInput({
  query: z.object({
    token: z.string()
  }),
  headers: AuthHeadersSchema,
});

export const CreateDownloadOutput = ORPCOutput({
  status: z.literal(200),
  body: z.file(),
})
