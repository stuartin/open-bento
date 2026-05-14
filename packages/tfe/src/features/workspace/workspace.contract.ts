import { z } from "zod";
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
  .output(
    z.object({
      status: z.literal(200),
      body: GetWorkspaceOutput,
    })
  );

export const listWorkspaces = oc
  .route({
    path: "/api/v2/organizations/{organization}/workspaces",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(ListWorkspacesInput)
  .output(
    z.object({
      status: z.literal(200),
      body: ListWorkspacesOutput,
    })
  );

// --- Contract Router ---

export const workspaceContract = {
  get: getWorkspace,
  list: listWorkspaces,
};
