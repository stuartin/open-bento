import {
  GetPolicyEvaluationInput,
  GetPolicyEvaluationOutput,
} from "./policy-evaluation.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getPolicyEvaluation = createContract()
  .auth
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
