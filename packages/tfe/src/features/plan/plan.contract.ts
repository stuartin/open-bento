import { z } from "zod";
import {
  GetPlanInput,
  GetPlanOutput,
  GetPlanJsonOutputInput,
  GetPlanJsonOutputOutput,
  GetPlanJsonOutputRedirectOutput,
} from "./plan.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.PLAN]

export const getPlan = createContract()
  .auth
  .route({
    tags,
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
    tags,
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
