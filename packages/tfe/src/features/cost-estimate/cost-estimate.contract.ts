import { oc } from "@orpc/contract";
import {
  GetCostEstimateInput,
  GetCostEstimateOutput,
} from "./cost-estimate.schema";

// --- Contracts ---

export const getCostEstimate = oc
  .route({
    path: "/cost-estimates/{costEstimateId}",
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
