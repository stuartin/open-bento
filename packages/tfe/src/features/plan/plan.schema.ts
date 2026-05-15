import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION
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
  "generated-configuration": z.boolean().optional(),
  "log-read-url": z.string().optional(),
  "has-changes": z.boolean().optional(),
  "resource-additions": z.number().optional(),
  "resource-changes": z.number().optional(),
  "resource-destructions": z.number().optional(),
});

export type Plan = z.infer<typeof PlanAttributesSchema> & {
  id: string;
};

export const serializePlan: EntitySerializer<Plan> = {
  getId: (plan) => plan.id,
  serialize: (plan) => ({
    attributes: {
      status: plan.status,
      "generated-configuration": plan["generated-configuration"],
      "log-read-url": plan["log-read-url"],
      "has-changes": plan["has-changes"],
      "resource-additions": plan["resource-additions"],
      "resource-changes": plan["resource-changes"],
      "resource-destructions": plan["resource-destructions"],
    },
  }),
};

export const deserializePlan = createDeserializer({
  type: "plans",
  cardinality: "one",
  attributesSchema: PlanAttributesSchema,
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Plan ---

export const GetPlanInput = z.object({
  params: z.object({
    planId: z.string().describe("Plan ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetPlanOutput = z.object({
  data: z.object({
    type: z.literal("plans"),
    id: z.string(),
    attributes: PlanAttributesSchema,
  }),
});

// --- Get Plan JSON Output ---

export const GetPlanJsonOutputInput = z.object({
  params: z.object({
    planId: z.string().describe("Plan ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetPlanJsonOutputOutput = z.object({
  format_version: z.string(),
  terraform_version: z.string().optional(),
  planned_values: z.record(z.any()).optional(),
  resource_changes: z.array(z.any()).optional(),
  output_changes: z.record(z.any()).optional(),
  prior_state: z.record(z.any()).optional(),
  configuration: z.record(z.any()).optional(),
});
