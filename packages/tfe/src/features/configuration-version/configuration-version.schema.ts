import { z } from "zod";
import type { EntitySerializer } from "@jsonapi-serde/server/response";
import { createDeserializer } from "@jsonapi-serde/client";
import { AuthHeadersSchema } from "../../lib/common.schema";

// ============================================================
// ENTITY DEFINITION
// ============================================================

export const ConfigurationVersionAttributesSchema = z.object({
  "auto-queue-runs": z.boolean(),
  speculative: z.boolean(),
  provisional: z.boolean(),
  status: z.enum(["pending", "uploaded", "errored"]),
  "upload-url": z.string(),
});

export type ConfigurationVersion = z.infer<
  typeof ConfigurationVersionAttributesSchema
> & {
  id: string;
};

export const serializeConfigurationVersion: EntitySerializer<ConfigurationVersion> =
{
  getId: (cv) => cv.id,
  serialize: (cv) => ({
    attributes: {
      "auto-queue-runs": cv["auto-queue-runs"],
      speculative: cv.speculative,
      provisional: cv.provisional,
      status: cv.status,
      "upload-url": cv["upload-url"],
    },
  }),
};

export const deserializeConfigurationVersion = createDeserializer({
  type: "configuration-versions",
  cardinality: "one",
  attributesSchema: ConfigurationVersionAttributesSchema,
});

// ============================================================
// OPERATION-SPECIFIC SCHEMAS
// ============================================================

// --- Create Configuration Version ---

export const CreateConfigurationVersionInput = z.object({
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

export const CreateConfigurationVersionOutput = z.object({
  data: z.object({
    type: z.literal("configuration-versions"),
    id: z.string(),
    attributes: ConfigurationVersionAttributesSchema,
  }),
});

// --- Get Configuration Version ---

export const GetConfigurationVersionInput = z.object({
  params: z.object({
    configurationVersionId: z.string().describe("Configuration Version ID"),
  }),
  headers: AuthHeadersSchema,
});

export const GetConfigurationVersionOutput = z.object({
  data: z.object({
    type: z.literal("configuration-versions"),
    id: z.string(),
    attributes: ConfigurationVersionAttributesSchema,
  }),
});
