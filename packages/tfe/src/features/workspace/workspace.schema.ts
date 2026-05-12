import { z } from "zod";
import { createDeserializer } from "@jsonapi-serde/client";
import { type EntitySerializer } from "@jsonapi-serde/server/response"

// Schema
export const WorkspaceAttributesSchema = z.object({
  name: z.string(),
  "execution-mode": z.enum(["remote", "local", "agent"]),
  "terraform-version": z.string().nullable(),
  locked: z.boolean().optional(),
});

// Type
export type Workspace = z.infer<typeof WorkspaceAttributesSchema> & {
  id: string;
  organizationId?: string;
  currentStateVersionId?: string;
};

// Serializer
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

// Deserializers
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

export const deserializeWorkspaces = createDeserializer({
  type: "workspaces",
  cardinality: "many",
  attributesSchema: WorkspaceAttributesSchema,
});
