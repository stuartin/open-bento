import { z } from "zod";
import { type EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
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

// Type
export type CostEstimate = z.infer<typeof CostEstimateAttributesSchema> & {
  id: string;
};

// Serializer
export const serializeCostEstimate: EntitySerializer<CostEstimate> = {
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

// Deserializer
export const deserializeCostEstimate = createDeserializer({
  type: "cost-estimates",
  cardinality: "one",
  attributesSchema: CostEstimateAttributesSchema,
});
