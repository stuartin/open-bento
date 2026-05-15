import { z } from "zod";
import { createDeserializer } from "@jsonapi-serde/client";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { AuthHeadersSchema } from "../../lib/common.schema";

// --- Get Workspace ---

export const GetWorkspaceInput = z.object({
  params: z.object({
    organization: z.string().describe("Organization name"),
    workspace: z.string().describe("Workspace name"),
  }),
  headers: AuthHeadersSchema,
});

export const WorkspaceAttributesSchema = z.object({
  name: z.string(),
  "execution-mode": z.enum(["remote", "local", "agent"]),
  "terraform-version": z.string().nullable(),
  locked: z.boolean().optional(),
});

export type Workspace = z.infer<typeof WorkspaceAttributesSchema> & {
  id: string;
  organizationId?: string;
  currentStateVersionId?: string;
};

export const GetWorkspaceOutput = z.object({
  data: z.object({
    type: z.literal("workspaces"),
    id: z.string(),
    attributes: WorkspaceAttributesSchema,
  }),
});

export const serializeWorkspace: EntitySerializer<Workspace> = {
  getId: (workspace) => workspace.id,
  serialize: (workspace) => ({
    attributes: {
      name: workspace.name,
      "execution-mode": workspace["execution-mode"],
      "terraform-version": workspace["terraform-version"],
      locked: workspace.locked,
    },
    relationships: {
      ...(workspace.organizationId && {
        organization: {
          data: { type: "organizations", id: workspace.organizationId },
        },
      }),
      ...(workspace.currentStateVersionId && {
        "current-state-version": {
          data: { type: "state-versions", id: workspace.currentStateVersionId },
        },
      }),
    },
  }),
};

export const deserializeWorkspace = createDeserializer({
  type: "workspaces",
  cardinality: "one",
  attributesSchema: WorkspaceAttributesSchema,
  relationships: {
    organization: {
      type: "organizations",
      cardinality: "one",
    },
    "current-state-version": {
      type: "state-versions",
      cardinality: "one",
    },
  },
});

// --- List Workspaces ---

export const ListWorkspacesInput = z.object({
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

export const ListWorkspacesOutput = z.object({
  data: z.array(
    z.object({
      type: z.literal("workspaces"),
      id: z.string(),
      attributes: WorkspaceAttributesSchema,
    })
  ),
});
