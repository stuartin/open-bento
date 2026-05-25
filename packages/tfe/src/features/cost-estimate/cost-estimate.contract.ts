import {
  GetCostEstimateInput,
  GetCostEstimateOutput,
} from "./cost-estimate.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getCostEstimate = createContract()
  .auth
  .route({
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
