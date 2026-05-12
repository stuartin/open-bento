import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  AuthHeadersSchema,
  JsonApiDocument,
} from "../../lib/common.schema";
import { ConfigurationVersionAttributesSchema } from "./configuration-version.schema";

// --- Input Types ---

const CreateConfigurationVersionInput = z.object({
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

const GetConfigurationVersionInput = z.object({
  params: z.object({
    configurationVersionId: z.string().describe("Configuration Version ID"),
  }),
  headers: AuthHeadersSchema,
});

// --- Output Types ---

const ConfigurationVersionOutputSchema = JsonApiDocument(
  "configuration-versions",
  ConfigurationVersionAttributesSchema
);

// --- Contracts ---

export const createConfigurationVersion = oc
  .route({
    path: "/api/v2/workspaces/{workspaceId}/configuration-versions",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CreateConfigurationVersionInput)
  .output(
    z.object({
      status: z.literal(201),
      body: ConfigurationVersionOutputSchema,
    })
  );

export const getConfigurationVersion = oc
  .route({
    path: "/api/v2/configuration-versions/{configurationVersionId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetConfigurationVersionInput)
  .output(
    z.object({
      status: z.literal(200),
      body: ConfigurationVersionOutputSchema,
    })
  );

// --- Contract Router ---

export const configurationVersionContract = {
  create: createConfigurationVersion,
  get: getConfigurationVersion,
};
