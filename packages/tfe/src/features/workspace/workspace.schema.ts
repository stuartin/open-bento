import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Workspace
// ============================================================

export const WorkspaceAttributesSchema = z.object({
  name: z.string(),
  "execution-mode": z.enum(["remote", "local", "agent"]),
  "terraform-version": z.string(),
  locked: z.boolean().optional(),
  permissions: z.object({
    "can-queue-run": z.boolean()
  })
});

export const WorkspaceResourceSchema = JsonApiDocument(
  RESOURCE.WORKSPACES,
  WorkspaceAttributesSchema
)

export const WorkspaceCollectionSchema = JsonApiCollection(
  RESOURCE.WORKSPACES,
  WorkspaceAttributesSchema
)

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Create Workspace ---

export const CreateWorkspaceInput = ORPCInput({
  headers: AuthHeadersSchema,
  params: z.object({
    organization: z.string()
  }),
  body: z.object({
    data: z.object({
      type: z.literal(RESOURCE.WORKSPACES),
      attributes: z.object({
        "name": z.string(),
      }),
    }),
  }),
});

export const CreateWorkspaceOutput = ORPCOutput({
  status: z.literal(200),
  body: WorkspaceResourceSchema
});

// --- Update Workspace ---

export const UpdateWorkspaceInput = ORPCInput({
  headers: AuthHeadersSchema,
  params: z.object({
    "workspace-id": z.string()
  }),
  body: z.object({
    data: z.object({
      type: z.literal(RESOURCE.WORKSPACES),
      attributes: WorkspaceAttributesSchema.partial()
    }),
  }),
});

export const UpdateWorkspaceOutput = ORPCOutput({
  status: z.literal(200),
  body: WorkspaceResourceSchema
});

// --- Get Workspace ---

export const GetWorkspaceInput = ORPCInput({
  params: z.object({
    organization: z.string().describe("Organization name"),
    workspace: z.string().describe("Workspace name"),
  }),
  headers: AuthHeadersSchema,
});

export const GetWorkspaceOutput = ORPCOutput({
  status: z.literal(200),
  body: WorkspaceResourceSchema
});

// --- List Workspaces ---

export const ListWorkspacesInput = ORPCInput({
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

export const ListWorkspacesOutput = ORPCOutput({
  status: z.literal(200),
  body: WorkspaceCollectionSchema
});

// ============================================================
// Type
// ============================================================

export type Workspace = z.infer<typeof WorkspaceResourceSchema>
