import { oc } from "@orpc/contract";
import {
  GetStateVersionOutputInput,
  GetStateVersionOutputOutput,
} from "./state-version-output.schema";

// --- Contracts ---

export const getStateVersionOutput = oc
  .route({
    path: "/state-version-outputs/{stateVersionOutputId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetStateVersionOutputInput)
  .output(GetStateVersionOutputOutput);

// --- Contract Router ---

export const stateVersionOutputContract = {
  get: getStateVersionOutput,
};
