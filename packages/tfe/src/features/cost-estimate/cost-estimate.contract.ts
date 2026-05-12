import { z } from "zod";
import { oc } from "@orpc/contract";
import { AuthHeadersSchema, JsonApiDocument } from "../../lib/common.schema";
import { CostEstimateAttributesSchema } from "./cost-estimate.schema";

// --- Input Types ---

const GetCostEstimateInput = z.object({
  params: z.object({
    costEstimateId: z.string().describe("Cost Estimate ID"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const CostEstimateOutputSchema = JsonApiDocument(
  "cost-estimates",
  CostEstimateAttributesSchema
);

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
      body: CostEstimateOutputSchema,
    })
  );

// --- Contract Router ---

export const costEstimateContract = {
  get: getCostEstimate,
};
