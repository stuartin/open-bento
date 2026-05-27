import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Apply
// ============================================================

export const ApplyAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "managed_queued",
    "queued",
    "agent_queued",
    "running",
    "errored",
    "canceled",
    "finished",
    "unreachable",
  ]),
  "log-read-url": z.string().optional(),
  "resource-additions": z.number().optional(),
  "resource-changes": z.number().optional(),
  "resource-destructions": z.number().optional(),
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Apply ---

export const GetApplyInput = ORPCInput({
  params: z.object({
    apply: z.string().describe("Apply ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetApplyOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    RESOURCE.APPLIES,
    ApplyAttributesSchema
  ),
});

// ============================================================
// Type
// ============================================================

export type Apply = z.infer<ReturnType<typeof JsonApiDocument<typeof RESOURCE.APPLIES, typeof ApplyAttributesSchema>>>
