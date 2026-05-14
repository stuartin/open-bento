import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// --- Get Policy Evaluation ---

export const GetPolicyEvaluationInput = z.object({
  params: z.object({
    policyEvaluationId: z.string().describe("Policy Evaluation ID"),
  }),
  headers: AuthHeadersSchema,
});

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

export type PolicyEvaluation = z.infer<
  typeof PolicyEvaluationAttributesSchema
> & {
  id: string;
};

export const GetPolicyEvaluationOutput = z.object({
  data: z.object({
    type: z.literal("policy-evaluations"),
    id: z.string(),
    attributes: PolicyEvaluationAttributesSchema,
  }),
});

export const serializeGetPolicyEvaluationOutput: EntitySerializer<PolicyEvaluation> =
  {
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

export const deserializeGetPolicyEvaluationOutput = createDeserializer({
  type: "policy-evaluations",
  cardinality: "one",
  attributesSchema: PolicyEvaluationAttributesSchema,
});
