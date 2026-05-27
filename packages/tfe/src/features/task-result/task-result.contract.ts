import {
  GetTaskResultInput,
  GetTaskResultOutput,
} from "./task-result.schema";
import { createContract } from "../../lib/contract";
import { TAG } from "../../lib/common.schema";

// --- Contracts ---

const tags = [TAG.TASK_RESULT]

export const getTaskResult = createContract()
  .auth
  .route({
    tags,
    path: "/task-results/{result}",
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
