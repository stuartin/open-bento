import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// --- Get Cost Estimate ---

export const GetCostEstimateInput = z.object({
  params: z.object({
    costEstimateId: z.string().describe("Cost Estimate ID"),
  }),
  headers: AuthHeadersSchema,
});

export const CostEstimateAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "queued",
    "running",
    "finished",
    "errored",
    "canceled",
    "skipped",
  ]),
  "matched-resources-count": z.number().optional(),
  "unmatched-resources-count": z.number().optional(),
  "resources-count": z.number().optional(),
  "delta-monthly-cost": z.string().optional(),
  "proposed-monthly-cost": z.string().optional(),
});

export type CostEstimate = z.infer<typeof CostEstimateAttributesSchema> & {
  id: string;
};

export const GetCostEstimateOutput = z.object({
  data: z.object({
    type: z.literal("cost-estimates"),
    id: z.string(),
    attributes: CostEstimateAttributesSchema,
  }),
});

export const serializeGetCostEstimateOutput: EntitySerializer<CostEstimate> = {
  getId: (ce) => ce.id,
  serialize: (ce) => ({
    attributes: {
      status: ce.status,
      "matched-resources-count": ce["matched-resources-count"],
      "unmatched-resources-count": ce["unmatched-resources-count"],
      "resources-count": ce["resources-count"],
      "delta-monthly-cost": ce["delta-monthly-cost"],
      "proposed-monthly-cost": ce["proposed-monthly-cost"],
    },
  }),
};

export const deserializeGetCostEstimateOutput = createDeserializer({
  type: "cost-estimates",
  cardinality: "one",
  attributesSchema: CostEstimateAttributesSchema,
});
