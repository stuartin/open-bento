import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - State Version
// ============================================================

export const StateVersionAttributesSchema = z.object({
  "created-at": z.string(),
  serial: z.number(),
  status: z.enum(["pending", "finalized", "discarded"]),
  "hosted-state-download-url": z.string(),
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Current State Version ---

export const GetCurrentStateVersionInput = ORPCInput({
  params: z.object({
    workspaceId: z.string().describe("Workspace ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetCurrentStateVersionOutput = ORPCOutput({
  status: z.literal(200),
  body: z.object({
    data: z
      .object({
        type: z.literal("state-versions"),
        id: z.string(),
        attributes: StateVersionAttributesSchema,
      })
      .nullable(),
  }),
});

// --- Get State Version ---

export const GetStateVersionInput = ORPCInput({
  params: z.object({
    stateVersionId: z.string().describe("State Version ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetStateVersionOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    "state-versions",
    StateVersionAttributesSchema
  ),
});

// --- List State Versions ---

export const ListStateVersionsInput = ORPCInput({
  params: z.object({
    workspaceId: z.string().describe("Workspace ID"),
  }),
  query: z
    .object({
      "page[number]": z.number().int().min(1).optional(),
      "page[size]": z.number().int().min(1).max(100).optional(),
    })
    .optional(),
  headers: AuthHeadersSchema,
});

export const ListStateVersionsOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiCollection(
    "state-versions",
    StateVersionAttributesSchema
  ),
});
