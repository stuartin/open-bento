import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - State Version
// ============================================================

// NONE

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Log ---

export const GetLogInput = ORPCInput({
  params: z.object({
    log: z.string()
  }),
  query: z.object({
    limit: z.coerce.number(),
    offset: z.coerce.number()
  }),
  headers: AuthHeadersSchema,
});

export const GetLogOutput = z.union([
  ORPCOutput({
    status: z.literal(200),
    body: z.instanceof(Blob),
  }),
  ORPCOutput({
    status: z.literal(204),
    body: z.undefined(),
  }),
])
