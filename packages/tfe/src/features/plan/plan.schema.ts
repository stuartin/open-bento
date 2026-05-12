import { z } from "zod";
import { type EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
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

// Type
export type Plan = z.infer<typeof PlanAttributesSchema> & {
  id: string;
};

// Serializer
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

// Deserializer
export const deserializePlan = createDeserializer({
  type: "plans",
  cardinality: "one",
  attributesSchema: PlanAttributesSchema,
});
