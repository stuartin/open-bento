import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetPlanInput,
  GetPlanOutput,
  GetPlanJsonOutputInput,
  GetPlanJsonOutputOutput,
} from "./plan.schema";

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
      body: GetPlanOutput,
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
        body: GetPlanJsonOutputOutput,
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
