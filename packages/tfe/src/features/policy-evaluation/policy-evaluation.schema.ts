import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Policy Evaluation
// ============================================================

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

export const PolicyEvaluationResourceSchema = JsonApiDocument(
  RESOURCE.POLICY_EVALUATIONS,
  PolicyEvaluationAttributesSchema
)

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Policy Evaluation ---

export const GetPolicyEvaluationInput = ORPCInput({
  params: z.object({
    policyEvaluationId: z.string().describe("Policy Evaluation ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetPolicyEvaluationOutput = ORPCOutput({
  status: z.literal(200),
  body: PolicyEvaluationResourceSchema
});

// ============================================================
// Type
// ============================================================

export type PolicyEvaluation = z.infer<typeof PolicyEvaluationResourceSchema>
