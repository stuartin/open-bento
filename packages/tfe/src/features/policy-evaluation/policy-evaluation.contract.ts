import {
  GetPolicyEvaluationInput,
  GetPolicyEvaluationOutput,
} from "./policy-evaluation.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.POLICY_EVALUATION]

export const getPolicyEvaluation = createContract()
  .auth
  .route({
    tags,
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
