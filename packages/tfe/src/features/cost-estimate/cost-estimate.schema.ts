import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Cost Estimate
// ============================================================

export const CostEstimateAttributesSchema = z.object({
  status: z.enum([
    "pending",
    "queued",
    "running",
    "finished",
    "errored",
    "canceled",
    "skipped",
  ]),
  "matched-resources-count": z.number().optional(),
  "unmatched-resources-count": z.number().optional(),
  "resources-count": z.number().optional(),
  "delta-monthly-cost": z.string().optional(),
  "proposed-monthly-cost": z.string().optional(),
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Get Cost Estimate ---

export const GetCostEstimateInput = ORPCInput({
  params: z.object({
    estimate: z.string().describe("Cost Estimate ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetCostEstimateOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    RESOURCE.COST_ESTIMATES,
    CostEstimateAttributesSchema
  ),
});
