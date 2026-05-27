import { createContract } from "../../lib/contract";
import { NOT_FOUND } from "../../lib/errors";
import {
  CreateConfigurationVersionInput,
  CreateConfigurationVersionOutput,
  GetConfigurationVersionInput,
  GetConfigurationVersionOutput,
} from "./configuration-version.schema";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.CONFIGURATION_VERSION]

export const createConfigurationVersion = createContract()
  .auth
  .route({
    tags,
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
    tags,
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
