import { oc } from "@orpc/contract";
import {
  GetCurrentStateVersionInput,
  GetCurrentStateVersionOutput,
  GetStateVersionInput,
  GetStateVersionOutput,
  ListStateVersionsInput,
  ListStateVersionsOutput,
} from "./state-version.schema";

// --- Contracts ---

export const getCurrentStateVersion = oc
  .route({
    path: "/workspaces/{workspaceId}/current-state-version",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetCurrentStateVersionInput)
  .output(GetCurrentStateVersionOutput);

export const getStateVersion = oc
  .route({
    path: "/state-versions/{stateVersionId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetStateVersionInput)
  .output(GetStateVersionOutput);

export const listStateVersions = oc
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
