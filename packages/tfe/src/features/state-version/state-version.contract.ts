import {
  GetCurrentStateVersionInput,
  GetCurrentStateVersionOutput,
  GetStateVersionInput,
  GetStateVersionOutput,
  ListStateVersionsInput,
  ListStateVersionsOutput,
} from "./state-version.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getCurrentStateVersion = createContract()
  .auth
  .route({
    path: "/workspaces/{workspaceId}/current-state-version",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetCurrentStateVersionInput)
  .output(GetCurrentStateVersionOutput);

export const getStateVersion = createContract()
  .auth
  .route({
    path: "/state-versions/{stateVersionId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetStateVersionInput)
  .output(GetStateVersionOutput);

export const listStateVersions = createContract()
  .auth
  .route({
    path: "/workspaces/{workspaceId}/state-versions",
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
