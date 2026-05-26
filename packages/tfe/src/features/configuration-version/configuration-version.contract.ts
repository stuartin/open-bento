import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";
import {
  CreateConfigurationVersionInput,
  CreateConfigurationVersionOutput,
  GetConfigurationVersionInput,
  GetConfigurationVersionOutput,
} from "./configuration-version.schema";

// --- Contracts ---

export const createConfigurationVersion = createContract()
  .auth
  .route({
    path: "/workspaces/{workspace-id}/configuration-versions",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CreateConfigurationVersionInput)
  .output(CreateConfigurationVersionOutput)
  .errors({ NOT_FOUND })

export const getConfigurationVersion = createContract()
  .auth
  .route({
    path: "/configuration-versions/{version}",
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
