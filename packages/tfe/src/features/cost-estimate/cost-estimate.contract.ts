import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetCostEstimateInput,
  GetCostEstimateOutput,
} from "./cost-estimate.schema";

// --- Contract ---

export const getCostEstimate = oc
  .route({
    path: "/api/v2/cost-estimates/{costEstimateId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetCostEstimateInput)
  .output(
    z.object({
      status: z.literal(200),
      body: GetCostEstimateOutput,
    })
  );

// --- Contract Router ---

export const costEstimateContract = {
  get: getCostEstimate,
};
