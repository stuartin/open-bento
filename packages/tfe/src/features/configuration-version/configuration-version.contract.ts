import { createContract } from "../../lib/contract";
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
    path: "/workspaces/{workspace}/configuration-versions",
    method: "POST",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(CreateConfigurationVersionInput)
  .output(CreateConfigurationVersionOutput);

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
