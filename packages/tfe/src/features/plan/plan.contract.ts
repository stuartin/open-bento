import { z } from "zod";
import {
  GetPlanInput,
  GetPlanOutput,
  GetPlanJsonOutputInput,
  GetPlanJsonOutputOutput,
  GetPlanJsonOutputRedirectOutput,
} from "./plan.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getPlan = createContract()
  .auth
  .route({
    path: "/plans/{plan}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetPlanInput)
  .output(GetPlanOutput);

export const getPlanJsonOutput = createContract()
  .auth
  .route({
    path: "/plans/{plan}/json-output-redacted",
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
