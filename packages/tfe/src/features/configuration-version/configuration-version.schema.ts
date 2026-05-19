import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Configuration Version
// ============================================================

export const ConfigurationVersionAttributesSchema = z.object({
  "auto-queue-runs": z.boolean(),
  speculative: z.boolean(),
  provisional: z.boolean(),
  status: z.enum(["pending", "uploaded", "errored"]),
  "upload-url": z.string(),
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Create Configuration Version ---

export const CreateConfigurationVersionInput = ORPCInput({
  params: z.object({
    workspaceId: z.string().describe("Workspace ID"),
  }),
  headers: AuthHeadersSchema,
  body: z.object({
    data: z.object({
      type: z.literal("configuration-versions"),
      attributes: z.object({
        "auto-queue-runs": z.boolean().default(false),
        provisional: z.boolean().default(false),
        speculative: z.boolean(),
      }),
    }),
  }),
});

export const CreateConfigurationVersionOutput = ORPCOutput({
  status: z.literal(201),
  body: JsonApiDocument(
    "configuration-versions",
    ConfigurationVersionAttributesSchema
  ),
});

// --- Get Configuration Version ---

export const GetConfigurationVersionInput = ORPCInput({
  params: z.object({
    configurationVersionId: z.string().describe("Configuration Version ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetConfigurationVersionOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    "configuration-versions",
    ConfigurationVersionAttributesSchema
  ),
});
