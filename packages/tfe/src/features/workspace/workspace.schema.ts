import { z } from "zod";
import { AuthHeadersSchema, JsonApiCollection, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Workspace
// ============================================================

export const WorkspaceAttributesSchema = z.object({
  name: z.string(),
  "execution-mode": z.enum(["remote", "local", "agent"]),
  "terraform-version": z.string().nullable(),
  locked: z.boolean().optional(),
  permissions: z.object({
    "can-queue-run": z.boolean()
  })
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

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
  body: JsonApiDocument(
    "workspaces",
    WorkspaceAttributesSchema
  ),
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
  body: JsonApiCollection(
    "workspaces",
    WorkspaceAttributesSchema
  ),
});
