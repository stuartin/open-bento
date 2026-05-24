import {
  GetLogInput,
  GetLogOutput
} from "./read-log.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getLog = createContract()
  .pub
  .route({
    path: "/read-logs/{log}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetLogInput)
  .output(GetLogOutput)

// --- Contract Router ---

export const readLogContract = {
  get: getLog,
};
