import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Plan
// ============================================================

export const PlanAttributesSchema = z.object({
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
  "log-read-url": z.string(),
  "has-changes": z.boolean().optional(),
  "resource-additions": z.number().optional(),
  "resource-changes": z.number().optional(),
  "resource-destructions": z.number().optional(),
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Plan ---

export const GetPlanInput = ORPCInput({
  params: z.object({
    plan: z.string().describe("Plan ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetPlanOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    RESOURCE.PLANS,
    PlanAttributesSchema
  ),
});

// --- Get Plan JSON Output ---

export const GetPlanJsonOutputInput = ORPCInput({
  params: z.object({
    plan: z.string().describe("Plan ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetPlanJsonOutputOutput = ORPCOutput({
  status: z.literal(200),
  body: z.object({
    format_version: z.string(),
    terraform_version: z.string().optional(),
    planned_values: z.record(z.string(), z.any()).optional(),
    resource_changes: z.array(z.any()).optional(),
    output_changes: z.record(z.string(), z.any()).optional(),
    prior_state: z.record(z.string(), z.any()).optional(),
    configuration: z.record(z.string(), z.any()).optional(),
  }),
});

export const GetPlanJsonOutputRedirectOutput = ORPCOutput({
  status: z.literal(307),
  headers: z.object({
    location: z.string(),
  }),
  body: z.undefined(),
});

// ============================================================
// Type
// ============================================================

export type Plan = z.infer<ReturnType<typeof JsonApiDocument<typeof RESOURCE.PLANS, typeof PlanAttributesSchema>>>
