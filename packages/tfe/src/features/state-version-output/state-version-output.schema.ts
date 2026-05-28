import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - State Version Output
// ============================================================

export const StateVersionOutputAttributesSchema = z.object({
  name: z.string(),
  sensitive: z.boolean(),
  value: z.any(),
  "detailed-type": z.string().nullable(),
});

export const StateVersionOutputResourceSchema = JsonApiDocument(
  RESOURCE.STATE_VERSION_OUTPUTS,
  StateVersionOutputAttributesSchema
)

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get State Version Output ---

export const GetStateVersionOutputInput = ORPCInput({
  params: z.object({
    version: z.string().describe("State Version Output ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetStateVersionOutputOutput = ORPCOutput({
  status: z.literal(200),
  body: StateVersionOutputResourceSchema
});

// ============================================================
// Type
// ============================================================

export type StateVersionOutput = z.infer<typeof StateVersionOutputResourceSchema>
