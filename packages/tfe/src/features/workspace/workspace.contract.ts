import {
  CreateWorkspaceInput,
  CreateWorkspaceOutput,
  GetWorkspaceInput,
  GetWorkspaceOutput,
  ListWorkspacesInput,
  ListWorkspacesOutput,
  UpdateWorkspaceInput,
  UpdateWorkspaceOutput,
} from "./workspace.schema";
import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";

// --- Contracts ---

export const createWorkspace = createContract()
  .auth
  .route({
    path: "/organizations/{organization}/workspaces",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CreateWorkspaceInput)
  .output(CreateWorkspaceOutput)
  .errors({ NOT_FOUND })

export const updateWorkspace = createContract()
  .auth
  .route({
    path: "/workspaces/{workspace-id}",
    method: "PATCH",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(UpdateWorkspaceInput)
  .output(UpdateWorkspaceOutput)
  .errors({ NOT_FOUND })

export const getWorkspace = createContract()
  .auth
  .route({
    path: "/organizations/{organization}/workspaces/{workspace}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetWorkspaceInput)
  .output(GetWorkspaceOutput)
  .errors({ NOT_FOUND })

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
  create: createWorkspace,
  update: updateWorkspace,
  get: getWorkspace,
  list: listWorkspaces,
};
