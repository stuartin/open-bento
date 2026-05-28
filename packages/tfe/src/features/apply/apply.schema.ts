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

export const ApplyResourceSchema = JsonApiDocument(
  RESOURCE.APPLIES,
  ApplyAttributesSchema
)

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
  body: ApplyResourceSchema
});

// ============================================================
// Type
// ============================================================

export type Apply = z.infer<typeof ApplyResourceSchema>
