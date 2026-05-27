import { z } from "zod";
import { AuthHeadersSchema, JsonApiDocument, ORPCInput, ORPCOutput, RESOURCE } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION - Configuration Version
// ============================================================

export const ConfigurationVersionAttributesSchema = z.object({
  "auto-queue-runs": z.boolean(),
  speculative: z.boolean(),
  provisional: z.boolean(),
  status: z.enum(["pending", "uploaded", "errored"]),
  "upload-url": z.string().nullable(),
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Create Configuration Version ---

export const CreateConfigurationVersionInput = ORPCInput({
  params: z.object({
    "workspace-id": z.string().describe("Workspace ID"),
  }),
  headers: AuthHeadersSchema,
  body: z.object({
    data: z.object({
      type: z.literal(RESOURCE.CONFIGURATION_VERSIONS),
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
    RESOURCE.CONFIGURATION_VERSIONS,
    ConfigurationVersionAttributesSchema
  ),
});

// --- Get Configuration Version ---

export const GetConfigurationVersionInput = ORPCInput({
  params: z.object({
    version: z.string().describe("Configuration Version ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetConfigurationVersionOutput = ORPCOutput({
  status: z.literal(200),
  body: JsonApiDocument(
    RESOURCE.CONFIGURATION_VERSIONS,
    ConfigurationVersionAttributesSchema
  ),
});

// ============================================================
// Type
// ============================================================

export type ConfigurationVersion = z.infer<ReturnType<typeof JsonApiDocument<typeof RESOURCE.CONFIGURATION_VERSIONS, typeof ConfigurationVersionAttributesSchema>>>
