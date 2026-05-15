import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION
// ============================================================

export const StateVersionOutputAttributesSchema = z.object({
  name: z.string(),
  sensitive: z.boolean(),
  value: z.any(),
  "detailed-type": z.string().nullable(),
});

export type StateVersionOutput = z.infer<
  typeof StateVersionOutputAttributesSchema
> & {
  id: string;
};

export const serializeStateVersionOutput: EntitySerializer<StateVersionOutput> =
  {
    getId: (output) => output.id,
    serialize: (output) => ({
      attributes: {
        name: output.name,
        sensitive: output.sensitive,
        value: output.value,
        "detailed-type": output["detailed-type"],
      },
    }),
  };

export const deserializeStateVersionOutput = createDeserializer({
  type: "state-version-outputs",
  cardinality: "one",
  attributesSchema: StateVersionOutputAttributesSchema,
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get State Version Output ---

export const GetStateVersionOutputInput = z.object({
  params: z.object({
    stateVersionOutputId: z.string().describe("State Version Output ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetStateVersionOutputOutput = z.object({
  data: z.object({
    type: z.literal("state-version-outputs"),
    id: z.string(),
    attributes: StateVersionOutputAttributesSchema,
  }),
});
