import { z } from "zod";
import { type EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";

// Schema
export const PolicyEvaluationAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "running",
    "passed",
    "failed",
    "errored",
    "canceled",
    "unreachable",
  ]),
  "policy-kind": z.enum(["opa", "sentinel"]),
  "result-count": z
    .object({
      "advisory-failed": z.number(),
      "mandatory-failed": z.number(),
      passed: z.number(),
      errored: z.number(),
    })
    .optional(),
  "created-at": z.string().optional(),
  "updated-at": z.string().optional(),
});

// Type
export type PolicyEvaluation = z.infer<
  typeof PolicyEvaluationAttributesSchema
> & {
  id: string;
};

// Serializer
export const serializePolicyEvaluation: EntitySerializer<PolicyEvaluation> = {
  getId: (pe) => pe.id,
  serialize: (pe) => ({
    attributes: {
      status: pe.status,
      "policy-kind": pe["policy-kind"],
      "result-count": pe["result-count"],
      "created-at": pe["created-at"],
      "updated-at": pe["updated-at"],
    },
  }),
};

// Deserializer
export const deserializePolicyEvaluation = createDeserializer({
  type: "policy-evaluations",
  cardinality: "one",
  attributesSchema: PolicyEvaluationAttributesSchema,
});
