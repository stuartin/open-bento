import { oc } from "@orpc/contract";
import {
  GetTaskResultInput,
  GetTaskResultOutput,
} from "./task-result.schema";

// --- Contracts ---

export const getTaskResult = oc
  .route({
    path: "/api/v2/task-results/{taskResultId}",
    method: "GET",
    inputStructure: "detailed",
    outputStructure: "detailed",
  })
  .input(GetTaskResultInput)
  .output(GetTaskResultOutput);

// --- Contract Router ---

export const taskResultContract = {
  get: getTaskResult,
};
