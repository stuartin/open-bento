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
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.STATE_VERSION]

export const getCurrentStateVersion = createContract()
  .auth
  .route({
    tags,
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
    tags,
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
    tags,
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
