import {
  GetLogInput,
  GetLogOutput
} from "./read-log.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.RUN]

export const getLog = createContract()
  .pub
  .route({
    tags,
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
