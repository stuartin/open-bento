import {
  GetCurrentStateVersionInput,
  GetCurrentStateVersionOutput,
  GetStateVersionInput,
  GetStateVersionOutput,
  ListStateVersionsInput,
  ListStateVersionsOutput,
} from "./state-version.schema";
import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";

// --- Contracts ---

export const getCurrentStateVersion = createContract()
  .auth
  .route({
    path: "/workspaces/{workspace}/current-state-version",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .errors({
    NOT_FOUND
  })
  .input(GetCurrentStateVersionInput)
  .output(GetCurrentStateVersionOutput);

export const getStateVersion = createContract()
  .auth
  .route({
    path: "/state-versions/{version}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetStateVersionInput)
  .output(GetStateVersionOutput);

export const listStateVersions = createContract()
  .auth
  .route({
    path: "/workspaces/{workspace}/state-versions",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListStateVersionsInput)
  .output(ListStateVersionsOutput);

// --- Contract Router ---

export const stateVersionContract = {
  getCurrent: getCurrentStateVersion,
  get: getStateVersion,
  list: listStateVersions,
};
