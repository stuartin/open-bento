import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  AuthHeadersSchema,
  JsonApiDocument,
  JsonApiCollection,
} from "../../lib/common.schema";
import { WorkspaceAttributesSchema } from "./workspace.schema";

// --- Input Types ---

const GetWorkspaceInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
    workspace: z.string().describe("Workspace name"),
  }),
  headers: AuthHeadersSchema,
});

const ListWorkspacesInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
  }),
  query: z
    .object({
      "page[number]": z.number().int().min(1).optional(),
      "page[size]": z.number().int().min(1).max(100).optional(),
      search: z.string().optional(),
    })
    .optional(),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const WorkspaceOutputSchema = JsonApiDocument(
  "workspaces",
  WorkspaceAttributesSchema
);
const WorkspacesOutputSchema = JsonApiCollection(
  "workspaces",
  WorkspaceAttributesSchema
);

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
      body: WorkspaceOutputSchema,
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
      body: WorkspacesOutputSchema,
    })
  );

// --- Contract Router ---

export const workspaceContract = {
  get: getWorkspace,
  list: listWorkspaces,
};
