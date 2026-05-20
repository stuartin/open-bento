import {
  GetTaskResultInput,
  GetTaskResultOutput,
} from "./task-result.schema";
import { createContract } from "../../lib/contract";

// --- Contracts ---

export const getTaskResult = createContract()
  .auth
  .route({
    path: "/task-results/{taskResultId}",
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
