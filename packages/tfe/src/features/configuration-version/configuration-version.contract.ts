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
    path: "/workspaces/{workspaceId}/configuration-versions",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CreateConfigurationVersionInput)
  .output(CreateConfigurationVersionOutput);

export const getConfigurationVersion = oc
  .route({
    path: "/configuration-versions/{configurationVersionId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetConfigurationVersionInput)
  .output(GetConfigurationVersionOutput);

// --- Contract Router ---

export const configurationVersionContract = {
  create: createConfigurationVersion,
  get: getConfigurationVersion,
};
