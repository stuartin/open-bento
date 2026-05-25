import {
  GetStateVersionOutputInput,
  GetStateVersionOutputOutput,
} from "./state-version-output.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getStateVersionOutput = createContract()
  .auth
  .route({
    path: "/state-version-outputs/{version}",
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
