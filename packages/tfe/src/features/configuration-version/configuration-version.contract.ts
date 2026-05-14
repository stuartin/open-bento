import { z } from "zod";
import { oc } from "@orpc/contract";
import {
  CreateConfigurationVersionInput,
  CreateConfigurationVersionOutput,
  GetConfigurationVersionInput,
  GetConfigurationVersionOutput,
} from "./configuration-version.schema";

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
      body: CreateConfigurationVersionOutput,
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
      body: GetConfigurationVersionOutput,
    })
  );

// --- Contract Router ---

export const configurationVersionContract = {
  create: createConfigurationVersion,
  get: getConfigurationVersion,
};
