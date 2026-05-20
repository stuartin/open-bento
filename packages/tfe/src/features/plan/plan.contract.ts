import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetPlanInput,
  GetPlanOutput,
  GetPlanJsonOutputInput,
  GetPlanJsonOutputOutput,
  GetPlanJsonOutputRedirectOutput,
} from "./plan.schema";

// --- Contracts ---

export const getPlan = oc
  .route({
    path: "/plans/{planId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetPlanInput)
  .output(GetPlanOutput);

export const getPlanJsonOutput = oc
  .route({
    path: "/plans/{planId}/json-output-redacted",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetPlanJsonOutputInput)
  .output(
    z.union([
      GetPlanJsonOutputOutput,
      GetPlanJsonOutputRedirectOutput,
    ])
  );

// --- Contract Router ---

export const planContract = {
  get: getPlan,
  jsonOutput: getPlanJsonOutput,
};
