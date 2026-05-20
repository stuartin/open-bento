import { oc } from "@orpc/contract";
import {
  GetPolicyEvaluationInput,
  GetPolicyEvaluationOutput,
} from "./policy-evaluation.schema";

// --- Contracts ---

export const getPolicyEvaluation = oc
  .route({
    path: "/policy-evaluations/{policyEvaluationId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetPolicyEvaluationInput)
  .output(GetPolicyEvaluationOutput);

// --- Contract Router ---

export const policyEvaluationContract = {
  get: getPolicyEvaluation,
};
