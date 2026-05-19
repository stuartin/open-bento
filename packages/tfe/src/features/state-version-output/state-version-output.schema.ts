import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - State Version Output
// ============================================================

export const StateVersionOutputAttributesSchema = z.object({
  name: z.string(),
  sensitive: z.boolean(),
  value: z.any(),
  "detailed-type": z.string().nullable(),
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get State Version Output ---

export const GetStateVersionOutputInput = ORPCInput({
  params: z.object({
    stateVersionOutputId: z.string().describe("State Version Output ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetStateVersionOutputOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    "state-version-outputs",
    StateVersionOutputAttributesSchema
  ),
});
