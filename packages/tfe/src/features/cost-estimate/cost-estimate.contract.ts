import {
  GetCostEstimateInput,
  GetCostEstimateOutput,
} from "./cost-estimate.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.COST_ESTIMATE]

export const getCostEstimate = createContract()
  .auth
  .route({
    tags,
    path: "/cost-estimates/{estimate}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetCostEstimateInput)
  .output(GetCostEstimateOutput);

// --- Contract Router ---

export const costEstimateContract = {
  get: getCostEstimate,
};
