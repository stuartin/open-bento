import { oc } from "@orpc/contract";
import {
  GetWorkspaceInput,
  GetWorkspaceOutput,
  ListWorkspacesInput,
  ListWorkspacesOutput,
} from "./workspace.schema";

// --- Contracts ---

export const getWorkspace = oc
  .route({
    path: "/api/v2/organizations/{organization}/workspaces/{workspace}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetWorkspaceInput)
  .output(GetWorkspaceOutput);

export const listWorkspaces = oc
  .route({
    path: "/api/v2/organizations/{organization}/workspaces",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListWorkspacesInput)
  .output(ListWorkspacesOutput);

// --- Contract Router ---

export const workspaceContract = {
  get: getWorkspace,
  list: listWorkspaces,
};
