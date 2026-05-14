import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetPolicyEvaluationInput,
  GetPolicyEvaluationOutput,
} from "./policy-evaluation.schema";

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
      body: GetPolicyEvaluationOutput,
    })
  );

// --- Contract Router ---

export const policyEvaluationContract = {
  get: getPolicyEvaluation,
};
