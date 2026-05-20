import {
  GetWorkspaceInput,
  GetWorkspaceOutput,
  ListWorkspacesInput,
  ListWorkspacesOutput,
} from "./workspace.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getWorkspace = createContract()
  .auth
  .route({
    path: "/organizations/{organization}/workspaces/{workspace}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetWorkspaceInput)
  .output(GetWorkspaceOutput);

export const listWorkspaces = createContract()
  .auth
  .route({
    path: "/organizations/{organization}/workspaces",
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
