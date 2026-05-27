import {
  GetStateVersionOutputInput,
  GetStateVersionOutputOutput,
} from "./state-version-output.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.STATE_VERSION_OUTPUT]

export const getStateVersionOutput = createContract()
  .auth
  .route({
    tags,
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
