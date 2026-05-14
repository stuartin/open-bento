import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  GetStateVersionOutputInput,
  GetStateVersionOutputOutput,
} from "./state-version-output.schema";

// --- Contract ---

export const getStateVersionOutput = oc
  .route({
    path: "/api/v2/state-version-outputs/{stateVersionOutputId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetStateVersionOutputInput)
  .output(
    z.object({
      status: z.literal(200),
      body: GetStateVersionOutputOutput,
    })
  );

// --- Contract Router ---

export const stateVersionOutputContract = {
  get: getStateVersionOutput,
};
