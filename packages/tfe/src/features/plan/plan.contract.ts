import { z } from "zod";
import { oc } from "@orpc/contract";
import { AuthHeadersSchema, JsonApiDocument } from "../../lib/common.schema";
import { PlanAttributesSchema } from "./plan.schema";

// --- Input Types ---

const GetPlanInput = z.object({
  params: z.object({
    planId: z.string().describe("Plan ID"),
  }),
  headers: AuthHeadersSchema,
});

const GetPlanJsonOutputInput = z.object({
  params: z.object({
    planId: z.string().describe("Plan ID"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const PlanOutputSchema = JsonApiDocument("plans", PlanAttributesSchema);

const PlanJsonOutputSchema = z.object({
  format_version: z.string(),
  terraform_version: z.string().optional(),
  planned_values: z.record(z.any()).optional(),
  resource_changes: z.array(z.any()).optional(),
  output_changes: z.record(z.any()).optional(),
  prior_state: z.record(z.any()).optional(),
  configuration: z.record(z.any()).optional(),
});

// --- Contracts ---

export const getPlan = oc
  .route({
    path: "/api/v2/plans/{planId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetPlanInput)
  .output(
    z.object({
      status: z.literal(200),
      body: PlanOutputSchema,
    })
  );

export const getPlanJsonOutput = oc
  .route({
    path: "/api/v2/plans/{planId}/json-output-redacted",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetPlanJsonOutputInput)
  .output(
    z.union([
      z.object({
        status: z.literal(200),
        body: PlanJsonOutputSchema,
      }),
      z.object({
        status: z.literal(307),
        headers: z.object({
          location: z.string(),
        }),
        body: z.undefined(),
      }),
    ])
  );

// --- Contract Router ---

export const planContract = {
  get: getPlan,
  jsonOutput: getPlanJsonOutput,
};
