import { z } from "zod";
import { oc } from "@orpc/contract";
import { AuthHeadersSchema, JsonApiDocument } from "../../lib/common.schema";
import { PolicyEvaluationAttributesSchema } from "./policy-evaluation.schema";

// --- Input Types ---

const GetPolicyEvaluationInput = z.object({
  params: z.object({
    policyEvaluationId: z.string().describe("Policy Evaluation ID"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const PolicyEvaluationOutputSchema = JsonApiDocument(
  "policy-evaluations",
  PolicyEvaluationAttributesSchema
);

// --- Contract ---

export const getPolicyEvaluation = oc
  .route({
    path: "/api/v2/policy-evaluations/{policyEvaluationId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetPolicyEvaluationInput)
  .output(
    z.object({
      status: z.literal(200),
      body: PolicyEvaluationOutputSchema,
    })
  );

// --- Contract Router ---

export const policyEvaluationContract = {
  get: getPolicyEvaluation,
};
